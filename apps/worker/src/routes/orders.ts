import { Hono } from 'hono'
import { CreateOrderSchema, TransitionRequestSchema } from '@qa-ux/contracts'
import { createOrder, createQuote, transitionOrder } from '@qa-ux/domain'
import type { WorkerEnv } from '../types/worker-env.js'
import { businessMiddleware } from '../middleware/business.js'
import { zodErrors } from './errors.js'
import {
  getOrder,
  getQuote,
  listEvents,
  listOrders,
  listQuotes,
  listQuotesForOrder,
  saveEvent,
  saveOrder,
  saveQuote,
} from '../store/memory.js'

const orders = new Hono<{ Bindings: WorkerEnv }>()

orders.use('*', businessMiddleware)

orders.get('/', (c) => {
  const businessId = c.get('businessId')
  return c.json({ data: listOrders(businessId), quotes: listQuotes(businessId) })
})

orders.post('/', async (c) => {
  const businessId = c.get('businessId')
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = CreateOrderSchema.safeParse({ ...(body as object), businessId })
  if (!parsed.success) return c.json({ error: 'Invalid order', errors: zodErrors(parsed.error) }, 400)

  const order = createOrder(parsed.data)
  saveOrder(order)
  return c.json({ order }, 201)
})

orders.get('/:id', (c) => {
  const businessId = c.get('businessId')
  const order = getOrder(businessId, c.req.param('id'))
  if (!order) return c.json({ error: 'Order not found' }, 404)
  return c.json({
    order,
    events: listEvents(businessId, order.id),
    quotes: listQuotesForOrder(businessId, order.id),
  })
})

orders.post('/:id/transition', async (c) => {
  const businessId = c.get('businessId')
  const order = getOrder(businessId, c.req.param('id'))
  if (!order) return c.json({ error: 'Order not found' }, 404)

  const body: unknown = await c.req.json().catch(() => null)
  const parsed = TransitionRequestSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Invalid transition', errors: zodErrors(parsed.error) }, 400)
  }

  const { event, reason, quote: quoteDraft } = parsed.data
  if (event === 'issue_quote' && !quoteDraft) {
    return c.json({ error: 'A quote is required to issue a quote.' }, 400)
  }

  let pendingQuote: ReturnType<typeof createQuote> | null = null
  if (event === 'issue_quote' && quoteDraft) {
    const version = listQuotesForOrder(businessId, order.id).length + 1
    pendingQuote = createQuote({
      ...quoteDraft,
      orderId: order.id,
      businessId,
      version,
    })
    if (!pendingQuote.ok) return c.json({ error: 'Invalid quote', errors: pendingQuote.errors }, 400)
  }

  const result = transitionOrder(order, event, reason ? { reason } : {})
  if (!result.ok) return c.json({ error: result.error }, 409)

  let next = result.order
  if (pendingQuote?.ok) {
    saveQuote(pendingQuote.quote)
    next = { ...next, quoteId: pendingQuote.quote.id }
  }

  if (event === 'accept' && next.quoteId) {
    const quote = getQuote(businessId, next.quoteId)
    if (quote) {
      const acceptedAt = new Date()
      saveQuote({ ...quote, acceptedAt, updatedAt: acceptedAt })
    }
  }

  saveOrder(next)
  saveEvent(result.activity)
  return c.json({ order: next, activity: result.activity })
})

export { orders }
