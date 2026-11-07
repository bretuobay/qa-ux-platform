import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type {
  Finding,
  ProductApplication,
  ProductBuild,
  ReadinessCheck,
  Report,
  RetestResult,
  ReviewOutcome,
  Scenario,
  TesterProfile,
} from '@qa-ux/contracts'
import { DEV_APPEAL_OPERATOR_ID, READINESS_CHECKS } from '@qa-ux/contracts'
import type { AssignmentView, Coverage, QualityRecord } from '@qa-ux/domain'
import { api } from '../../api.js'

type CheckMap = Record<ReadinessCheck, boolean>

const EMPTY_CHECKS = Object.fromEntries(READINESS_CHECKS.map((check) => [check, false])) as CheckMap

export function useOrderDeskViewModel(orderId: string) {
  const queryClient = useQueryClient()
  const [checks, setChecks] = useState<CheckMap>(EMPTY_CHECKS)
  const [buildId, setBuildId] = useState('')
  const [testerId, setTesterId] = useState('')
  const [journey, setJourney] = useState('')
  const [steps, setSteps] = useState('')
  const [expected, setExpected] = useState('')
  const [accessSecret, setAccessSecret] = useState('')
  const [replaceReason, setReplaceReason] = useState('')
  const [reviewOutcome, setReviewOutcome] = useState<ReviewOutcome>('accepted')
  const [reviewReason, setReviewReason] = useState('Reproduced on the attached build')
  const [retestResult, setRetestResult] = useState<RetestResult>('fixed')
  const [retestBuildId, setRetestBuildId] = useState('')
  const [retestNotes, setRetestNotes] = useState('')
  const [objective, setObjective] = useState('Learn whether the named journeys finish')
  const [authorName, setAuthorName] = useState('Operator')
  const [reviewerName, setReviewerName] = useState('Reviewer')

  const order = useQuery({
    queryKey: ['order', orderId],
    queryFn: () =>
      api<{ order: { id: string; title: string; status: string; buildId?: string }; blockers: ReadinessCheck[] }>(
        `/api/v1/orders/${orderId}`
      ),
    staleTime: 0,
  })
  const applications = useQuery({
    queryKey: ['applications'],
    queryFn: () => api<{ data: ProductApplication[] }>('/api/v1/applications'),
    staleTime: 0,
  })
  const builds = useQuery({
    queryKey: ['all-builds', applications.data?.data.map((item) => item.id).join(',')],
    enabled: Boolean(applications.data),
    queryFn: async () => {
      const lists = await Promise.all(
        (applications.data?.data ?? []).map((application) =>
          api<{ data: ProductBuild[] }>(`/api/v1/applications/${application.id}/builds`)
        )
      )
      return lists.flatMap((list) => list.data)
    },
    staleTime: 0,
  })
  const testers = useQuery({
    queryKey: ['testers'],
    queryFn: () => api<{ data: { profile: TesterProfile; eligible: boolean }[] }>('/api/v1/testers?platform=web'),
    staleTime: 0,
  })
  const assignments = useQuery({
    queryKey: ['assignments', orderId],
    queryFn: () => api<{ data: AssignmentView[] }>(`/api/v1/assignments?orderId=${orderId}`),
    staleTime: 0,
  })
  const findings = useQuery({
    queryKey: ['findings', orderId],
    queryFn: () => api<{ data: Finding[] }>(`/api/v1/findings?orderId=${orderId}`),
    staleTime: 0,
  })
  const reports = useQuery({
    queryKey: ['reports', orderId],
    queryFn: () => api<{ data: Report[] }>(`/api/v1/reports?orderId=${orderId}`),
    staleTime: 0,
  })
  const quality = useQuery({
    queryKey: ['quality', testerId],
    enabled: Boolean(testerId),
    queryFn: () => api<QualityRecord>(`/api/v1/testers/${testerId}/quality`),
    staleTime: 0,
  })
  const scenarios = useQuery({
    queryKey: ['scenarios', orderId],
    queryFn: () => api<{ data: Scenario[]; coverage: Coverage }>(`/api/v1/scenarios?orderId=${orderId}`),
    staleTime: 0,
  })

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    await queryClient.invalidateQueries({ queryKey: ['assignments', orderId] })
    await queryClient.invalidateQueries({ queryKey: ['scenarios', orderId] })
    await queryClient.invalidateQueries({ queryKey: ['findings', orderId] })
    await queryClient.invalidateQueries({ queryKey: ['reports', orderId] })
    await queryClient.invalidateQueries({ queryKey: ['quality', testerId] })
  }

  const saveReadiness = useMutation({
    mutationFn: () =>
      api(`/api/v1/orders/${orderId}/readiness`, {
        method: 'PUT',
        body: JSON.stringify({ checks }),
      }),
    onSuccess: refresh,
  })
  const attach = useMutation({
    mutationFn: () =>
      api(`/api/v1/orders/${orderId}/build`, {
        method: 'POST',
        body: JSON.stringify({ buildId }),
      }),
    onSuccess: refresh,
  })
  const offer = useMutation({
    mutationFn: () =>
      api(`/api/v1/assignments?orderId=${orderId}&platform=web`, {
        method: 'POST',
        body: JSON.stringify({
          testerId,
          timeCommitment: '2 hours',
          compensationCents: 8000,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          evidenceRequired: 'Screenshot or a short note of what happened',
          ...(accessSecret.trim() ? { accessSecret: accessSecret.trim(), accessUsername: 'qa-user' } : {}),
        }),
      }),
    onSuccess: refresh,
  })
  const replace = useMutation({
    mutationFn: (assignmentId: string) =>
      api(`/api/v1/assignments/${assignmentId}/replace`, {
        method: 'POST',
        body: JSON.stringify({ reason: replaceReason }),
      }),
    onSuccess: refresh,
  })
  const addScenario = useMutation({
    mutationFn: () =>
      api(`/api/v1/scenarios?orderId=${orderId}`, {
        method: 'POST',
        body: JSON.stringify({ journey, steps, expectedOutcome: expected, ...(buildId ? { buildId } : {}) }),
      }),
    onSuccess: async () => {
      setJourney('')
      setSteps('')
      setExpected('')
      await refresh()
    },
  })

  const review = useMutation({
    mutationFn: (input: { id: string; appeal: boolean }) =>
      api(`/api/v1/findings/${input.id}/review`, {
        method: 'POST',
        ...(input.appeal ? { headers: { 'x-operator-id': DEV_APPEAL_OPERATOR_ID } } : {}),
        body: JSON.stringify({ outcome: reviewOutcome, reason: reviewReason }),
      }),
    onSuccess: refresh,
  })
  const retest = useMutation({
    mutationFn: (id: string) =>
      api(`/api/v1/findings/${id}/retest`, {
        method: 'POST',
        body: JSON.stringify({
          result: retestResult,
          buildId: retestBuildId,
          ...(retestNotes.trim() ? { notes: retestNotes.trim() } : {}),
        }),
      }),
    onSuccess: refresh,
  })
  const publish = useMutation({
    mutationFn: () =>
      api(`/api/v1/reports`, {
        method: 'POST',
        body: JSON.stringify({ orderId, objective, authorName, reviewerName }),
      }),
    onSuccess: refresh,
  })

  const error =
    [saveReadiness.error, attach.error, offer.error, replace.error, addScenario.error, review.error, retest.error, publish.error].find(
      (item) => item instanceof Error
    ) ?? null

  return {
    title: order.data?.order.title ?? 'Order',
    blockers: order.data?.blockers ?? [],
    builds: builds.data ?? [],
    testers: testers.data?.data ?? [],
    assignments: assignments.data?.data ?? [],
    scenarios: scenarios.data?.data ?? [],
    coverage: scenarios.data?.coverage,
    findings: findings.data?.data ?? [],
    reports: reports.data?.data ?? [],
    quality: quality.data,
    checks,
    setCheck: (check: ReadinessCheck, passed: boolean) => setChecks((current) => ({ ...current, [check]: passed })),
    buildId,
    setBuildId,
    testerId,
    setTesterId,
    journey,
    setJourney,
    steps,
    setSteps,
    expected,
    setExpected,
    accessSecret,
    setAccessSecret,
    replaceReason,
    setReplaceReason,
    saveReadiness: () => saveReadiness.mutate(),
    attach: () => attach.mutate(),
    offer: () => offer.mutate(),
    replace: (id: string) => replace.mutate(id),
    addScenario: () => addScenario.mutate(),
    reviewOutcome,
    setReviewOutcome,
    reviewReason,
    setReviewReason,
    retestResult,
    setRetestResult,
    retestBuildId,
    setRetestBuildId,
    retestNotes,
    setRetestNotes,
    objective,
    setObjective,
    authorName,
    setAuthorName,
    reviewerName,
    setReviewerName,
    review: (id: string, appeal: boolean) => review.mutate({ id, appeal }),
    retest: (id: string) => retest.mutate(id),
    publish: () => publish.mutate(),
    isLoading: order.isLoading,
    error: error instanceof Error ? error : null,
  }
}
