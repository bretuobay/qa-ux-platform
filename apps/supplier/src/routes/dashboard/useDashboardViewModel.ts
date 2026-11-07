import { useQuery } from '@tanstack/react-query'
import type { Order, Finding } from '@qa-ux/contracts'

interface DashboardStats {
  activeOrders: number
  openFindings: number
  completedOrders: number
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const [ordersRes, findingsRes] = await Promise.all([
    fetch('/api/v1/orders'),
    fetch('/api/v1/findings'),
  ])

  if (!ordersRes.ok) throw new Error(`Orders fetch failed: ${ordersRes.status}`)
  if (!findingsRes.ok) throw new Error(`Findings fetch failed: ${findingsRes.status}`)

  const ordersJson = (await ordersRes.json()) as { data: Order[] }
  const findingsJson = (await findingsRes.json()) as { data: Finding[] }

  const orders = ordersJson.data
  const findingsData = findingsJson.data

  return {
    activeOrders: orders.filter((o) => o.status === 'active').length,
    openFindings: findingsData.filter((f) => f.status === 'open').length,
    completedOrders: orders.filter((o) => o.status === 'completed').length,
  }
}

export interface DashboardViewModel {
  stats: DashboardStats | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
}

export function useDashboardViewModel(): DashboardViewModel {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  })

  return {
    stats: data,
    isLoading,
    isError,
    error: error as Error | null,
  }
}
