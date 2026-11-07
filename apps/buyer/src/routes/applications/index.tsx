import type { Platform } from '@qa-ux/contracts'
import { useApplicationsViewModel } from './useApplicationsViewModel.js'

export default function ApplicationsPage() {
  const vm = useApplicationsViewModel()

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Applications</h1>
      <p className="mt-2 text-sm text-gray-600">
        Register the product, an environment, and a build. Builds are kept as they were recorded. A
        later build does not erase an earlier one.
      </p>

      <form
        className="mt-6 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          vm.createApplication()
        }}
      >
        <label className="text-sm">
          Name
          <input
            className="mt-1 block rounded border border-gray-300 px-3 py-2"
            value={vm.name}
            onChange={(event) => vm.setName(event.target.value)}
          />
        </label>
        <label className="text-sm">
          Platform
          <select
            className="mt-1 block rounded border border-gray-300 px-3 py-2"
            value={vm.platform}
            onChange={(event) => vm.setPlatform(event.target.value as Platform)}
          >
            <option value="web">Web</option>
            <option value="android">Android</option>
            <option value="ios">iOS</option>
          </select>
        </label>
        <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-sm text-white">
          Add application
        </button>
      </form>

      {vm.isLoading ? <p className="mt-6 text-gray-500">Loading…</p> : null}
      {vm.error ? <p className="mt-4 text-sm text-red-600">{vm.error.message}</p> : null}

      <ul className="mt-6 space-y-3">
        {vm.applications.map((application) => (
          <li key={application.id}>
            <button
              type="button"
              className="text-left font-medium hover:underline"
              onClick={() => vm.setSelectedId(application.id)}
            >
              {application.name} · {application.platform}
            </button>
          </li>
        ))}
      </ul>

      {vm.selectedId ? (
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <form
            className="space-y-3 rounded border border-gray-200 bg-white p-4"
            onSubmit={(event) => {
              event.preventDefault()
              vm.createEnvironment()
            }}
          >
            <h2 className="font-medium">Environment</h2>
            <input
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="Chrome on macOS"
              value={vm.environmentName}
              onChange={(event) => vm.setEnvironmentName(event.target.value)}
            />
            <button type="submit" className="rounded bg-gray-900 px-3 py-2 text-sm text-white">
              Add environment
            </button>
            <ul className="text-sm text-gray-600">
              {vm.environments.map((environment) => (
                <li key={environment.id}>{environment.name}</li>
              ))}
            </ul>
          </form>
          <form
            className="space-y-3 rounded border border-gray-200 bg-white p-4"
            onSubmit={(event) => {
              event.preventDefault()
              vm.createBuild()
            }}
          >
            <h2 className="font-medium">Build</h2>
            <input
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="Version"
              value={vm.version}
              onChange={(event) => vm.setVersion(event.target.value)}
            />
            <input
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="https://example.com/build"
              value={vm.downloadUrl}
              onChange={(event) => vm.setDownloadUrl(event.target.value)}
            />
            <button type="submit" className="rounded bg-gray-900 px-3 py-2 text-sm text-white">
              Record build
            </button>
            <ul className="text-sm text-gray-600">
              {vm.builds.map((build) => (
                <li key={build.id}>
                  {build.version}
                  {build.downloadUrl ? ` · ${build.downloadUrl}` : ''}
                </li>
              ))}
            </ul>
          </form>
        </section>
      ) : null}
      {vm.actionError ? <p className="mt-4 text-sm text-red-600">{vm.actionError.message}</p> : null}
    </main>
  )
}
