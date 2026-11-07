import { useWorkViewModel } from './useWorkViewModel.js'

export default function WorkPage() {
  const vm = useWorkViewModel()
  const bytes = Number(vm.sizeBytes)

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Testing work</h1>
      <p className="text-sm text-gray-600">
        You see the task, the pay, and the deadline before you accept. Product access appears only
        after you accept.
      </p>
      {vm.error ? <p className="text-sm text-red-600">{vm.error.message}</p> : null}

      <section className="rounded border border-gray-200 bg-white p-4">
        <h2 className="font-medium">Your device</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <input className="rounded border px-3 py-2 text-sm" value={vm.deviceModel} onChange={(event) => vm.setDeviceModel(event.target.value)} />
          <input className="rounded border px-3 py-2 text-sm" value={vm.os} onChange={(event) => vm.setOs(event.target.value)} />
          <button type="button" className="rounded bg-gray-900 px-3 py-2 text-sm text-white" onClick={vm.saveProfile}>
            {vm.profile ? 'Update profile' : 'Save profile'}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {vm.profile ? `Device checked: ${vm.profile.deviceChecked ? 'yes' : 'no'}` : 'No profile yet.'}
        </p>
      </section>

      <section className="space-y-4">
        {vm.assignments.length === 0 ? <p className="text-sm text-gray-500">No offers yet.</p> : null}
        {vm.assignments.map((assignment) => (
          <article key={assignment.id} className="rounded border border-gray-200 bg-white p-4 text-sm">
            <p className="font-medium">{assignment.status}</p>
            <p>
              ${(assignment.compensationCents / 100).toFixed(2)} {assignment.currency} · {assignment.timeCommitment}
            </p>
            <p>Evidence: {assignment.evidenceRequired}</p>
            <p>Consent required: {assignment.consentRequired ? 'yes' : 'no'}</p>
            {assignment.access ? (
              <p className="mt-2">
                Access: {assignment.access.username} / {assignment.access.secret}
              </p>
            ) : (
              <p className="mt-2 text-gray-600">Access is hidden until you accept.</p>
            )}
            {assignment.status === 'offered' ? (
              <button type="button" className="mt-3 rounded bg-gray-900 px-3 py-2 text-white" onClick={() => vm.accept(assignment.id)}>
                Accept
              </button>
            ) : null}
            {assignment.status === 'accepted' ? (
              <form
                className="mt-3 grid gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  vm.run(assignment)
                }}
              >
                <label>
                  Note
                  <textarea className="mt-1 w-full rounded border px-3 py-2" value={vm.notes} onChange={(event) => vm.setNotes(event.target.value)} />
                </label>
                <label>
                  Evidence file
                  <input className="mt-1 w-full rounded border px-3 py-2" value={vm.fileName} onChange={(event) => vm.setFileName(event.target.value)} />
                </label>
                <label>
                  Size in bytes {Number.isFinite(bytes) ? `· ${(bytes / 1024).toFixed(1)} KB` : ''}
                  <input className="mt-1 w-full rounded border px-3 py-2" value={vm.sizeBytes} onChange={(event) => vm.setSizeBytes(event.target.value)} />
                </label>
                <button type="submit" className="w-fit rounded bg-blue-600 px-3 py-2 text-white">
                  Save and submit pass
                </button>
              </form>
            ) : null}
            {assignment.status === 'accepted' ? (
              <form
                className="mt-4 grid gap-2 border-t border-gray-100 pt-3"
                onSubmit={(event) => {
                  event.preventDefault()
                  vm.fileFinding(assignment)
                }}
              >
                <p className="font-medium">Report a finding</p>
                <input className="rounded border px-3 py-2" aria-label="Finding title" value={vm.findingTitle} onChange={(event) => vm.setFindingTitle(event.target.value)} />
                <input className="rounded border px-3 py-2" aria-label="Actual behaviour" value={vm.findingActual} onChange={(event) => vm.setFindingActual(event.target.value)} />
                <input className="rounded border px-3 py-2" aria-label="Expected behaviour" value={vm.findingExpected} onChange={(event) => vm.setFindingExpected(event.target.value)} />
                <textarea className="rounded border px-3 py-2" aria-label="Finding steps" value={vm.findingSteps} onChange={(event) => vm.setFindingSteps(event.target.value)} />
                <button type="submit" className="w-fit rounded bg-gray-900 px-3 py-2 text-white">File finding</button>
              </form>
            ) : null}
          </article>
        ))}
        {vm.submitted ? <p className="text-sm text-green-700">Result submitted.</p> : null}
        {vm.filed ? <p className="text-sm text-green-700">Finding filed.</p> : null}
        {vm.findings.map((finding) => {
          const latest = finding.reviews[finding.reviews.length - 1]
          return (
            <article key={finding.id} className="rounded border border-gray-200 bg-white p-4 text-sm">
              <p className="font-medium">{finding.title}</p>
              <p>{latest ? `${latest.outcome} · ${latest.reason}` : 'Waiting for review'}</p>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  vm.commentOnFinding(finding.id)
                }}
              >
                <input className="flex-1 rounded border px-3 py-2" aria-label="Reply" value={vm.findingComment} onChange={(event) => vm.setFindingComment(event.target.value)} />
                <button type="submit" className="rounded border px-3 py-2">Reply</button>
              </form>
            </article>
          )
        })}
      </section>
    </main>
  )
}
