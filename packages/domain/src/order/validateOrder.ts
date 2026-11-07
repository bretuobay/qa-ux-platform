import { OrderSchema } from '@qa-ux/contracts'
import type { Order } from '@qa-ux/contracts'
import { zodErrors } from '../zod-errors.js'

export type ValidationResult =
  | { success: true }
  | { success: false; errors: string[] }

export function validateOrder(order: Order): ValidationResult {
  const result = OrderSchema.safeParse(order)
  if (result.success) return { success: true }
  return { success: false, errors: zodErrors(result.error) }
}
