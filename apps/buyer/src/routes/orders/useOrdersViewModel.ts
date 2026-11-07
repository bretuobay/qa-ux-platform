import { useQuery } from '@tanstack/react-query'
import type { Order } from '@qa-ux/contracts'

async function fetchOrders(): Promise<Order[]> {
  const res = await fetch('/api/v1/orders')
  if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`)
  const json = (await res.json()) as { data: Order[] }
  return json.data
}

export interface OrdersViewModel {
  orders: Order[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export function useOrdersViewModel(): OrdersViewModel {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  })

  return {
    orders: data ?? [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  }
}
