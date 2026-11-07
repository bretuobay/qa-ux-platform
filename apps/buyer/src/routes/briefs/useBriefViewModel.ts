import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { DEV_APPLICATION_ID } from '@qa-ux/contracts'
import type { Platform, ServiceModule } from '@qa-ux/contracts'
import { api } from '../../api.js'

function lines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

export function useBriefViewModel() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [module, setModule] = useState<ServiceModule>('qa_check')
  const [platform, setPlatform] = useState<Platform>('web')
  const [audience, setAudience] = useState('')
  const [goals, setGoals] = useState('')
  const [journeys, setJourneys] = useState('')
  const [tasks, setTasks] = useState('')
  const [participationTasks, setParticipationTasks] = useState('')
  const [betaDurationDays, setBetaDurationDays] = useState('14')
  const [changedAreas, setChangedAreas] = useState('')
  const [priorOrderId, setPriorOrderId] = useState('')
  const [testerCount, setTesterCount] = useState('3')

  const mutation = useMutation({
    mutationFn: async () => {
      const duration = Number(betaDurationDays)
      return api('/api/v1/briefs', {
        method: 'POST',
        body: JSON.stringify({
          applicationId: DEV_APPLICATION_ID,
          title,
          module,
          platform,
          audience,
          goals,
          journeys: lines(journeys),
          tasks: lines(tasks),
          participationTasks: lines(participationTasks),
          betaDurationDays: module === 'beta_launch' ? duration : undefined,
          changedAreas: changedAreas.trim() || undefined,
          priorOrderId: priorOrderId.trim() || undefined,
          testerCount: Number(testerCount),
        }),
      })
    },
    onSuccess: () => navigate('/orders'),
  })

  return {
    title,
    setTitle,
    module,
    setModule,
    platform,
    setPlatform,
    audience,
    setAudience,
    goals,
    setGoals,
    journeys,
    setJourneys,
    tasks,
    setTasks,
    participationTasks,
    setParticipationTasks,
    betaDurationDays,
    setBetaDurationDays,
    changedAreas,
    setChangedAreas,
    priorOrderId,
    setPriorOrderId,
    testerCount,
    setTesterCount,
    submit: () => mutation.mutate(),
    isPending: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error : null,
  }
}
