import { z } from 'zod'

export const ASSIGNMENT_STATUSES = ['offered', 'accepted', 'declined', 'withdrawn', 'replaced'] as const
export const AssignmentStatusSchema = z.enum(ASSIGNMENT_STATUSES)
export type AssignmentStatus = z.infer<typeof AssignmentStatusSchema>

export const AssignmentSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  orderId: z.string().uuid(),
  testerId: z.string().uuid(),
  status: AssignmentStatusSchema,
  timeCommitment: z.string().min(1).max(200),
  compensationCents: z.number().int().nonnegative(),
  currency: z.string().length(3),
  deadline: z.coerce.date(),
  consentRequired: z.boolean(),
  evidenceRequired: z.string().min(1).max(500),
  accessInstructions: z.string().max(2000).optional(),
  accessUsername: z.string().max(200).optional(),
  accessSecret: z.string().max(500).optional(),
  replacementOfId: z.string().uuid().optional(),
  replacedReason: z.string().max(500).optional(),
  acceptedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Assignment = z.infer<typeof AssignmentSchema>

export const OfferAssignmentSchema = z.object({
  testerId: z.string().uuid(),
  timeCommitment: z.string().min(1).max(200),
  compensationCents: z.number().int().nonnegative(),
  currency: z.string().length(3).default('USD'),
  deadline: z.coerce.date(),
  consentRequired: z.boolean().default(true),
  evidenceRequired: z.string().min(1).max(500),
  accessInstructions: z.string().max(2000).optional(),
  accessUsername: z.string().max(200).optional(),
  accessSecret: z.string().max(500).optional(),
})

export type OfferAssignmentInput = z.input<typeof OfferAssignmentSchema>

export const SLOT_STATUSES = ['open', 'filled'] as const
export const SlotStatusSchema = z.enum(SLOT_STATUSES)

export const RecruitmentSlotSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  orderId: z.string().uuid(),
  status: SlotStatusSchema,
  assignmentId: z.string().uuid().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type RecruitmentSlot = z.infer<typeof RecruitmentSlotSchema>
