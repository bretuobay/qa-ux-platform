import { z } from 'zod'
import { OrderEventSchema } from './lifecycle.js'

export const QuoteLineSchema = z.object({
  description: z.string().min(1).max(200),
  amountCents: z.number().int().nonnegative(),
})

export type QuoteLine = z.infer<typeof QuoteLineSchema>

export const QuoteDraftSchema = z.object({
  lineItems: z.array(QuoteLineSchema).min(1),
  currency: z.string().length(3).default('USD'),
  incentivesCents: z.number().int().nonnegative().optional().default(0),
  deliverables: z.string().min(1).max(2000),
  retestLimit: z.number().int().nonnegative().optional().default(1),
  terms: z.string().max(4000).optional(),
  expiresAt: z.coerce.date(),
})

export type QuoteDraft = z.input<typeof QuoteDraftSchema>

export const QuoteSchema = QuoteDraftSchema.extend({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  businessId: z.string().uuid(),
  version: z.number().int().positive(),
  acceptedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Quote = z.infer<typeof QuoteSchema>

export const CreateQuoteSchema = QuoteSchema.omit({
  id: true,
  acceptedAt: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateQuoteInput = z.input<typeof CreateQuoteSchema>

export const TransitionRequestSchema = z.object({
  event: OrderEventSchema,
  reason: z.string().max(500).optional(),
  quote: QuoteDraftSchema.optional(),
})

export type TransitionRequest = z.input<typeof TransitionRequestSchema>
