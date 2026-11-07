import type { Platform, ServiceModule } from '@qa-ux/contracts'
import { useBriefViewModel } from './useBriefViewModel.js'

const MODULES: { value: ServiceModule; label: string }[] = [
  { value: 'qa_check', label: 'QA check' },
  { value: 'usability_study', label: 'Usability study' },
  { value: 'beta_launch', label: 'Beta launch' },
  { value: 'combined_launch', label: 'Combined launch' },
  { value: 'release_check', label: 'Release check' },
]

export default function BriefPage() {
  const vm = useBriefViewModel()
  const showJourneys =
    vm.module === 'qa_check' || vm.module === 'combined_launch' || vm.module === 'release_check'
  const showTasks = vm.module === 'usability_study' || vm.module === 'combined_launch'

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">What should we test?</h1>
      <p className="mt-2 text-sm text-gray-600">
        Describe the journeys in plain language. iOS can be requested now. Delivery starts with web
        and Android.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          vm.submit()
        }}
      >
        <Field label="Title" value={vm.title} onChange={vm.setTitle} />
        <label className="block text-sm font-medium">
          Offer
          <select
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            value={vm.module}
            onChange={(event) => vm.setModule(event.target.value as ServiceModule)}
          >
            {MODULES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Platform
          <select
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            value={vm.platform}
            onChange={(event) => vm.setPlatform(event.target.value as Platform)}
          >
            <option value="web">Web</option>
            <option value="android">Android</option>
            <option value="ios">iOS</option>
          </select>
        </label>
        <Field label="Who is this for?" value={vm.audience} onChange={vm.setAudience} />
        <Area label="What do you need to learn?" value={vm.goals} onChange={vm.setGoals} />
        {showJourneys ? (
          <Area
            label="Critical journeys (one per line)"
            value={vm.journeys}
            onChange={vm.setJourneys}
          />
        ) : null}
        {showTasks ? (
          <Area label="Tasks (one per line)" value={vm.tasks} onChange={vm.setTasks} />
        ) : null}
        {vm.module === 'beta_launch' ? (
          <>
            <Field
              label="Duration in days"
              value={vm.betaDurationDays}
              onChange={vm.setBetaDurationDays}
            />
            <Area
              label="Participation tasks (one per line)"
              value={vm.participationTasks}
              onChange={vm.setParticipationTasks}
            />
          </>
        ) : null}
        {vm.module === 'release_check' ? (
          <>
            <Field
              label="Earlier order id"
              value={vm.priorOrderId}
              onChange={vm.setPriorOrderId}
            />
            <Area label="What changed?" value={vm.changedAreas} onChange={vm.setChangedAreas} />
          </>
        ) : null}
        <Field label="How many testers?" value={vm.testerCount} onChange={vm.setTesterCount} />

        {vm.error ? <p className="whitespace-pre-wrap text-sm text-red-600">{vm.error.message}</p> : null}

        <button
          type="submit"
          disabled={vm.isPending}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {vm.isPending ? 'Saving…' : 'Save draft'}
        </button>
      </form>
    </main>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <textarea
        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
