import { z } from 'zod'
import {
  CustomerPrioritySchema,
  FindingTypeSchema,
  ImpactSchema,
  ReproducibilitySchema,
  RetestResultSchema,
  ReviewOutcomeSchema,
  SeveritySchema,
} from './finding.js'

export const ReportFindingSchema = z.object({
  id: z.string().uuid(),
  type: FindingTypeSchema,
  title: z.string(),
  steps: z.string(),
  expectedBehavior: z.string(),
  actualBehavior: z.string(),
  buildId: z.string().uuid(),
  environmentId: z.string().uuid().optional(),
  journey: z.string().optional(),
  reproducibility: ReproducibilitySchema,
  severity: SeveritySchema.optional(),
  impact: ImpactSchema.optional(),
  customerPriority: CustomerPrioritySchema,
  reviewOutcome: ReviewOutcomeSchema.optional(),
  reviewReason: z.string().optional(),
  retestResult: RetestResultSchema.optional(),
  retestBuildId: z.string().uuid().optional(),
})

export type ReportFinding = z.infer<typeof ReportFindingSchema>

export const CoverageSnapshotSchema = z.object({
  passed: z.number().int(),
  failed: z.number().int(),
  blocked: z.number().int(),
  notRun: z.number().int(),
  notApplicable: z.number().int(),
  inScope: z.number().int(),
})

export type CoverageSnapshot = z.infer<typeof CoverageSnapshotSchema>

export const ReportSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  orderId: z.string().uuid(),
  version: z.number().int().positive(),
  title: z.string().min(1).max(200),
  objective: z.string().min(1),
  authorName: z.string().min(1),
  reviewerName: z.string().min(1),
  coverage: CoverageSnapshotSchema,
  findings: z.array(ReportFindingSchema),
  publishedAt: z.coerce.date(),
})

export type Report = z.infer<typeof ReportSchema>

export const PublishReportSchema = z.object({
  orderId: z.string().uuid(),
  objective: z.string().min(1).max(4000),
  authorName: z.string().min(1).max(200),
  reviewerName: z.string().min(1).max(200),
})
