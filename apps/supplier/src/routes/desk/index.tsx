import { Link, useParams } from 'react-router'
import { READINESS_CHECKS } from '@qa-ux/contracts'
import { useOrderDeskViewModel } from './useOrderDeskViewModel.js'

const LABELS: Record<(typeof READINESS_CHECKS)[number], string> = {
  build_named: 'Named build',
  environment_reachable: 'Environment reachable',
  test_accounts: 'Test accounts',
  synthetic_data: 'Synthetic data',
  permission_to_test: 'Permission to test',
  contact: 'Contact for blockers',
}

export default function OrderDeskPage() {
  const { orderId } = useParams()
  if (!orderId) return <p className="p-8">Missing order.</p>
  return <Desk orderId={orderId} />
}

function Desk({ orderId }: { orderId: string }) {
  const vm = useOrderDeskViewModel(orderId)
  if (vm.isLoading) return <p className="p-8 text-gray-500">Loading order…</p>

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <Link to="/queue" className="text-sm text-blue-700 hover:underline">
        Queue
      </Link>
      <h1 className="text-2xl font-semibold">{vm.title}</h1>
      <p className="text-sm text-gray-600">
        {vm.blockers.length === 0 ? 'Readiness is clear.' : `Still blocked: ${vm.blockers.join(', ')}`}
      </p>
      {vm.error ? <p className="text-sm text-red-600">{vm.error.message}</p> : null}

      <section className="rounded border border-gray-200 bg-white p-4">
        <h2 className="font-medium">Readiness</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {READINESS_CHECKS.map((check) => (
            <li key={check}>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={vm.checks[check]}
                  onChange={(event) => vm.setCheck(check, event.target.checked)}
                />
                {LABELS[check]}
              </label>
            </li>
          ))}
        </ul>
        <button type="button" className="mt-3 rounded bg-gray-900 px-3 py-2 text-sm text-white" onClick={vm.saveReadiness}>
          Save checklist
        </button>
      </section>

      <section className="rounded border border-gray-200 bg-white p-4">
        <h2 className="font-medium">Attach build</h2>
        <div className="mt-3 flex gap-2">
          <select className="rounded border px-3 py-2 text-sm" value={vm.buildId} onChange={(event) => vm.setBuildId(event.target.value)}>
            <option value="">Choose a build</option>
            {vm.builds.map((build) => (
              <option key={build.id} value={build.id}>
                {build.version}
              </option>
            ))}
          </select>
          <button type="button" className="rounded bg-gray-900 px-3 py-2 text-sm text-white" onClick={vm.attach}>
            Attach
          </button>
        </div>
      </section>

      <section className="rounded border border-gray-200 bg-white p-4">
        <h2 className="font-medium">Offer the work</h2>
        <p className="mt-1 text-sm text-gray-600">Access details stay hidden until the tester accepts.</p>
        <div className="mt-3 grid gap-2">
          <select className="rounded border px-3 py-2 text-sm" value={vm.testerId} onChange={(event) => vm.setTesterId(event.target.value)}>
            <option value="">Choose a tester</option>
            {vm.testers.map(({ profile, eligible }) => (
              <option key={profile.userId} value={profile.userId} disabled={!eligible}>
                {profile.userId.slice(0, 8)} · {profile.os ?? 'device not set'} {eligible ? '' : '(not eligible)'}
              </option>
            ))}
          </select>
          <input
            className="rounded border px-3 py-2 text-sm"
            placeholder="Staging password, shown only after acceptance"
            value={vm.accessSecret}
            onChange={(event) => vm.setAccessSecret(event.target.value)}
          />
          <button type="button" className="w-fit rounded bg-gray-900 px-3 py-2 text-sm text-white" onClick={vm.offer}>
            Send offer · $80 · 2 hours
          </button>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {vm.assignments.map((assignment) => (
            <li key={assignment.id} className="flex items-center justify-between gap-3">
              <span>
                {assignment.status} · ${(assignment.compensationCents / 100).toFixed(2)}
                {assignment.access ? ' · access on file' : ' · access hidden'}
              </span>
              {assignment.status !== 'replaced' ? (
                <button type="button" className="rounded border px-2 py-1" onClick={() => vm.replace(assignment.id)}>
                  Replace
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        <input
          className="mt-3 w-full rounded border px-3 py-2 text-sm"
          placeholder="Reason for a replacement"
          value={vm.replaceReason}
          onChange={(event) => vm.setReplaceReason(event.target.value)}
        />
      </section>

      <section className="rounded border border-gray-200 bg-white p-4">
        <h2 className="font-medium">Scenarios</h2>
        {vm.coverage ? (
          <p className="mt-1 text-sm text-gray-600">
            {vm.coverage.passed} passed, {vm.coverage.failed} failed, {vm.coverage.blocked} blocked,{' '}
            {vm.coverage.notRun} not run, of {vm.coverage.inScope} in scope.
          </p>
        ) : null}
        <form
          className="mt-3 grid gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            vm.addScenario()
          }}
        >
          <input className="rounded border px-3 py-2 text-sm" placeholder="Journey" value={vm.journey} onChange={(event) => vm.setJourney(event.target.value)} />
          <textarea className="rounded border px-3 py-2 text-sm" placeholder="Steps" value={vm.steps} onChange={(event) => vm.setSteps(event.target.value)} />
          <input className="rounded border px-3 py-2 text-sm" placeholder="Expected outcome" value={vm.expected} onChange={(event) => vm.setExpected(event.target.value)} />
          <button type="submit" className="w-fit rounded bg-gray-900 px-3 py-2 text-sm text-white">
            Add scenario
          </button>
        </form>
        <ul className="mt-3 text-sm">
          {vm.scenarios.map((scenario) => (
            <li key={scenario.id}>
              {scenario.journey} · {scenario.status}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
