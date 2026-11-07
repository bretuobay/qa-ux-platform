import { z } from 'zod'

export const OrderSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  applicationId: z.string().uuid(),
  buildId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  testerCount: z.number().int().min(1).max(100),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Order = z.infer<typeof OrderSchema>

export const CreateOrderSchema = OrderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
}).extend({
  status: z.enum(['draft', 'active']).optional().default('draft'),
})

export type CreateOrderInput = z.input<typeof CreateOrderSchema>
