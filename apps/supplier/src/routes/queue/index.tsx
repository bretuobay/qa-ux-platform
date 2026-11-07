import { Link } from 'react-router'
import {
  eventRequiresReason,
  eventsFor,
  ORDER_EVENT_LABELS,
  ORDER_STATUS_LABELS,
} from '@qa-ux/domain'
import type { OrderEvent } from '@qa-ux/contracts'
import { useQueueViewModel } from './useQueueViewModel.js'

export default function QueuePage() {
  const vm = useQueueViewModel()

  if (vm.isLoading) return <p className="p-8 text-gray-500">Loading queue…</p>
  if (vm.isError) return <p className="p-8 text-red-600">Failed to load queue: {vm.error?.message}</p>

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Operator queue</h1>
      <p className="mt-2 text-sm text-gray-600">
        Payment status stays separate from the service status. Confirming payment does not start
        the delivery clock.
      </p>

      <label className="mt-4 block text-sm font-medium" htmlFor="reason">
        Reason (required to pause or cancel)
      </label>
      <input
        id="reason"
        value={vm.reason}
        onChange={(event) => vm.setReason(event.target.value)}
        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
      />

      {vm.orders.length === 0 ? (
        <p className="mt-6 text-gray-500">Nothing is waiting.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {vm.orders.map((order) => {
            const actions = eventsFor(order, 'operator').filter((event) => event !== 'issue_quote')
            return (
              <li key={order.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <Link to={`/orders/${order.id}`} className="font-medium hover:underline">
                  {order.title}
                </Link>
                <p className="text-sm text-gray-500">
                  {ORDER_STATUS_LABELS[order.status]} · payment {order.paymentStatus} · {order.module}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {actions.map((event) => (
                    <ActionButton
                      key={event}
                      event={event}
                      disabled={
                        vm.isPending || (eventRequiresReason(event) && vm.reason.trim() === '')
                      }
                      onClick={() => vm.run(order.id, event)}
                    />
                  ))}
                  {eventsFor(order, 'operator').includes('issue_quote') ? (
                    <button
                      type="button"
                      className="rounded border border-gray-300 px-3 py-2 text-sm"
                      onClick={() => vm.setQuotingId(order.id)}
                    >
                      Issue quote
                    </button>
                  ) : null}
                </div>
                {vm.quotingId === order.id ? (
                  <form
                    className="mt-4 space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault()
                      vm.issueQuote(order.id)
                    }}
                  >
                    <label className="block text-sm">
                      Service fee (USD)
                      <input
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                        value={vm.feeDollars}
                        onChange={(event) => vm.setFeeDollars(event.target.value)}
                      />
                    </label>
                    <label className="block text-sm">
                      Deliverables
                      <textarea
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                        rows={3}
                        value={vm.deliverables}
                        onChange={(event) => vm.setDeliverables(event.target.value)}
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={vm.isPending}
                      className="rounded bg-gray-900 px-3 py-2 text-sm text-white"
                    >
                      Send quote
                    </button>
                  </form>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      {vm.formError ? <p className="mt-4 text-sm text-red-600">{vm.formError}</p> : null}
      {vm.actionError ? <p className="mt-4 text-sm text-red-600">{vm.actionError.message}</p> : null}
    </main>
  )
}

function ActionButton({
  event,
  disabled,
  onClick,
}: {
  event: OrderEvent
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-50"
    >
      {ORDER_EVENT_LABELS[event]}
    </button>
  )
}
