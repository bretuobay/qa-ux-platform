import { Link, useParams } from 'react-router'
import { useReportViewModel } from './useReportViewModel.js'

export default function ReportPage() {
  const { orderId, reportId } = useParams()
  if (!orderId || !reportId) return <p className="p-8">Missing report.</p>
  return <Report orderId={orderId} reportId={reportId} />
}

function Report({ orderId, reportId }: { orderId: string; reportId: string }) {
  const vm = useReportViewModel(reportId)
  if (vm.isLoading) return <p className="p-8 text-gray-500">Loading report…</p>
  if (vm.error || !vm.report) return <p className="p-8 text-red-600">{vm.error?.message ?? 'Report not found'}</p>
  const report = vm.report
  const published = new Date(report.publishedAt).toISOString()

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 print:max-w-none">
      <Link to={`/orders/${orderId}`} className="text-sm text-blue-700 hover:underline print:hidden">
        Back to the order
      </Link>
      <div className="mt-3 flex gap-2 print:hidden">
        <button type="button" className="rounded bg-gray-900 px-3 py-2 text-sm text-white" onClick={() => window.print()}>
          Print
        </button>
        <button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => vm.downloadCsv()}>
          Download CSV
        </button>
      </div>
      <p className="mt-6 text-sm text-gray-500">Version {report.version} · {published}</p>
      <h1 className="mt-1 text-2xl font-semibold">{report.title}</h1>
      <p className="mt-2 text-sm text-gray-600">
        Author {report.authorName} · Reviewer {report.reviewerName}
      </p>
      <p className="mt-4 text-sm text-gray-600">This is the version that was published. Later edits to a finding stay on the order and leave this copy unchanged.</p>
      <h2 className="mt-6 font-medium">Objective</h2>
      <p className="mt-1">{report.objective}</p>
      <h2 className="mt-6 font-medium">Coverage</h2>
      <p className="mt-1 text-sm">
        {report.coverage.passed} passed, {report.coverage.failed} failed, {report.coverage.blocked} blocked,{' '}
        {report.coverage.notRun} not run, of {report.coverage.inScope} in scope.
      </p>
      <h2 className="mt-6 font-medium">Findings</h2>
      {report.findings.length === 0 ? <p className="mt-2 text-sm text-gray-500">No findings in this version.</p> : null}
      <ul className="mt-3 space-y-4">
        {report.findings.map((finding) => (
          <li key={finding.id} className="border-t border-gray-200 pt-3 text-sm">
            <p className="font-medium">{finding.title}</p>
            <p className="text-gray-600">
              {finding.type}
              {finding.severity ? ` · ${finding.severity}` : ''}
              {finding.impact ? ` · impact ${finding.impact}` : ''}
              {' · priority '}
              {finding.customerPriority}
            </p>
            <p className="mt-2">Expected: {finding.expectedBehavior}</p>
            <p>Actual: {finding.actualBehavior}</p>
            <p>Steps: {finding.steps}</p>
            <p className="mt-2">Review: {finding.reviewOutcome ?? 'unreviewed'}{finding.reviewReason ? ` · ${finding.reviewReason}` : ''}</p>
            <p>Retest: {finding.retestResult ?? 'not retested'}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
