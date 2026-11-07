import { Link, useParams } from 'react-router'
import type { CustomerPriority, Finding } from '@qa-ux/contracts'
import { CUSTOMER_PRIORITIES, FINDING_TYPES, REVIEW_OUTCOMES, SEVERITIES } from '@qa-ux/contracts'
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
        <h2 className="font-medium">Findings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Severity is the operator’s rating of impact. Priority is when you want it fixed. Keep access secrets out of comments.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <select className="rounded border px-3 py-2 text-sm" aria-label="Type" value={vm.type} onChange={(event) => vm.setType(event.target.value)}>
            <option value="">All types</option>
            {FINDING_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select className="rounded border px-3 py-2 text-sm" aria-label="Severity" value={vm.severity} onChange={(event) => vm.setSeverity(event.target.value)}>
            <option value="">All severities</option>
            {SEVERITIES.map((severity) => (
              <option key={severity} value={severity}>{severity}</option>
            ))}
          </select>
          <select className="rounded border px-3 py-2 text-sm" aria-label="Review" value={vm.outcome} onChange={(event) => vm.setOutcome(event.target.value)}>
            <option value="">All reviews</option>
            <option value="unreviewed">unreviewed</option>
            {REVIEW_OUTCOMES.map((outcome) => (
              <option key={outcome} value={outcome}>{outcome}</option>
            ))}
          </select>
          <input
            className="rounded border px-3 py-2 text-sm"
            aria-label="Journey"
            placeholder="Journey"
            value={vm.journey}
            onChange={(event) => vm.setJourney(event.target.value)}
          />
        </div>
        {vm.findings.length === 0 ? <p className="mt-3 text-sm text-gray-500">No findings match.</p> : null}
        <ul className="mt-3 space-y-3">
          {vm.findings.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              comment={vm.comment}
              onComment={vm.setComment}
              onPriority={(priority) => vm.setPriority(finding.id, priority)}
              onAppeal={() => vm.appeal(finding.id)}
              onAddComment={() => vm.addComment(finding.id)}
            />
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-medium">Reports</h2>
        <p className="mt-1 text-sm text-gray-600">Each version stays as it was published.</p>
        {vm.reports.length === 0 ? <p className="mt-3 text-sm text-gray-500">No report published yet.</p> : null}
        <ul className="mt-3 space-y-2 text-sm">
          {vm.reports.map((report) => (
            <li key={report.id}>
              <Link className="text-blue-700 hover:underline" to={`/orders/${orderId}/reports/${report.id}`}>
                Version {report.version} · {report.title}
              </Link>
            </li>
          ))}
        </ul>
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

function FindingCard({
  finding,
  comment,
  onComment,
  onPriority,
  onAppeal,
  onAddComment,
}: {
  finding: Finding
  comment: string
  onComment: (value: string) => void
  onPriority: (priority: CustomerPriority) => void
  onAppeal: () => void
  onAddComment: () => void
}) {
  const latest = finding.reviews[finding.reviews.length - 1]
  const retest = finding.retests[finding.retests.length - 1]
  return (
    <li className="rounded border border-gray-200 bg-white p-4 text-sm">
      <p className="font-medium">{finding.title}</p>
      <p className="text-gray-600">
        {finding.type}
        {finding.severity ? ` · severity ${finding.severity}` : ''}
        {finding.impact ? ` · impact ${finding.impact}` : ''}
        {finding.journey ? ` · ${finding.journey}` : ''}
      </p>
      <p className="mt-2">Expected: {finding.expectedBehavior}</p>
      <p>Actual: {finding.actualBehavior}</p>
      <p>Steps: {finding.steps}</p>
      <p className="mt-2">
        Review: {latest ? `${latest.outcome} · ${latest.reason}` : 'waiting'}
        {retest ? ` · retest ${retest.result}` : ''}
      </p>
      <label className="mt-3 block">
        Your priority
        <select
          className="mt-1 rounded border px-3 py-2"
          value={finding.customerPriority}
          onChange={(event) => onPriority(event.target.value as CustomerPriority)}
        >
          {CUSTOMER_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>{priority}</option>
          ))}
        </select>
      </label>
      {latest && !finding.appeal ? (
        <button type="button" className="mt-3 rounded border px-3 py-2" onClick={onAppeal}>
          Appeal once
        </button>
      ) : null}
      {finding.appeal ? <p className="mt-2 text-gray-600">Appeal: {finding.appeal.reason}</p> : null}
      {finding.comments.length > 0 ? (
        <ul className="mt-2 space-y-1 text-gray-700">
          {finding.comments.map((item) => (
            <li key={item.id}>{item.authorRole}: {item.body}</li>
          ))}
        </ul>
      ) : null}
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          onAddComment()
        }}
      >
        <input className="flex-1 rounded border px-3 py-2" value={comment} onChange={(event) => onComment(event.target.value)} placeholder="Comment" />
        <button type="submit" className="rounded bg-gray-900 px-3 py-2 text-white">Add comment</button>
      </form>
    </li>
  )
}
