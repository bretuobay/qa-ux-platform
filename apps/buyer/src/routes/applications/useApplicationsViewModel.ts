import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { Platform, ProductApplication, ProductBuild, TestEnvironment } from '@qa-ux/contracts'
import { api } from '../../api.js'

export function useApplicationsViewModel() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [platform, setPlatform] = useState<Platform>('web')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [environmentName, setEnvironmentName] = useState('')
  const [version, setVersion] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')

  const applications = useQuery({
    queryKey: ['applications'],
    queryFn: () => api<{ data: ProductApplication[] }>('/api/v1/applications'),
    staleTime: 0,
  })

  const selected = selectedId
  const environments = useQuery({
    queryKey: ['environments', selected],
    queryFn: () => api<{ data: TestEnvironment[] }>(`/api/v1/applications/${selected}/environments`),
    enabled: Boolean(selected),
    staleTime: 0,
  })
  const builds = useQuery({
    queryKey: ['builds', selected],
    queryFn: () => api<{ data: ProductBuild[] }>(`/api/v1/applications/${selected}/builds`),
    enabled: Boolean(selected),
    staleTime: 0,
  })

  const createApplication = useMutation({
    mutationFn: () =>
      api('/api/v1/applications', {
        method: 'POST',
        body: JSON.stringify({ name, platform }),
      }),
    onSuccess: async () => {
      setName('')
      await queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })

  const createEnvironment = useMutation({
    mutationFn: () =>
      api(`/api/v1/applications/${selected}/environments`, {
        method: 'POST',
        body: JSON.stringify({ name: environmentName, platform }),
      }),
    onSuccess: async () => {
      setEnvironmentName('')
      await queryClient.invalidateQueries({ queryKey: ['environments', selected] })
    },
  })

  const createBuild = useMutation({
    mutationFn: () =>
      api(`/api/v1/applications/${selected}/builds`, {
        method: 'POST',
        body: JSON.stringify({
          version,
          platform,
          ...(downloadUrl.trim() ? { downloadUrl: downloadUrl.trim() } : {}),
        }),
      }),
    onSuccess: async () => {
      setVersion('')
      setDownloadUrl('')
      await queryClient.invalidateQueries({ queryKey: ['builds', selected] })
    },
  })

  return {
    applications: applications.data?.data ?? [],
    environments: environments.data?.data ?? [],
    builds: builds.data?.data ?? [],
    isLoading: applications.isLoading,
    error: applications.error instanceof Error ? applications.error : null,
    name,
    setName,
    platform,
    setPlatform,
    selectedId,
    setSelectedId,
    environmentName,
    setEnvironmentName,
    version,
    setVersion,
    downloadUrl,
    setDownloadUrl,
    createApplication: () => createApplication.mutate(),
    createEnvironment: () => createEnvironment.mutate(),
    createBuild: () => createBuild.mutate(),
    actionError:
      (createApplication.error instanceof Error && createApplication.error) ||
      (createEnvironment.error instanceof Error && createEnvironment.error) ||
      (createBuild.error instanceof Error && createBuild.error) ||
      null,
  }
}
