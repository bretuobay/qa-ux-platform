import { Hono } from 'hono'
import type { WorkerEnv } from '../types/worker-env.js'

const orders = new Hono<{ Bindings: WorkerEnv }>()

orders.get('/', async (c) => {
  // TODO: list orders for the current business
  return c.json({ data: [], meta: { total: 0 } })
})

orders.post('/', async (c) => {
  // TODO: create a new order
  return c.json({ message: 'Create order stub — not implemented' }, 501)
})

orders.get('/:id', async (c) => {
  const id = c.req.param('id')
  // TODO: fetch single order
  return c.json({ message: `Get order ${id} stub — not implemented` }, 501)
})

orders.patch('/:id', async (c) => {
  const id = c.req.param('id')
  // TODO: update order
  return c.json({ message: `Update order ${id} stub — not implemented` }, 501)
})

orders.delete('/:id', async (c) => {
  const id = c.req.param('id')
  // TODO: cancel / delete order
  return c.json({ message: `Delete order ${id} stub — not implemented` }, 501)
})

export { orders }
