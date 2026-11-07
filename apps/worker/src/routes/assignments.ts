import { Hono } from 'hono'
import { OfferAssignmentSchema } from '@qa-ux/contracts'
import {
  acceptAssignment,
  fillSlot,
  isEligible,
  presentAssignment,
  reopenSlot,
  replaceAssignment,
} from '@qa-ux/domain'
import type { WorkerEnv } from '../types/worker-env.js'
import { businessMiddleware } from '../middleware/business.js'
import { zodErrors } from './errors.js'
import {
  getAssignment,
  getAssignmentForTester,
  getOrder,
  getProfile,
  listAssignments,
  listSlots,
  saveAssignment,
  saveSlot,
} from '../store/memory.js'

const assignments = new Hono<{ Bindings: WorkerEnv }>()
assignments.use('*', businessMiddleware)

assignments.get('/', (c) => {
  const businessId = c.get('businessId')
  const orderId = c.req.query('orderId')
  const audience = c.req.query('audience') === 'customer' ? 'customer' : 'operator'
  const data = listAssignments(businessId, orderId).map((assignment) =>
    presentAssignment(assignment, audience)
  )
  return c.json({ data })
})

assignments.post('/', async (c) => {
  const businessId = c.get('businessId')
  const orderId = c.req.query('orderId')
  if (!orderId) return c.json({ error: 'orderId is required' }, 400)
  const order = getOrder(businessId, orderId)
  if (!order) return c.json({ error: 'Order not found' }, 404)
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = OfferAssignmentSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid offer', errors: zodErrors(parsed.error) }, 400)

  const profile = getProfile(parsed.data.testerId)
  if (!profile) return c.json({ error: 'Tester profile not found' }, 404)
  const platform = c.req.query('platform') === 'android' ? 'android' : 'web'
  if (!isEligible(profile, platform)) {
    return c.json({ error: 'Tester is not eligible for this platform.' }, 409)
  }

  const now = new Date()
  const assignment = {
    ...parsed.data,
    id: crypto.randomUUID(),
    businessId,
    orderId,
    status: 'offered' as const,
    createdAt: now,
    updatedAt: now,
  }
  saveAssignment(assignment)

  const open = listSlots(businessId, orderId).find((slot) => slot.status === 'open')
  const slot = open ?? {
    id: crypto.randomUUID(),
    businessId,
    orderId,
    status: 'open' as const,
    createdAt: now,
    updatedAt: now,
  }
  saveSlot(fillSlot(slot, assignment.id))
  return c.json({ assignment: presentAssignment(assignment, 'operator'), slot: fillSlot(slot, assignment.id) }, 201)
})

assignments.post('/:id/accept', (c) => {
  const testerId = c.req.header('x-tester-id')
  if (!testerId) return c.json({ error: 'X-Tester-Id header is required' }, 400)
  const assignment = getAssignmentForTester(testerId, c.req.param('id'))
  if (!assignment) return c.json({ error: 'Assignment not found' }, 404)
  const result = acceptAssignment(assignment)
  if (!result.ok) return c.json({ error: result.error }, 409)
  saveAssignment(result.assignment)
  return c.json({ assignment: presentAssignment(result.assignment, 'tester') })
})

assignments.post('/:id/replace', async (c) => {
  const businessId = c.get('businessId')
  const assignment = getAssignment(businessId, c.req.param('id'))
  if (!assignment) return c.json({ error: 'Assignment not found' }, 404)
  const body = (await c.req.json().catch(() => null)) as { reason?: string } | null
  const result = replaceAssignment(assignment, body?.reason ?? '')
  if (!result.ok) return c.json({ error: result.error }, 400)
  saveAssignment(result.assignment)
  const slot = listSlots(businessId, assignment.orderId).find((item) => item.assignmentId === assignment.id)
  const reopened = slot ? reopenSlot(slot) : null
  if (reopened) saveSlot(reopened)
  return c.json({ assignment: presentAssignment(result.assignment, 'operator'), slot: reopened })
})

export { assignments }
