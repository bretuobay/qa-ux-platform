import { OrderSchema } from '@qa-ux/contracts'
import type { Order } from '@qa-ux/contracts'

export type ValidationResult =
  | { success: true }
  | { success: false; errors: string[] }

export function validateOrder(order: Order): ValidationResult {
  const result = OrderSchema.safeParse(order)
  if (result.success) {
    return { success: true }
  }
  const errors = result.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`
  )
  return { success: false, errors }
}
