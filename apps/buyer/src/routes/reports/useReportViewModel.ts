import { useQuery } from '@tanstack/react-query'
import { DEV_BUSINESS_ID } from '@qa-ux/contracts'
import type { Report } from '@qa-ux/contracts'
import { api } from '../../api.js'

export function useReportViewModel(reportId: string) {
  const query = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => api<{ report: Report }>(`/api/v1/reports/${reportId}`),
    staleTime: 0,
  })

  async function downloadCsv() {
    const res = await fetch(`/api/v1/reports/${reportId}/csv`, {
      headers: { 'x-business-id': DEV_BUSINESS_ID },
    })
    if (!res.ok) throw new Error('Could not download the report')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `report-${reportId}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return {
    report: query.data?.report,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
    downloadCsv,
  }
}
