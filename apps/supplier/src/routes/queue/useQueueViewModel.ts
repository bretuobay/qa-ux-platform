import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { Order, OrderEvent, Quote } from '@qa-ux/contracts'
import { api } from '../../api.js'

interface QueueResponse {
  data: Order[]
  quotes: Quote[]
}

export function useQueueViewModel() {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const [quotingId, setQuotingId] = useState<string | null>(null)
  const [feeDollars, setFeeDollars] = useState('500')
  const [deliverables, setDeliverables] = useState(
    'Reviewed findings for the journeys named in the brief'
  )
  const [formError, setFormError] = useState<string | null>(null)

  const query = useQuery({
    queryKey: ['orders'],
    queryFn: () => api<QueueResponse>('/api/v1/orders'),
    staleTime: 0,
  })

  const transition = useMutation({
    mutationFn: (input: {
      orderId: string
      event: OrderEvent
      reason?: string
      quote?: {
        lineItems: { description: string; amountCents: number }[]
        deliverables: string
        expiresAt: string
        currency: string
      }
    }) =>
      api(`/api/v1/orders/${input.orderId}/transition`, {
        method: 'POST',
        body: JSON.stringify({
          event: input.event,
          reason: input.reason,
          quote: input.quote,
        }),
      }),
    onSuccess: async () => {
      setReason('')
      setQuotingId(null)
      setFormError(null)
      await queryClient.invalidateQueries({ queryKey: ['orders'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })

  function issueQuote(orderId: string) {
    const amountCents = Math.round(Number(feeDollars) * 100)
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setFormError('Enter a service fee greater than zero.')
      return
    }
    if (deliverables.trim() === '') {
      setFormError('Deliverables are required.')
      return
    }
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    transition.mutate({
      orderId,
      event: 'issue_quote',
      quote: {
        lineItems: [{ description: 'Service fee', amountCents }],
        deliverables: deliverables.trim(),
        expiresAt,
        currency: 'USD',
      },
    })
  }

  const orders = (query.data?.data ?? []).filter(
    (order) => order.status !== 'closed' && order.status !== 'cancelled'
  )

  return {
    orders,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : null,
    reason,
    setReason,
    quotingId,
    setQuotingId,
    feeDollars,
    setFeeDollars,
    deliverables,
    setDeliverables,
    formError,
    issueQuote,
    run: (orderId: string, event: OrderEvent) => {
      const note = reason.trim()
      transition.mutate(note ? { orderId, event, reason: note } : { orderId, event })
    },
    isPending: transition.isPending,
    actionError: transition.error instanceof Error ? transition.error : null,
  }
}
