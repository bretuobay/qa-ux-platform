import { z } from 'zod'

export const SCENARIO_STATUSES = ['not_run', 'pass', 'fail', 'blocked', 'not_applicable'] as const
export const ScenarioStatusSchema = z.enum(SCENARIO_STATUSES)
export type ScenarioStatus = z.infer<typeof ScenarioStatusSchema>

export const ScenarioSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  orderId: z.string().uuid(),
  journey: z.string().min(1).max(300),
  prerequisites: z.string().max(2000).optional(),
  steps: z.string().min(1).max(5000),
  expectedOutcome: z.string().min(1).max(2000),
  environmentId: z.string().uuid().optional(),
  buildId: z.string().uuid().optional(),
  status: ScenarioStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Scenario = z.infer<typeof ScenarioSchema>

export const CreateScenarioSchema = ScenarioSchema.omit({
  id: true,
  businessId: true,
  orderId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateScenarioInput = z.input<typeof CreateScenarioSchema>

export const EXECUTION_OUTCOMES = ['pass', 'fail', 'blocked', 'not_applicable'] as const
export const ExecutionOutcomeSchema = z.enum(EXECUTION_OUTCOMES)
export type ExecutionOutcome = z.infer<typeof ExecutionOutcomeSchema>

export const EvidenceStatusSchema = z.enum(['pending', 'uploaded', 'failed'])
export type EvidenceStatus = z.infer<typeof EvidenceStatusSchema>

export const ExecutionEvidenceSchema = z.object({
  id: z.string().uuid(),
  executionId: z.string().uuid(),
  fileName: z.string().min(1).max(300),
  sizeBytes: z.number().int().positive().max(20_000_000),
  contentType: z.string().min(1).max(100),
  status: EvidenceStatusSchema,
  r2Key: z.string().min(1).max(500),
  createdAt: z.coerce.date(),
})

export type ExecutionEvidence = z.infer<typeof ExecutionEvidenceSchema>

export const ExecutionSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  orderId: z.string().uuid(),
  scenarioId: z.string().uuid(),
  assignmentId: z.string().uuid(),
  testerId: z.string().uuid(),
  buildId: z.string().uuid().optional(),
  environmentId: z.string().uuid().optional(),
  status: z.enum(['draft', 'submitted']),
  outcome: ExecutionOutcomeSchema.optional(),
  notes: z.string().max(5000).optional(),
  evidence: z.array(ExecutionEvidenceSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Execution = z.infer<typeof ExecutionSchema>

export const SaveExecutionSchema = z.object({
  outcome: ExecutionOutcomeSchema.optional(),
  notes: z.string().max(5000).optional(),
})

export const AddEvidenceSchema = z.object({
  fileName: z.string().min(1).max(300),
  sizeBytes: z.number().int().positive().max(20_000_000),
  contentType: z.string().min(1).max(100),
})
