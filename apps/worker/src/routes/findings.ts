import { Hono } from 'hono'
import {
  AddFindingCommentSchema,
  AppealFindingSchema,
  CreateFindingSchema,
  DEV_BUSINESS_ID,
  DEV_OPERATOR_ID,
  FindingTypeSchema,
  ImpactSchema,
  RecordRetestSchema,
  ReviewFindingSchema,
  ReviewOutcomeSchema,
  SetPrioritySchema,
  SeveritySchema,
} from '@qa-ux/contracts'
import type { CreateFindingDraft, FindingFilter } from '@qa-ux/domain'
import {
  addComment,
  appealFinding,
  createFinding,
  filterFindings,
  recordRetest,
  reviewFinding,
  setCustomerPriority,
} from '@qa-ux/domain'
import type { WorkerEnv } from '../types/worker-env.js'
import { businessMiddleware } from '../middleware/business.js'
import { zodErrors } from './errors.js'
import {
  getBuild,
  getFinding,
  getOrder,
  listAssignments,
  listFindings,
  saveFinding,
} from '../store/memory.js'

const findings = new Hono<{ Bindings: WorkerEnv }>()
findings.use('*', businessMiddleware)

const UUID = /^[0-9a-f-]{36}$/i

function headerId(value: string | undefined): string | null {
  if (!value || !UUID.test(value)) return null
  return value
}

function operatorId(header: string | undefined): string {
  return headerId(header) ?? DEV_OPERATOR_ID
}

findings.get('/', (c) => {
  const businessId = c.get('businessId')
  const orderId = c.req.query('orderId')
  const filter: FindingFilter = {}
  const type = c.req.query('type')
  const severity = c.req.query('severity')
  const impact = c.req.query('impact')
  const outcome = c.req.query('outcome')
  const buildId = c.req.query('buildId')
  const environmentId = c.req.query('environmentId')
  const journey = c.req.query('journey')
  if (type) {
    const parsed = FindingTypeSchema.safeParse(type)
    if (!parsed.success) return c.json({ error: 'Unknown finding type' }, 400)
    filter.type = parsed.data
  }
  if (severity) {
    const parsed = SeveritySchema.safeParse(severity)
    if (!parsed.success) return c.json({ error: 'Unknown severity' }, 400)
    filter.severity = parsed.data
  }
  if (impact) {
    const parsed = ImpactSchema.safeParse(impact)
    if (!parsed.success) return c.json({ error: 'Unknown impact' }, 400)
    filter.impact = parsed.data
  }
  if (outcome) {
    if (outcome === 'unreviewed') filter.outcome = 'unreviewed'
    else {
      const parsed = ReviewOutcomeSchema.safeParse(outcome)
      if (!parsed.success) return c.json({ error: 'Unknown review outcome' }, 400)
      filter.outcome = parsed.data
    }
  }
  if (buildId) filter.buildId = buildId
  if (environmentId) filter.environmentId = environmentId
  if (journey) filter.journey = journey
  const data = filterFindings(listFindings(businessId, orderId), filter)
  return c.json({ data })
})

findings.post('/', async (c) => {
  const businessId = c.get('businessId')
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = CreateFindingSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid finding', errors: zodErrors(parsed.error) }, 400)
  const order = getOrder(businessId, parsed.data.orderId)
  if (!order) return c.json({ error: 'Order not found' }, 404)
  const build = getBuild(businessId, parsed.data.buildId)
  if (!build) return c.json({ error: 'Build not found' }, 404)

  const tester = headerId(c.req.header('x-tester-id'))
  let reporterId = operatorId(c.req.header('x-operator-id'))
  if (tester) {
    const accepted = listAssignments(businessId, order.id).some(
      (assignment) => assignment.testerId === tester && assignment.status === 'accepted'
    )
    if (!accepted) return c.json({ error: 'Accept the assignment before filing a finding.' }, 403)
    reporterId = tester
  }

  const draft: CreateFindingDraft = {
    businessId,
    orderId: order.id,
    reporterId,
    type: parsed.data.type,
    title: parsed.data.title,
    steps: parsed.data.steps,
    expectedBehavior: parsed.data.expectedBehavior,
    actualBehavior: parsed.data.actualBehavior,
    buildId: parsed.data.buildId,
    reproducibility: parsed.data.reproducibility,
  }
  if (parsed.data.scenarioId) draft.scenarioId = parsed.data.scenarioId
  if (parsed.data.executionId) draft.executionId = parsed.data.executionId
  if (parsed.data.environmentId) draft.environmentId = parsed.data.environmentId
  if (parsed.data.journey) draft.journey = parsed.data.journey
  if (parsed.data.severity) draft.severity = parsed.data.severity
  if (parsed.data.impact) draft.impact = parsed.data.impact

  const created = createFinding(draft)
  if (!created.ok) return c.json({ error: created.error }, 400)
  saveFinding(created.finding)
  return c.json({ finding: created.finding }, 201)
})

findings.get('/:id', (c) => {
  const finding = getFinding(c.get('businessId'), c.req.param('id'))
  if (!finding) return c.json({ error: 'Finding not found' }, 404)
  return c.json({ finding })
})

findings.post('/:id/review', async (c) => {
  if (c.req.header('x-tester-id')) return c.json({ error: 'Testers do not review findings.' }, 403)
  const finding = getFinding(c.get('businessId'), c.req.param('id'))
  if (!finding) return c.json({ error: 'Finding not found' }, 404)
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = ReviewFindingSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid review', errors: zodErrors(parsed.error) }, 400)
  const reviewed = reviewFinding(finding, {
    outcome: parsed.data.outcome,
    reason: parsed.data.reason,
    reviewerId: operatorId(c.req.header('x-operator-id')),
  })
  if (!reviewed.ok) return c.json({ error: reviewed.error }, 409)
  saveFinding(reviewed.finding)
  return c.json({ finding: reviewed.finding })
})

findings.post('/:id/appeal', async (c) => {
  const finding = getFinding(c.get('businessId'), c.req.param('id'))
  if (!finding) return c.json({ error: 'Finding not found' }, 404)
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = AppealFindingSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid appeal', errors: zodErrors(parsed.error) }, 400)
  const appealed = appealFinding(finding, parsed.data.reason)
  if (!appealed.ok) return c.json({ error: appealed.error }, 409)
  saveFinding(appealed.finding)
  return c.json({ finding: appealed.finding })
})

findings.post('/:id/priority', async (c) => {
  if (c.req.header('x-tester-id')) return c.json({ error: 'The customer sets priority.' }, 403)
  const finding = getFinding(c.get('businessId'), c.req.param('id'))
  if (!finding) return c.json({ error: 'Finding not found' }, 404)
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = SetPrioritySchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid priority', errors: zodErrors(parsed.error) }, 400)
  const next = setCustomerPriority(finding, parsed.data.priority)
  saveFinding(next)
  return c.json({ finding: next })
})

findings.post('/:id/retest', async (c) => {
  if (c.req.header('x-tester-id')) return c.json({ error: 'The operator records a retest.' }, 403)
  const businessId = c.get('businessId')
  const finding = getFinding(businessId, c.req.param('id'))
  if (!finding) return c.json({ error: 'Finding not found' }, 404)
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = RecordRetestSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid retest', errors: zodErrors(parsed.error) }, 400)
  if (!getBuild(businessId, parsed.data.buildId)) return c.json({ error: 'Build not found' }, 404)
  const recorded = recordRetest(finding, {
    result: parsed.data.result,
    buildId: parsed.data.buildId,
    ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
  })
  if (!recorded.ok) return c.json({ error: recorded.error }, 409)
  saveFinding(recorded.finding)
  return c.json({ finding: recorded.finding })
})

findings.post('/:id/comments', async (c) => {
  const finding = getFinding(c.get('businessId'), c.req.param('id'))
  if (!finding) return c.json({ error: 'Finding not found' }, 404)
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = AddFindingCommentSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid comment', errors: zodErrors(parsed.error) }, 400)
  const tester = headerId(c.req.header('x-tester-id'))
  const commented = addComment(finding, tester
    ? { body: parsed.data.body, authorId: tester, authorRole: 'tester' }
    : c.req.header('x-operator-id')
      ? { body: parsed.data.body, authorId: operatorId(c.req.header('x-operator-id')), authorRole: 'operator' }
      : { body: parsed.data.body, authorId: DEV_BUSINESS_ID, authorRole: 'customer' })
  if (!commented.ok) return c.json({ error: commented.error }, 400)
  saveFinding(commented.finding)
  return c.json({ finding: commented.finding })
})

export { findings }
