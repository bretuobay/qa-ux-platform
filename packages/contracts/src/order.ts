import { z } from 'zod'
import {
  OrderEventSchema,
  OrderStatusSchema,
  PaymentStatusSchema,
  ServiceModuleSchema,
} from './lifecycle.js'

export const OrderSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  applicationId: z.string().uuid(),
  buildId: z.string().uuid().optional(),
  briefId: z.string().uuid().optional(),
  quoteId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  module: ServiceModuleSchema,
  status: OrderStatusSchema,
  paymentStatus: PaymentStatusSchema,
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  testerCount: z.number().int().min(1).max(100),
  pausedFrom: OrderStatusSchema.optional(),
  pauseReason: z.string().max(500).optional(),
  cancelReason: z.string().max(500).optional(),
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
  paymentStatus: true,
  pausedFrom: true,
  pauseReason: true,
  cancelReason: true,
}).extend({
  paymentStatus: PaymentStatusSchema.optional().default('unpaid'),
})

export type CreateOrderInput = z.input<typeof CreateOrderSchema>

export const OrderActivitySchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  businessId: z.string().uuid(),
  event: OrderEventSchema,
  fromStatus: OrderStatusSchema,
  toStatus: OrderStatusSchema,
  reason: z.string().max(500).optional(),
  createdAt: z.coerce.date(),
})

export type OrderActivity = z.infer<typeof OrderActivitySchema>
