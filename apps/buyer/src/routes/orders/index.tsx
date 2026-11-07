import { Link } from 'react-router'
import { nextAction, ORDER_STATUS_LABELS } from '@qa-ux/domain'
import type { Quote } from '@qa-ux/contracts'
import { useOrdersViewModel } from './useOrdersViewModel.js'

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(cents / 100)
}

function quoteTotal(quote: Quote): number {
  const lines = quote.lineItems.reduce((sum, line) => sum + line.amountCents, 0)
  return lines + quote.incentivesCents
}

export default function OrdersPage() {
  const { orders, quotes, isLoading, isError, error, refetch } = useOrdersViewModel()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Loading orders…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-red-600">Failed to load orders: {error?.message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <Link to="/briefs/new" className="rounded bg-blue-600 px-3 py-2 text-sm text-white">
          New brief
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet. Start with what you want tested.</p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {orders.map((order) => {
            const quote = quotes.find((item) => item.id === order.quoteId)
            return (
              <li key={order.id} className="flex items-start justify-between gap-4 px-4 py-3">
                <div>
                  <Link to={`/orders/${order.id}`} className="font-medium text-gray-900 hover:underline">
                    {order.title}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {ORDER_STATUS_LABELS[order.status]} · payment {order.paymentStatus}
                  </p>
                  <p className="mt-1 text-sm text-gray-700">{nextAction(order.status)}</p>
                  {quote ? (
                    <p className="mt-1 text-sm text-gray-600">
                      Quote v{quote.version}: {money(quoteTotal(quote), quote.currency)}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {order.testerCount} testers
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
