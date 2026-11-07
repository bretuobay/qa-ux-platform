import { Hono } from 'hono'
import { CreateOrderSchema, SaveReadinessSchema, TransitionRequestSchema } from '@qa-ux/contracts'
import { attachBuild, createOrder, createQuote, readinessBlockers, transitionOrder } from '@qa-ux/domain'
import type { TransitionMeta } from '@qa-ux/domain'
import type { WorkerEnv } from '../types/worker-env.js'
import { businessMiddleware } from '../middleware/business.js'
import { zodErrors } from './errors.js'
import {
  getBuild,
  getOrder,
  getQuote,
  hasSubmittedWork,
  listEvents,
  listOrders,
  listQuotes,
  listQuotesForOrder,
  listReadiness,
  saveEvent,
  saveOrder,
  saveQuote,
  saveReadiness,
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
  const items = listReadiness(businessId, order.id)
  return c.json({
    order,
    events: listEvents(businessId, order.id),
    quotes: listQuotesForOrder(businessId, order.id),
    build: order.buildId ? getBuild(businessId, order.buildId) : null,
    readiness: items,
    blockers: readinessBlockers(items, order),
  })
})

orders.put('/:id/readiness', async (c) => {
  const businessId = c.get('businessId')
  const order = getOrder(businessId, c.req.param('id'))
  if (!order) return c.json({ error: 'Order not found' }, 404)
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = SaveReadinessSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid readiness', errors: zodErrors(parsed.error) }, 400)

  const now = new Date()
  for (const [check, passed] of Object.entries(parsed.data.checks)) {
    saveReadiness({
      id: crypto.randomUUID(),
      businessId,
      orderId: order.id,
      check: check as keyof typeof parsed.data.checks,
      passed,
      updatedAt: now,
    })
  }
  const items = listReadiness(businessId, order.id)
  return c.json({ readiness: items, blockers: readinessBlockers(items, order) })
})

orders.post('/:id/build', async (c) => {
  const businessId = c.get('businessId')
  const order = getOrder(businessId, c.req.param('id'))
  if (!order) return c.json({ error: 'Order not found' }, 404)
  const body = (await c.req.json().catch(() => null)) as { buildId?: string } | null
  if (!body?.buildId) return c.json({ error: 'buildId is required' }, 400)
  const build = getBuild(businessId, body.buildId)
  if (!build) return c.json({ error: 'Build not found' }, 404)
  const result = attachBuild(order, build.id, hasSubmittedWork(businessId, order.id))
  if (!result.ok) return c.json({ error: result.error }, 409)
  saveOrder(result.order)
  return c.json({ order: result.order, build })
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

  const meta: TransitionMeta = {}
  if (reason) meta.reason = reason
  if (event === 'mark_ready') {
    meta.readinessClear = readinessBlockers(listReadiness(businessId, order.id), order).length === 0
  }
  const result = transitionOrder(order, event, meta)
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
