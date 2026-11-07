import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { DEV_BUSINESS_ID, DEV_TESTER_ID } from '@qa-ux/contracts'
import type { Execution, Scenario, TesterProfile } from '@qa-ux/contracts'
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
    saveProfile: () => saveProfile.mutate(),
    accept: (id: string) => accept.mutate(id),
    run: (assignment: AssignmentView) => run.mutate({ assignment }),
    error:
      (profile.error instanceof Error && profile.error) ||
      (saveProfile.error instanceof Error && saveProfile.error) ||
      (accept.error instanceof Error && accept.error) ||
      (run.error instanceof Error && run.error) ||
      null,
    submitted: run.isSuccess,
  }
}
