import { useQuery } from '@tanstack/react-query'
import type { Finding, Order } from '@qa-ux/contracts'
import { isOpenFinding } from '@qa-ux/domain'
import { api } from '../../api.js'

interface DashboardStats {
  activeOrders: number
  openFindings: number
  completedOrders: number
  awaitingQuote: number
}

const OPEN = new Set<Order['status']>([
  'scope_review',
  'quoted',
  'accepted',
  'payment_pending',
  'readiness_check',
  'recruiting',
  'scheduled',
  'in_progress',
  'review',
  'delivered',
  'retest',
  'paused',
])

async function fetchDashboardStats(): Promise<DashboardStats> {
  const [ordersJson, findingsJson] = await Promise.all([
    api<{ data: Order[] }>('/api/v1/orders'),
    api<{ data: Finding[] }>('/api/v1/findings'),
  ])

  const orders = ordersJson.data
  return {
    activeOrders: orders.filter((order) => OPEN.has(order.status)).length,
    awaitingQuote: orders.filter((order) => order.status === 'scope_review').length,
    openFindings: findingsJson.data.filter((finding) => isOpenFinding(finding)).length,
    completedOrders: orders.filter((order) => order.status === 'closed').length,
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
    staleTime: 0,
  })

  return {
    stats: data,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
  }
}
