import type { Context, Next } from 'hono'
import type { WorkerEnv } from '../types/worker-env.js'

declare module 'hono' {
  interface ContextVariableMap {
    userId: string
    userRole: string
  }
}

export async function authMiddleware(
  c: Context<{ Bindings: WorkerEnv }>,
  next: Next
): Promise<Response | void> {
  const sessionToken = getCookie(c, 'session')

  if (!sessionToken) {
    return c.json({ error: 'Unauthorised' }, 401)
  }

  // TODO: validate JWT / session token from KV or D1
  // Stub: accept any non-empty cookie value for development
  c.set('userId', 'stub-user-id')
  c.set('userRole', 'buyer')

  return next()
}

function getCookie(c: Context, name: string): string | undefined {
  const cookieHeader = c.req.header('Cookie') ?? ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((s) => {
      const [k, ...v] = s.trim().split('=')
      return [k?.trim() ?? '', v.join('=')]
    })
  )
  return cookies[name]
}
