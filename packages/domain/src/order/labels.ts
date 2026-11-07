import type { OrderEvent, OrderStatus } from '@qa-ux/contracts'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Draft',
  scope_review: 'Scope review',
  quoted: 'Quoted',
  accepted: 'Accepted',
  payment_pending: 'Payment pending',
  readiness_check: 'Readiness check',
  recruiting: 'Recruiting',
  scheduled: 'Scheduled',
  in_progress: 'In progress',
  review: 'Review',
  delivered: 'Delivered',
  retest: 'Retest',
  closed: 'Closed',
  paused: 'Paused',
  cancelled: 'Cancelled',
}

export const ORDER_EVENT_LABELS: Record<OrderEvent, string> = {
  submit: 'Submit for review',
  issue_quote: 'Issue quote',
  accept: 'Accept quote',
  request_payment: 'Request payment',
  confirm_payment: 'Confirm payment',
  mark_ready: 'Mark ready',
  schedule: 'Mark scheduled',
  start: 'Start work',
  submit_for_review: 'Submit for review',
  deliver: 'Deliver report',
  request_retest: 'Request retest',
  complete_retest: 'Complete retest',
  close: 'Close order',
  pause: 'Pause',
  resume: 'Resume',
  cancel: 'Cancel',
}

export function nextAction(status: OrderStatus): string {
  switch (status) {
    case 'draft':
      return 'Submit this brief so scope can be reviewed.'
    case 'scope_review':
      return 'Waiting for an itemized quote.'
    case 'quoted':
      return 'Review the quote and accept it to continue.'
    case 'accepted':
      return 'Waiting for payment to be requested.'
    case 'payment_pending':
      return 'Payment is pending confirmation. The delivery clock has not started.'
    case 'readiness_check':
      return 'Readiness checks are in progress. Payment alone does not start delivery.'
    case 'recruiting':
      return 'Recruiting testers or participants.'
    case 'scheduled':
      return 'Work is scheduled.'
    case 'in_progress':
      return 'Testing is in progress.'
    case 'review':
      return 'Submissions are being reviewed.'
    case 'delivered':
      return 'Report delivered. Request the included retest or close the order.'
    case 'retest':
      return 'Fix verification is in progress.'
    case 'closed':
      return 'This order is closed.'
    case 'paused':
      return 'This order is paused.'
    case 'cancelled':
      return 'This order is cancelled.'
  }
}
