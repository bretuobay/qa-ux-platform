import { z } from 'zod'

export const TesterProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  bio: z.string().max(1000).optional(),
  skills: z.array(z.string()).default([]),
  devices: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  hourlyRate: z.number().nonnegative().optional(),
  currency: z.string().length(3).default('USD'),
  isAvailable: z.boolean().default(true),
  completedOrders: z.number().int().nonnegative().default(0),
  rating: z.number().min(0).max(5).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type TesterProfile = z.infer<typeof TesterProfileSchema>

export const CreateTesterProfileSchema = TesterProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedOrders: true,
  rating: true,
})

export type CreateTesterProfileInput = z.infer<typeof CreateTesterProfileSchema>
