import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { createOrder } from '../createOrder.js'
import { validateOrder } from '../validateOrder.js'
import type { CreateOrderInput } from '@qa-ux/contracts'

const baseInput: CreateOrderInput = {
  businessId: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
  applicationId: 'b2c3d4e5-f6a7-4890-9bcd-ef0123456789',
  title: 'Smoke test run',
  description: 'Full regression pass',
  module: 'qa_check',
  priority: 'medium',
  testerCount: 5,
}

describe('createOrder', () => {
  it('assigns a uuid id', () => {
    const order = createOrder(baseInput)
    expect(order.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  })

  it('starts as a draft with payment still unpaid', () => {
    const order = createOrder(baseInput)
    expect(order.status).toBe('draft')
    expect(order.paymentStatus).toBe('unpaid')
  })

  it('sets createdAt and updatedAt to the same instant', () => {
    const order = createOrder(baseInput)
    expect(order.createdAt.getTime()).toBe(order.updatedAt.getTime())
  })

  it('passes validateOrder after creation', () => {
    const order = createOrder(baseInput)
    const result = validateOrder(order)
    expect(result.success).toBe(true)
  })
})

describe('createOrder property tests', () => {
  const priorities = ['low', 'medium', 'high', 'critical'] as const

  it('every created order passes schema validation (fast-check)', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 200 }),
          testerCount: fc.integer({ min: 1, max: 100 }),
          priority: fc.constantFrom(...priorities),
        }),
        ({ title, testerCount, priority }) => {
          const order = createOrder({ ...baseInput, title, testerCount, priority })
          const result = validateOrder(order)
          return result.success === true
        }
      )
    )
  })

  it('testerCount is preserved exactly (fast-check)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (testerCount) => {
        const order = createOrder({ ...baseInput, testerCount })
        return order.testerCount === testerCount
      })
    )
  })
})
