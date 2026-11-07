import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type {
  CustomerPriority,
  Finding,
  Order,
  OrderActivity,
  OrderEvent,
  ProductBuild,
  Quote,
  ReadinessCheck,
  Report,
} from '@qa-ux/contracts'
import { api } from '../../api.js'

interface OrderDetailResponse {
  order: Order
  events: OrderActivity[]
  quotes: Quote[]
  build: ProductBuild | null
  blockers: ReadinessCheck[]
}

export function useOrderDetailViewModel(orderId: string) {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const [type, setType] = useState('')
  const [severity, setSeverity] = useState('')
  const [outcome, setOutcome] = useState('')
  const [journey, setJourney] = useState('')
  const [comment, setComment] = useState('')

  const query = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api<OrderDetailResponse>(`/api/v1/orders/${orderId}`),
    staleTime: 0,
  })

  const params = new URLSearchParams({ orderId })
  if (type) params.set('type', type)
  if (severity) params.set('severity', severity)
  if (outcome) params.set('outcome', outcome)
  if (journey.trim()) params.set('journey', journey.trim())
  const findingQuery = params.toString()

  const findings = useQuery({
    queryKey: ['findings', findingQuery],
    queryFn: () => api<{ data: Finding[] }>(`/api/v1/findings?${findingQuery}`),
    staleTime: 0,
  })
  const reports = useQuery({
    queryKey: ['reports', orderId],
    queryFn: () => api<{ data: Report[] }>(`/api/v1/reports?orderId=${orderId}`),
    staleTime: 0,
  })

  async function refreshFindings() {
    await queryClient.invalidateQueries({ queryKey: ['findings'] })
  }

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

  const priority = useMutation({
    mutationFn: (input: { id: string; priority: CustomerPriority }) =>
      api(`/api/v1/findings/${input.id}/priority`, {
        method: 'POST',
        body: JSON.stringify({ priority: input.priority }),
      }),
    onSuccess: refreshFindings,
  })

  const appeal = useMutation({
    mutationFn: (id: string) =>
      api(`/api/v1/findings/${id}/appeal`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Please review this again' }),
      }),
    onSuccess: refreshFindings,
  })

  const addComment = useMutation({
    mutationFn: (id: string) =>
      api(`/api/v1/findings/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: comment }),
      }),
    onSuccess: async () => {
      setComment('')
      await refreshFindings()
    },
  })

  const error =
    [findings.error, reports.error, priority.error, appeal.error, addComment.error].find(
      (item) => item instanceof Error
    ) ?? null

  return {
    order: query.data?.order,
    events: query.data?.events ?? [],
    quotes: query.data?.quotes ?? [],
    build: query.data?.build ?? null,
    blockers: query.data?.blockers ?? [],
    findings: findings.data?.data ?? [],
    reports: reports.data?.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : error instanceof Error ? error : null,
    reason,
    setReason,
    type,
    setType,
    severity,
    setSeverity,
    outcome,
    setOutcome,
    journey,
    setJourney,
    comment,
    setComment,
    transition,
    setPriority: (id: string, next: CustomerPriority) => priority.mutate({ id, priority: next }),
    appeal: (id: string) => appeal.mutate(id),
    addComment: (id: string) => addComment.mutate(id),
  }
}
