import { z } from 'zod'

export const BusinessSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  plan: z.enum(['free', 'starter', 'pro', 'enterprise']),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Business = z.infer<typeof BusinessSchema>

export const CreateBusinessSchema = BusinessSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateBusinessInput = z.infer<typeof CreateBusinessSchema>
