import { z } from 'zod'
import { PlatformSchema, ServiceModuleSchema } from './lifecycle.js'

export const BriefSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  applicationId: z.string().uuid(),
  module: ServiceModuleSchema,
  audience: z.string().min(1).max(500),
  goals: z.string().min(1).max(2000),
  platform: PlatformSchema,
  releaseDeadline: z.coerce.date().optional(),
  journeys: z.array(z.string().min(1).max(300)).default([]),
  tasks: z.array(z.string().min(1).max(300)).default([]),
  risks: z.string().max(2000).optional(),
  exclusions: z.string().max(2000).optional(),
  languages: z.array(z.string().min(1).max(40)).default(['en']),
  accessibilityNeeds: z.string().max(1000).optional(),
  desiredEvidence: z.string().max(1000).optional(),
  betaDurationDays: z.number().int().positive().optional(),
  participationTasks: z.array(z.string().min(1).max(300)).default([]),
  changedAreas: z.string().max(2000).optional(),
  priorOrderId: z.string().uuid().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Brief = z.infer<typeof BriefSchema>

export const CreateBriefSchema = BriefSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateBriefInput = z.input<typeof CreateBriefSchema>

export const SubmitBriefSchema = CreateBriefSchema.extend({
  title: z.string().min(1).max(200),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  testerCount: z.number().int().min(1).max(100).optional().default(1),
})

export type SubmitBriefInput = z.input<typeof SubmitBriefSchema>
