import { z } from 'zod'

export const FINDING_TYPES = ['bug', 'usability', 'suggestion', 'assumption'] as const
export const FindingTypeSchema = z.enum(FINDING_TYPES)
export type FindingType = z.infer<typeof FindingTypeSchema>

export const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const
export const SeveritySchema = z.enum(SEVERITIES)
export type Severity = z.infer<typeof SeveritySchema>

export const IMPACTS = ['low', 'medium', 'high'] as const
export const ImpactSchema = z.enum(IMPACTS)
export type FindingImpact = z.infer<typeof ImpactSchema>

export const CUSTOMER_PRIORITIES = ['unset', 'now', 'soon', 'later'] as const
export const CustomerPrioritySchema = z.enum(CUSTOMER_PRIORITIES)
export type CustomerPriority = z.infer<typeof CustomerPrioritySchema>

export const REPRODUCIBILITIES = ['always', 'intermittent', 'once', 'unable'] as const
export const ReproducibilitySchema = z.enum(REPRODUCIBILITIES)
export type Reproducibility = z.infer<typeof ReproducibilitySchema>

export const REVIEW_OUTCOMES = ['accepted', 'clarification', 'duplicate', 'invalid', 'out_of_scope'] as const
export const ReviewOutcomeSchema = z.enum(REVIEW_OUTCOMES)
export type ReviewOutcome = z.infer<typeof ReviewOutcomeSchema>

export const RETEST_RESULTS = ['fixed', 'still_reproducible', 'unable_to_verify'] as const
export const RetestResultSchema = z.enum(RETEST_RESULTS)
export type RetestResult = z.infer<typeof RetestResultSchema>

export const FindingReviewSchema = z.object({
  id: z.string().uuid(),
  findingId: z.string().uuid(),
  outcome: ReviewOutcomeSchema,
  reason: z.string().min(1).max(2000),
  reviewerId: z.string().uuid(),
  createdAt: z.coerce.date(),
})

export type FindingReview = z.infer<typeof FindingReviewSchema>

export const FindingAppealSchema = z.object({
  reason: z.string().min(1).max(2000),
  createdAt: z.coerce.date(),
})

export type FindingAppeal = z.infer<typeof FindingAppealSchema>

export const RetestRecordSchema = z.object({
  id: z.string().uuid(),
  findingId: z.string().uuid(),
  buildId: z.string().uuid(),
  result: RetestResultSchema,
  notes: z.string().max(2000).optional(),
  createdAt: z.coerce.date(),
})

export type RetestRecord = z.infer<typeof RetestRecordSchema>

export const FindingCommentSchema = z.object({
  id: z.string().uuid(),
  findingId: z.string().uuid(),
  authorId: z.string().uuid(),
  authorRole: z.enum(['customer', 'operator', 'tester']),
  body: z.string().min(1).max(2000),
  createdAt: z.coerce.date(),
})

export type FindingComment = z.infer<typeof FindingCommentSchema>

export const FindingSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  orderId: z.string().uuid(),
  scenarioId: z.string().uuid().optional(),
  executionId: z.string().uuid().optional(),
  reporterId: z.string().uuid(),
  type: FindingTypeSchema,
  title: z.string().min(1).max(200),
  steps: z.string().min(1).max(5000),
  expectedBehavior: z.string().min(1).max(2000),
  actualBehavior: z.string().min(1).max(2000),
  buildId: z.string().uuid(),
  environmentId: z.string().uuid().optional(),
  journey: z.string().max(300).optional(),
  reproducibility: ReproducibilitySchema,
  severity: SeveritySchema.optional(),
  impact: ImpactSchema.optional(),
  customerPriority: CustomerPrioritySchema,
  reviews: z.array(FindingReviewSchema),
  appeal: FindingAppealSchema.optional(),
  retests: z.array(RetestRecordSchema),
  comments: z.array(FindingCommentSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Finding = z.infer<typeof FindingSchema>

export const CreateFindingSchema = z.object({
  orderId: z.string().uuid(),
  scenarioId: z.string().uuid().optional(),
  executionId: z.string().uuid().optional(),
  type: FindingTypeSchema,
  title: z.string().min(1).max(200),
  steps: z.string().min(1).max(5000),
  expectedBehavior: z.string().min(1).max(2000),
  actualBehavior: z.string().min(1).max(2000),
  buildId: z.string().uuid(),
  environmentId: z.string().uuid().optional(),
  journey: z.string().max(300).optional(),
  reproducibility: ReproducibilitySchema,
  severity: SeveritySchema.optional(),
  impact: ImpactSchema.optional(),
})

export type CreateFindingInput = z.input<typeof CreateFindingSchema>

export const ReviewFindingSchema = z.object({
  outcome: ReviewOutcomeSchema,
  reason: z.string().min(1).max(2000),
})

export const AppealFindingSchema = z.object({
  reason: z.string().min(1).max(2000),
})

export const SetPrioritySchema = z.object({
  priority: CustomerPrioritySchema,
})

export const RecordRetestSchema = z.object({
  result: RetestResultSchema,
  buildId: z.string().uuid(),
  notes: z.string().max(2000).optional(),
})

export const AddFindingCommentSchema = z.object({
  body: z.string().min(1).max(2000),
})
