import { useDashboardViewModel } from './useDashboardViewModel.js'

export default function DashboardPage() {
  const { stats, isLoading, isError, error } = useDashboardViewModel()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading dashboard…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">Failed to load dashboard: {error?.message}</p>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Supplier Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active Orders" value={stats?.activeOrders ?? 0} colour="blue" />
        <StatCard label="Open Findings" value={stats?.openFindings ?? 0} colour="amber" />
        <StatCard label="Completed Orders" value={stats?.completedOrders ?? 0} colour="green" />
      </div>
    </main>
  )
}

function StatCard({
  label,
  value,
  colour,
}: {
  label: string
  value: number
  colour: 'blue' | 'amber' | 'green'
}) {
  const colours = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    green: 'bg-green-50 text-green-700 border-green-200',
  }

  return (
    <div className={`rounded-lg border p-6 ${colours[colour]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm font-medium">{label}</p>
    </div>
  )
}
