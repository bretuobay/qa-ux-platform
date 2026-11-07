import type { Context, Next } from 'hono'
import type { WorkerEnv } from '../types/worker-env.js'

declare module 'hono' {
  interface ContextVariableMap {
    businessId: string
  }
}

export async function businessMiddleware(
  c: Context<{ Bindings: WorkerEnv }>,
  next: Next
): Promise<Response | void> {
  const businessId = c.req.header('X-Business-Id')

  if (!businessId) {
    return c.json({ error: 'X-Business-Id header is required' }, 400)
  }

  c.set('businessId', businessId)
  return next()
}
