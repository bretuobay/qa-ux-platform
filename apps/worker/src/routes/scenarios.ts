import { Hono } from 'hono'
import { AddEvidenceSchema, CreateScenarioSchema, SaveExecutionSchema } from '@qa-ux/contracts'
import {
  addEvidence,
  canWork,
  coverage,
  markEvidence,
  saveExecutionDraft,
  scenarioAfterExecution,
  submitExecution,
} from '@qa-ux/domain'
import type { WorkerEnv } from '../types/worker-env.js'
import { businessMiddleware } from '../middleware/business.js'
import { zodErrors } from './errors.js'
import {
  getAssignmentForTester,
  getExecution,
  getOrder,
  getScenario,
  listExecutions,
  listScenarios,
  saveExecution,
  saveScenario,
} from '../store/memory.js'

const scenarios = new Hono<{ Bindings: WorkerEnv }>()
scenarios.use('*', businessMiddleware)

scenarios.get('/', (c) => {
  const businessId = c.get('businessId')
  const orderId = c.req.query('orderId')
  if (!orderId || !getOrder(businessId, orderId)) return c.json({ error: 'Order not found' }, 404)
  const data = listScenarios(businessId, orderId)
  return c.json({ data, coverage: coverage(data) })
})

scenarios.post('/', async (c) => {
  const businessId = c.get('businessId')
  const orderId = c.req.query('orderId')
  if (!orderId || !getOrder(businessId, orderId)) return c.json({ error: 'Order not found' }, 404)
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = CreateScenarioSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid scenario', errors: zodErrors(parsed.error) }, 400)
  const now = new Date()
  const scenario = {
    ...parsed.data,
    id: crypto.randomUUID(),
    businessId,
    orderId,
    status: 'not_run' as const,
    createdAt: now,
    updatedAt: now,
  }
  saveScenario(scenario)
  return c.json({ scenario }, 201)
})

const executions = new Hono<{ Bindings: WorkerEnv }>()
executions.use('*', businessMiddleware)

executions.post('/', async (c) => {
  const businessId = c.get('businessId')
  const testerId = c.req.header('x-tester-id')
  if (!testerId) return c.json({ error: 'X-Tester-Id header is required' }, 400)
  const body = (await c.req.json().catch(() => null)) as { scenarioId?: string; assignmentId?: string } | null
  if (!body?.scenarioId || !body.assignmentId) {
    return c.json({ error: 'scenarioId and assignmentId are required' }, 400)
  }
  const scenario = getScenario(businessId, body.scenarioId)
  const assignment = getAssignmentForTester(testerId, body.assignmentId)
  if (!scenario || !assignment || assignment.orderId !== scenario.orderId) {
    return c.json({ error: 'Scenario or assignment not found' }, 404)
  }
  if (!canWork(assignment.status)) return c.json({ error: 'Accept the assignment before recording work.' }, 409)
  const now = new Date()
  const execution = {
    id: crypto.randomUUID(),
    businessId,
    orderId: scenario.orderId,
    scenarioId: scenario.id,
    assignmentId: assignment.id,
    testerId,
    status: 'draft' as const,
    evidence: [],
    createdAt: now,
    updatedAt: now,
    ...(scenario.buildId ? { buildId: scenario.buildId } : {}),
    ...(scenario.environmentId ? { environmentId: scenario.environmentId } : {}),
  }
  saveExecution(execution)
  return c.json({ execution }, 201)
})

executions.patch('/:id', async (c) => {
  const businessId = c.get('businessId')
  const testerId = c.req.header('x-tester-id')
  const execution = getExecution(businessId, c.req.param('id'))
  if (!execution || execution.testerId !== testerId) return c.json({ error: 'Execution not found' }, 404)
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = SaveExecutionSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid execution', errors: zodErrors(parsed.error) }, 400)
  const result = saveExecutionDraft(execution, {
    ...(parsed.data.outcome ? { outcome: parsed.data.outcome } : {}),
    ...(typeof parsed.data.notes === 'string' ? { notes: parsed.data.notes } : {}),
  })
  if (!result.ok) return c.json({ error: result.error }, 409)
  saveExecution(result.execution)
  return c.json({ execution: result.execution })
})

executions.post('/:id/evidence', async (c) => {
  const businessId = c.get('businessId')
  const testerId = c.req.header('x-tester-id')
  const execution = getExecution(businessId, c.req.param('id'))
  if (!execution || execution.testerId !== testerId) return c.json({ error: 'Execution not found' }, 404)
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = AddEvidenceSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid evidence', errors: zodErrors(parsed.error) }, 400)
  const result = addEvidence(execution, parsed.data)
  if (!result.ok) return c.json({ error: result.error }, 400)
  saveExecution(result.execution)
  return c.json({ execution: result.execution, evidence: result.evidence }, 201)
})

executions.post('/:id/evidence/:evidenceId', async (c) => {
  const businessId = c.get('businessId')
  const testerId = c.req.header('x-tester-id')
  const execution = getExecution(businessId, c.req.param('id'))
  if (!execution || execution.testerId !== testerId) return c.json({ error: 'Execution not found' }, 404)
  const body = (await c.req.json().catch(() => null)) as { status?: 'uploaded' | 'failed' | 'pending' } | null
  if (!body?.status) return c.json({ error: 'status is required' }, 400)
  const result = markEvidence(execution, c.req.param('evidenceId'), body.status)
  if (!result.ok) return c.json({ error: result.error }, 409)
  saveExecution(result.execution)
  return c.json({ execution: result.execution })
})

executions.post('/:id/submit', (c) => {
  const businessId = c.get('businessId')
  const testerId = c.req.header('x-tester-id')
  const execution = getExecution(businessId, c.req.param('id'))
  if (!execution || execution.testerId !== testerId) return c.json({ error: 'Execution not found' }, 404)
  const result = submitExecution(execution)
  if (!result.ok) return c.json({ error: result.error }, 400)
  saveExecution(result.execution)
  const scenario = getScenario(businessId, result.execution.scenarioId)
  if (scenario) saveScenario(scenarioAfterExecution(scenario, result.execution))
  return c.json({ execution: result.execution, scenario: scenario ? scenarioAfterExecution(scenario, result.execution) : null })
})

executions.get('/', (c) => {
  const businessId = c.get('businessId')
  const scenarioId = c.req.query('scenarioId')
  return c.json({ data: listExecutions(businessId, scenarioId) })
})

export { scenarios, executions }
