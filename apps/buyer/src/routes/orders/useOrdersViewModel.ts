import { useQuery } from '@tanstack/react-query'
import type { Order, Quote } from '@qa-ux/contracts'
import { api } from '../../api.js'

interface OrdersResponse {
  data: Order[]
  quotes: Quote[]
}

async function fetchOrders(): Promise<OrdersResponse> {
  return api<OrdersResponse>('/api/v1/orders')
}

export interface OrdersViewModel {
  orders: Order[]
  quotes: Quote[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export function useOrdersViewModel(): OrdersViewModel {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    staleTime: 0,
  })

  return {
    orders: data?.data ?? [],
    quotes: data?.quotes ?? [],
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch,
  }
}
