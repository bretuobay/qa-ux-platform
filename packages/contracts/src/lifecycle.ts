import { z } from 'zod'

export const ORDER_STATUSES = [
  'draft',
  'scope_review',
  'quoted',
  'accepted',
  'payment_pending',
  'readiness_check',
  'recruiting',
  'scheduled',
  'in_progress',
  'review',
  'delivered',
  'retest',
  'closed',
  'paused',
  'cancelled',
] as const

export const OrderStatusSchema = z.enum(ORDER_STATUSES)
export type OrderStatus = z.infer<typeof OrderStatusSchema>

export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded', 'partially_refunded'] as const
export const PaymentStatusSchema = z.enum(PAYMENT_STATUSES)
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>

export const ORDER_EVENTS = [
  'submit',
  'issue_quote',
  'accept',
  'request_payment',
  'confirm_payment',
  'mark_ready',
  'schedule',
  'start',
  'submit_for_review',
  'deliver',
  'request_retest',
  'complete_retest',
  'close',
  'pause',
  'resume',
  'cancel',
] as const

export const OrderEventSchema = z.enum(ORDER_EVENTS)
export type OrderEvent = z.infer<typeof OrderEventSchema>

export const SERVICE_MODULES = [
  'qa_check',
  'usability_study',
  'beta_launch',
  'combined_launch',
  'release_check',
] as const

export const ServiceModuleSchema = z.enum(SERVICE_MODULES)
export type ServiceModule = z.infer<typeof ServiceModuleSchema>

export const PLATFORMS = ['web', 'android', 'ios'] as const
export const PlatformSchema = z.enum(PLATFORMS)
export type Platform = z.infer<typeof PlatformSchema>

/** Local tenant and application ids until sign-in issues a real workspace. */
export const DEV_BUSINESS_ID = 'a1b2c3d4-e5f6-4789-8abc-def012345678'
export const DEV_APPLICATION_ID = 'b2c3d4e5-f6a7-4890-9bcd-ef0123456789'
