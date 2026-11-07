import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { DEV_BUSINESS_ID, DEV_TESTER_ID } from '@qa-ux/contracts'
import type { Execution, Finding, Order, Scenario, TesterProfile } from '@qa-ux/contracts'
import type { AssignmentView } from '@qa-ux/domain'
import { api } from '../../api.js'

const testerHeaders = { 'x-tester-id': DEV_TESTER_ID }

async function testerApi<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('x-tester-id', DEV_TESTER_ID)
  return api<T>(path, { ...init, headers })
}

export function useWorkViewModel() {
  const queryClient = useQueryClient()
  const [os, setOs] = useState('Android 14')
  const [deviceModel, setDeviceModel] = useState('Pixel 7')
  const [notes, setNotes] = useState('Completed the journey. No defect found.')
  const [fileName, setFileName] = useState('invoice.png')
  const [sizeBytes, setSizeBytes] = useState('180000')
  const [findingTitle, setFindingTitle] = useState('Checkout stays on the spinner')
  const [findingActual, setFindingActual] = useState('The pay button never finishes')
  const [findingExpected, setFindingExpected] = useState('A receipt is shown')
  const [findingSteps, setFindingSteps] = useState('Open the invoice and tap Pay')
  const [findingComment, setFindingComment] = useState('')

  const profile = useQuery({
    queryKey: ['tester-profile'],
    queryFn: async () => {
      const res = await fetch('/api/v1/testers/me', {
        headers: { ...testerHeaders, 'x-business-id': DEV_BUSINESS_ID },
      })
      if (res.status === 404) return null
      if (!res.ok) throw new Error('Could not load profile')
      return (await res.json()) as { profile: TesterProfile }
    },
    staleTime: 0,
  })
  const assignments = useQuery({
    queryKey: ['my-assignments'],
    queryFn: () => testerApi<{ data: AssignmentView[] }>('/api/v1/testers/me/assignments'),
    staleTime: 0,
  })

  const saveProfile = useMutation({
    mutationFn: () =>
      testerApi('/api/v1/testers/me', {
        method: 'PUT',
        body: JSON.stringify({
          deviceModel,
          os,
          devices: ['Pixel 7'],
          languages: ['en'],
          deviceChecked: true,
          qualification: 'passed',
          isAvailable: true,
          payoutMethod: 'bank transfer',
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tester-profile'] })
    },
  })

  const accept = useMutation({
    mutationFn: (id: string) => testerApi(`/api/v1/assignments/${id}/accept`, { method: 'POST' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-assignments'] })
    },
  })

  const findings = useQuery({
    queryKey: ['my-findings', assignments.data?.data.map((item) => item.orderId).join(',')],
    enabled: Boolean(assignments.data),
    queryFn: async () => {
      const orderIds = [...new Set((assignments.data?.data ?? []).map((item) => item.orderId))]
      const lists = await Promise.all(
        orderIds.map((orderId) => testerApi<{ data: Finding[] }>(`/api/v1/findings?orderId=${orderId}`))
      )
      return lists.flatMap((list) => list.data)
    },
    staleTime: 0,
  })

  const fileFinding = useMutation({
    mutationFn: async (assignment: AssignmentView) => {
      const detail = await testerApi<{ order: Order }>(`/api/v1/orders/${assignment.orderId}`)
      if (!detail.order.buildId) throw new Error('Attach a build before filing a finding.')
      return testerApi('/api/v1/findings', {
        method: 'POST',
        body: JSON.stringify({
          orderId: assignment.orderId,
          type: 'bug',
          title: findingTitle,
          steps: findingSteps,
          expectedBehavior: findingExpected,
          actualBehavior: findingActual,
          buildId: detail.order.buildId,
          reproducibility: 'always',
          severity: 'high',
          journey: 'Pay an invoice',
        }),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-findings'] })
    },
  })

  const commentOnFinding = useMutation({
    mutationFn: (id: string) =>
      testerApi(`/api/v1/findings/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: findingComment }),
      }),
    onSuccess: async () => {
      setFindingComment('')
      await queryClient.invalidateQueries({ queryKey: ['my-findings'] })
    },
  })

  const run = useMutation({
    mutationFn: async (input: { assignment: AssignmentView }) => {
      const scenarios = await testerApi<{ data: Scenario[] }>(
        `/api/v1/scenarios?orderId=${input.assignment.orderId}`
      )
      const scenario = scenarios.data[0]
      if (!scenario) throw new Error('No scenario has been added yet.')
      const created = await testerApi<{ execution: Execution }>('/api/v1/executions', {
        method: 'POST',
        body: JSON.stringify({ scenarioId: scenario.id, assignmentId: input.assignment.id }),
      })
      const withNote = await testerApi<{ execution: Execution }>(`/api/v1/executions/${created.execution.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ outcome: 'pass', notes }),
      })
      const size = Number(sizeBytes)
      const withEvidence = await testerApi<{ execution: Execution }>(
        `/api/v1/executions/${withNote.execution.id}/evidence`,
        {
          method: 'POST',
          body: JSON.stringify({ fileName, sizeBytes: size, contentType: 'image/png' }),
        }
      )
      const evidence = withEvidence.execution.evidence[0]
      if (!evidence) throw new Error('Evidence was not recorded.')
      await testerApi(`/api/v1/executions/${withEvidence.execution.id}/evidence/${evidence.id}`, {
        method: 'POST',
        body: JSON.stringify({ status: 'uploaded' }),
      })
      return testerApi(`/api/v1/executions/${withEvidence.execution.id}/submit`, { method: 'POST' })
    },
  })

  return {
    testerId: DEV_TESTER_ID,
    profile: profile.data?.profile ?? null,
    assignments: assignments.data?.data ?? [],
    os,
    setOs,
    deviceModel,
    setDeviceModel,
    notes,
    setNotes,
    fileName,
    setFileName,
    sizeBytes,
    setSizeBytes,
    findingTitle,
    setFindingTitle,
    findingActual,
    setFindingActual,
    findingExpected,
    setFindingExpected,
    findingSteps,
    setFindingSteps,
    findingComment,
    setFindingComment,
    findings: findings.data ?? [],
    fileFinding: (assignment: AssignmentView) => fileFinding.mutate(assignment),
    commentOnFinding: (id: string) => commentOnFinding.mutate(id),
    filed: fileFinding.isSuccess,
    saveProfile: () => saveProfile.mutate(),
    accept: (id: string) => accept.mutate(id),
    run: (assignment: AssignmentView) => run.mutate({ assignment }),
    error:
      (profile.error instanceof Error && profile.error) ||
      (saveProfile.error instanceof Error && saveProfile.error) ||
      (accept.error instanceof Error && accept.error) ||
      (run.error instanceof Error && run.error) ||
      (fileFinding.error instanceof Error && fileFinding.error) ||
      (commentOnFinding.error instanceof Error && commentOnFinding.error) ||
      null,
    submitted: run.isSuccess,
  }
}
