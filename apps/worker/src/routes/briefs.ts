import { Hono } from 'hono'
import { SubmitBriefSchema } from '@qa-ux/contracts'
import { createBrief, createOrder } from '@qa-ux/domain'
import type { WorkerEnv } from '../types/worker-env.js'
import { businessMiddleware } from '../middleware/business.js'
import { zodErrors } from './errors.js'
import { listBriefs, saveBrief, saveOrder } from '../store/memory.js'

const briefs = new Hono<{ Bindings: WorkerEnv }>()

briefs.use('*', businessMiddleware)

briefs.get('/', (c) => {
  return c.json({ data: listBriefs(c.get('businessId')) })
})

briefs.post('/', async (c) => {
  const businessId = c.get('businessId')
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = SubmitBriefSchema.safeParse({ ...(body as object), businessId })
  if (!parsed.success) return c.json({ error: 'Invalid brief', errors: zodErrors(parsed.error) }, 400)

  const briefResult = createBrief(parsed.data)
  if (!briefResult.ok) return c.json({ error: 'Invalid brief', errors: briefResult.errors }, 400)

  const order = createOrder({
    businessId,
    applicationId: briefResult.brief.applicationId,
    title: parsed.data.title,
    description: briefResult.brief.goals,
    module: briefResult.brief.module,
    briefId: briefResult.brief.id,
    priority: parsed.data.priority,
    testerCount: parsed.data.testerCount,
  })

  saveBrief(briefResult.brief)
  saveOrder(order)
  return c.json({ brief: briefResult.brief, order }, 201)
})

export { briefs }
