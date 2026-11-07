import type { Brief, Order, OrderActivity, Quote } from '@qa-ux/contracts'

/**
 * Process-local store for the order lifecycle.
 * Replace with `@qa-ux/db` once `DATABASE_URL` / Hyperdrive is provisioned.
 * Data does not survive a worker restart.
 */
const orders = new Map<string, Order>()
const briefs = new Map<string, Brief>()
const quotes = new Map<string, Quote>()
const events: OrderActivity[] = []

export function resetMemoryStore(): void {
  orders.clear()
  briefs.clear()
  quotes.clear()
  events.length = 0
}

export function saveBrief(brief: Brief): void {
  briefs.set(brief.id, brief)
}

export function listBriefs(businessId: string): Brief[] {
  return [...briefs.values()].filter((brief) => brief.businessId === businessId)
}

export function saveOrder(order: Order): void {
  orders.set(order.id, order)
}

export function listOrders(businessId: string): Order[] {
  return [...orders.values()].filter((order) => order.businessId === businessId)
}

export function getOrder(businessId: string, id: string): Order | null {
  const order = orders.get(id)
  if (!order || order.businessId !== businessId) return null
  return order
}

export function saveQuote(quote: Quote): void {
  quotes.set(quote.id, quote)
}

export function getQuote(businessId: string, id: string): Quote | null {
  const quote = quotes.get(id)
  if (!quote || quote.businessId !== businessId) return null
  return quote
}

export function listQuotes(businessId: string): Quote[] {
  return [...quotes.values()].filter((quote) => quote.businessId === businessId)
}

export function listQuotesForOrder(businessId: string, orderId: string): Quote[] {
  return listQuotes(businessId).filter((quote) => quote.orderId === orderId)
}

export function saveEvent(activity: OrderActivity): void {
  events.push(activity)
}

export function listEvents(businessId: string, orderId: string): OrderActivity[] {
  return events.filter((event) => event.businessId === businessId && event.orderId === orderId)
}
