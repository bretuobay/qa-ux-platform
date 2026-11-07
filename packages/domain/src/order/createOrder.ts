import { CreateOrderSchema } from '@qa-ux/contracts'
import type { CreateOrderInput, Order } from '@qa-ux/contracts'

export function createOrder(input: CreateOrderInput): Order {
  const now = new Date()
  const parsed = CreateOrderSchema.parse(input)
  return {
    ...parsed,
    id: globalThis.crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
}
