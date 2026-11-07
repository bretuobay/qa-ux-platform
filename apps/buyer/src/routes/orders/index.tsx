import { useOrdersViewModel } from './useOrdersViewModel.js'

export default function OrdersPage() {
  const { orders, isLoading, isError, error, refetch } = useOrdersViewModel()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading orders…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-600">Failed to load orders: {error?.message}</p>
        <button
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
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-gray-900">{order.title}</p>
                <p className="text-sm text-gray-500">
                  {order.priority} · {order.status}
                </p>
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                {order.testerCount} testers
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
