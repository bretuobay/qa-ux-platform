import { describe, expect, it } from 'vitest'
import * as fc from 'fast-check'
import { createOrder } from '../createOrder.js'
import { transitionOrder } from '../transitionOrder.js'
import { OrderEventSchema, OrderStatusSchema } from '@qa-ux/contracts'
import type { CreateOrderInput, Order, OrderEvent } from '@qa-ux/contracts'

const baseInput: CreateOrderInput = {
  businessId: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
  applicationId: 'b2c3d4e5-f6a7-4890-9bcd-ef0123456789',
  title: 'Checkout journey',
  module: 'qa_check',
  priority: 'high',
  testerCount: 3,
}

const HAPPY_PATH: OrderEvent[] = [
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
  'close',
]

function advance(order: Order, events: OrderEvent[]): Order {
  return events.reduce((current, event) => {
    const meta = { reason: 'pilot note' }
    if (event === 'mark_ready') Object.assign(meta, { readinessClear: true })
    if (event === 'deliver') Object.assign(meta, { reportPublished: true })
    const result = transitionOrder(current, event, meta)
    if (!result.ok) throw new Error(result.error)
    return result.order
  }, order)
}

describe('transitionOrder', () => {
  it('walks a draft to closed and marks payment only when payment is confirmed', () => {
    let order = createOrder(baseInput)
    order = advance(order, ['submit', 'issue_quote', 'accept'])
    expect(order.status).toBe('accepted')
    expect(order.paymentStatus).toBe('unpaid')

    order = advance(order, ['request_payment', 'confirm_payment'])
    expect(order.status).toBe('readiness_check')
    expect(order.paymentStatus).toBe('paid')

    order = advance(order, [
      'mark_ready',
      'schedule',
      'start',
      'submit_for_review',
      'deliver',
      'close',
    ])
    expect(order.status).toBe('closed')
    expect(order.paymentStatus).toBe('paid')
  })

  it('pauses with a reason and resumes to the same service status', () => {
    const submitted = advance(createOrder(baseInput), ['submit'])
    const paused = transitionOrder(submitted, 'pause', { reason: 'build is down' })
    expect(paused.ok).toBe(true)
    if (!paused.ok) return
    expect(paused.order.status).toBe('paused')
    expect(paused.order.pausedFrom).toBe('scope_review')
    expect(paused.order.paymentStatus).toBe('unpaid')

    const resumed = transitionOrder(paused.order, 'resume')
    expect(resumed.ok).toBe(true)
    if (!resumed.ok) return
    expect(resumed.order.status).toBe('scope_review')
    expect(resumed.order.pausedFrom).toBeUndefined()
    expect(resumed.order.pauseReason).toBeUndefined()
  })

  it('refuses to pause or cancel without a reason', () => {
    const submitted = advance(createOrder(baseInput), ['submit'])
    expect(transitionOrder(submitted, 'pause').ok).toBe(false)
    expect(transitionOrder(submitted, 'cancel').ok).toBe(false)
  })

  it('keeps a paid order paid when the service is cancelled', () => {
    const ready = advance(createOrder(baseInput), [
      'submit',
      'issue_quote',
      'accept',
      'request_payment',
      'confirm_payment',
    ])
    const cancelled = transitionOrder(ready, 'cancel', { reason: 'customer withdrew' })
    expect(cancelled.ok).toBe(true)
    if (!cancelled.ok) return
    expect(cancelled.order.status).toBe('cancelled')
    expect(cancelled.order.paymentStatus).toBe('paid')
    expect(cancelled.activity.fromStatus).toBe('readiness_check')
    expect(cancelled.activity.toStatus).toBe('cancelled')
  })

  it('rejects a skip from draft straight to in progress', () => {
    const result = transitionOrder(createOrder(baseInput), 'start')
    expect(result.ok).toBe(false)
  })

  it('refuses to deliver before a report version exists', () => {
    const review = advance(createOrder(baseInput), [
      'submit',
      'issue_quote',
      'accept',
      'request_payment',
      'confirm_payment',
      'mark_ready',
      'schedule',
      'start',
      'submit_for_review',
    ])
    const blocked = transitionOrder(review, 'deliver')
    expect(blocked.ok).toBe(false)
    if (blocked.ok) return
    expect(blocked.error).toMatch(/Publish a report/)
  })

  it('refuses to leave readiness while blockers are open', () => {
    const ready = advance(createOrder(baseInput), [
      'submit',
      'issue_quote',
      'accept',
      'request_payment',
      'confirm_payment',
    ])
    const blocked = transitionOrder(ready, 'mark_ready')
    expect(blocked.ok).toBe(false)
    if (blocked.ok) return
    expect(blocked.error).toMatch(/Readiness blockers/)
  })
})

describe('transitionOrder property tests', () => {
  it('cancel ends every non-terminal status as cancelled and leaves closed orders closed', () => {
    fc.assert(
      fc.property(fc.constantFrom(...OrderStatusSchema.options), (status) => {
        const order = { ...createOrder(baseInput), status }
        const result = transitionOrder(order, 'cancel', { reason: 'customer withdrew' })
        if (status === 'closed' || status === 'cancelled') return result.ok === false
        return result.ok === true && result.order.status === 'cancelled'
      })
    )
  })

  it('no event leaves a closed order', () => {
    fc.assert(
      fc.property(fc.constantFrom(...OrderEventSchema.options), (event) => {
        const order = { ...createOrder(baseInput), status: 'closed' as const }
        return transitionOrder(order, event, { reason: 'too late' }).ok === false
      })
    )
  })

  it('every happy-path event is accepted in order', () => {
    const order = advance(createOrder(baseInput), HAPPY_PATH)
    expect(order.status).toBe('closed')
  })
})
