import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { Order, OrderActivity, OrderEvent, Quote } from '@qa-ux/contracts'
import { api } from '../../api.js'

interface OrderDetailResponse {
  order: Order
  events: OrderActivity[]
  quotes: Quote[]
}

export function useOrderDetailViewModel(orderId: string) {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')

  const query = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api<OrderDetailResponse>(`/api/v1/orders/${orderId}`),
    staleTime: 0,
  })

  const transition = useMutation({
    mutationFn: (event: OrderEvent) =>
      api(`/api/v1/orders/${orderId}/transition`, {
        method: 'POST',
        body: JSON.stringify({ event, reason: reason.trim() || undefined }),
      }),
    onSuccess: async () => {
      setReason('')
      await queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      await queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  return {
    order: query.data?.order,
    events: query.data?.events ?? [],
    quotes: query.data?.quotes ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : null,
    reason,
    setReason,
    transition,
  }
}
