import { z } from 'zod'

export const FindingSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  executionId: z.string().uuid(),
  reporterId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000),
  severity: z.enum(['info', 'low', 'medium', 'high', 'critical']),
  status: z.enum(['open', 'in_review', 'confirmed', 'rejected', 'resolved']),
  stepsToReproduce: z.string().max(5000).optional(),
  expectedBehavior: z.string().max(2000).optional(),
  actualBehavior: z.string().max(2000).optional(),
  evidenceUrls: z.array(z.string().url()).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Finding = z.infer<typeof FindingSchema>

export const CreateFindingSchema = FindingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
})

export type CreateFindingInput = z.infer<typeof CreateFindingSchema>
