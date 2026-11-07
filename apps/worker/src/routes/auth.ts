import { Hono } from 'hono'
import type { WorkerEnv } from '../types/worker-env.js'

const auth = new Hono<{ Bindings: WorkerEnv }>()

auth.post('/login', async (c) => {
  // TODO: validate credentials and issue session cookie
  return c.json({ message: 'Login stub — not implemented' }, 501)
})

auth.post('/logout', async (c) => {
  // TODO: invalidate session and clear cookie
  return c.json({ message: 'Logout stub — not implemented' }, 501)
})

auth.get('/me', async (c) => {
  // TODO: return current user from session
  return c.json({ message: 'Me stub — not implemented' }, 501)
})

export { auth }
