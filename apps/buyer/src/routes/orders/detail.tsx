import { Link, useParams } from 'react-router'
import {
  eventRequiresReason,
  eventsFor,
  nextAction,
  ORDER_EVENT_LABELS,
  ORDER_STATUS_LABELS,
} from '@qa-ux/domain'
import { useOrderDetailViewModel } from './useOrderDetailViewModel.js'

export default function OrderDetailPage() {
  const { orderId } = useParams()
  if (!orderId) return <p className="p-8 text-red-600">Missing order.</p>
  return <OrderDetail orderId={orderId} />
}

function OrderDetail({ orderId }: { orderId: string }) {
  const vm = useOrderDetailViewModel(orderId)

  if (vm.isLoading) return <p className="p-8 text-gray-500">Loading order…</p>
  if (vm.isError || !vm.order) {
    return <p className="p-8 text-red-600">Failed to load order: {vm.error?.message}</p>
  }

  const actions = eventsFor(vm.order, 'customer')

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/orders" className="text-sm text-blue-700 hover:underline">
        All orders
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{vm.order.title}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {ORDER_STATUS_LABELS[vm.order.status]} · payment {vm.order.paymentStatus}
      </p>
      <p className="mt-3 text-gray-800">{nextAction(vm.order.status)}</p>
      <p className="mt-2 text-sm text-gray-600">
        {vm.build ? `Build ${vm.build.version}` : 'No build attached yet.'}
        {vm.blockers.length > 0 ? ` · Still needed: ${vm.blockers.join(', ')}` : ' · Readiness clear'}
      </p>

      {vm.quotes.length > 0 ? (
        <section className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="font-medium">Quotes</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {vm.quotes.map((quote) => (
              <li key={quote.id}>
                Version {quote.version}: {quote.deliverables}
                {quote.acceptedAt ? ' · accepted' : ''}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6">
        <label className="block text-sm font-medium text-gray-700" htmlFor="reason">
          Note (required to cancel)
        </label>
        <input
          id="reason"
          value={vm.reason}
          onChange={(event) => vm.setReason(event.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((event) => (
            <button
              key={event}
              type="button"
              disabled={
                vm.transition.isPending || (eventRequiresReason(event) && vm.reason.trim() === '')
              }
              onClick={() => vm.transition.mutate(event)}
              className="rounded bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              {ORDER_EVENT_LABELS[event]}
            </button>
          ))}
        </div>
        {vm.transition.isError ? (
          <p className="mt-2 text-sm text-red-600">
            {vm.transition.error instanceof Error ? vm.transition.error.message : 'Transition failed'}
          </p>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="font-medium">Activity</h2>
        {vm.events.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No status changes yet.</p>
        ) : (
          <ol className="mt-2 space-y-2 text-sm">
            {vm.events.map((event) => (
              <li key={event.id} className="rounded border border-gray-200 bg-white px-3 py-2">
                {ORDER_STATUS_LABELS[event.fromStatus]} → {ORDER_STATUS_LABELS[event.toStatus]}
                {event.reason ? ` · ${event.reason}` : ''}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  )
}
