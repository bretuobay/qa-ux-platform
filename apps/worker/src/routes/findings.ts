import { Hono } from 'hono'
import type { WorkerEnv } from '../types/worker-env.js'

const findings = new Hono<{ Bindings: WorkerEnv }>()

findings.get('/', async (c) => {
  // TODO: list findings
  return c.json({ data: [], meta: { total: 0 } })
})

findings.post('/', async (c) => {
  // TODO: create finding
  return c.json({ message: 'Create finding stub — not implemented' }, 501)
})

findings.get('/:id', async (c) => {
  const id = c.req.param('id')
  // TODO: get single finding
  return c.json({ message: `Get finding ${id} stub — not implemented` }, 501)
})

findings.patch('/:id/status', async (c) => {
  const id = c.req.param('id')
  // TODO: update finding status
  return c.json({ message: `Update finding ${id} status stub — not implemented` }, 501)
})

export { findings }
