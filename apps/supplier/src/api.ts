import { DEV_BUSINESS_ID } from '@qa-ux/contracts'

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('x-business-id', DEV_BUSINESS_ID)
  if (init?.body) headers.set('content-type', 'application/json')
  const res = await fetch(path, { ...init, headers })
  const json = (await res.json().catch(() => null)) as {
    error?: string
    errors?: string[]
  } | null
  if (!res.ok) {
    const details = json?.errors?.join('\n')
    throw new Error(details || json?.error || `Request failed (${res.status})`)
  }
  return json as T
}
