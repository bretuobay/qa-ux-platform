import type { Order, OrderActivity, OrderEvent, OrderStatus } from '@qa-ux/contracts'
import { OrderEventSchema } from '@qa-ux/contracts'

export interface TransitionMeta {
  reason?: string
}

export type TransitionResult =
  | { ok: true; order: Order; activity: OrderActivity }
  | { ok: false; error: string }

const PAUSABLE: readonly OrderStatus[] = [
  'scope_review',
  'quoted',
  'readiness_check',
  'recruiting',
  'scheduled',
  'in_progress',
  'review',
  'retest',
]

const HAPPY_PATH: Partial<Record<OrderStatus, Partial<Record<OrderEvent, OrderStatus>>>> = {
  draft: { submit: 'scope_review' },
  scope_review: { issue_quote: 'quoted' },
  quoted: { accept: 'accepted' },
  accepted: { request_payment: 'payment_pending' },
  payment_pending: { confirm_payment: 'readiness_check' },
  readiness_check: { mark_ready: 'recruiting' },
  recruiting: { schedule: 'scheduled' },
  scheduled: { start: 'in_progress' },
  in_progress: { submit_for_review: 'review' },
  review: { deliver: 'delivered' },
  delivered: { request_retest: 'retest', close: 'closed' },
  retest: { complete_retest: 'closed' },
}

function destination(status: OrderStatus, event: OrderEvent): OrderStatus | null {
  if (status === 'closed' || status === 'cancelled') return null
  if (event === 'cancel') return 'cancelled'
  if (event === 'pause') return PAUSABLE.includes(status) ? 'paused' : null
  if (event === 'resume') return null
  return HAPPY_PATH[status]?.[event] ?? null
}

export function allowedEvents(order: Order): OrderEvent[] {
  if (order.status === 'closed' || order.status === 'cancelled') return []
  if (order.status === 'paused') return ['resume', 'cancel']
  return OrderEventSchema.options.filter((event) => destination(order.status, event) !== null)
}

const CUSTOMER_EVENTS = new Set<OrderEvent>([
  'submit',
  'accept',
  'request_retest',
  'close',
  'cancel',
])

export function eventsFor(order: Order, actor: 'customer' | 'operator'): OrderEvent[] {
  return allowedEvents(order).filter((event) => {
    if (event === 'cancel') return true
    return actor === 'customer' ? CUSTOMER_EVENTS.has(event) : !CUSTOMER_EVENTS.has(event)
  })
}

export function eventRequiresReason(event: OrderEvent): boolean {
  return event === 'pause' || event === 'cancel'
}

export function transitionOrder(
  order: Order,
  event: OrderEvent,
  meta: TransitionMeta = {}
): TransitionResult {
  const now = new Date()
  const reason = meta.reason?.trim()

  if (eventRequiresReason(event) && !reason) {
    return { ok: false, error: 'A reason is required.' }
  }

  if (event === 'resume') {
    if (order.status !== 'paused' || !order.pausedFrom) {
      return { ok: false, error: 'Only a paused order can resume.' }
    }
    if (
      order.pausedFrom === 'paused' ||
      order.pausedFrom === 'closed' ||
      order.pausedFrom === 'cancelled'
    ) {
      return { ok: false, error: 'Paused order has no resumable status.' }
    }
    const next: Order = { ...order, status: order.pausedFrom, updatedAt: now }
    delete next.pausedFrom
    delete next.pauseReason
    return { ok: true, order: next, activity: activityFor(order, next, event, reason, now) }
  }

  const status = destination(order.status, event)
  if (!status) {
    return { ok: false, error: `Cannot ${event.replaceAll('_', ' ')} from ${order.status.replaceAll('_', ' ')}.` }
  }

  const next: Order = { ...order, status, updatedAt: now }
  if (event === 'confirm_payment') next.paymentStatus = 'paid'
  if (event === 'pause') {
    next.pausedFrom = order.status
    if (reason) next.pauseReason = reason
  }
  if (event === 'cancel' && reason) next.cancelReason = reason

  return { ok: true, order: next, activity: activityFor(order, next, event, reason, now) }
}

function activityFor(
  before: Order,
  after: Order,
  event: OrderEvent,
  reason: string | undefined,
  now: Date
): OrderActivity {
  const activity: OrderActivity = {
    id: globalThis.crypto.randomUUID(),
    orderId: before.id,
    businessId: before.businessId,
    event,
    fromStatus: before.status,
    toStatus: after.status,
    createdAt: now,
  }
  if (reason) activity.reason = reason
  return activity
}
