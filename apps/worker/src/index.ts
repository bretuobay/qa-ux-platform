import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { WorkerEnv } from './types/worker-env.js'
import { auth } from './routes/auth.js'
import { orders } from './routes/orders.js'
import { findings } from './routes/findings.js'
import { handleScheduled } from './jobs/cron.js'

const app = new Hono<{ Bindings: WorkerEnv }>()

app.use('*', logger())
app.use(
  '/api/*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  })
)

app.get('/api/health', (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() })
)

app.route('/api/v1/auth', auth)
app.route('/api/v1/orders', orders)
app.route('/api/v1/findings', findings)

app.notFound((c) => c.json({ error: 'Not found' }, 404))
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default {
  fetch: app.fetch,

  async queue(batch: MessageBatch, env: WorkerEnv, ctx: ExecutionContext): Promise<void> {
    for (const message of batch.messages) {
      try {
        console.log('[queue] Processing message', message.id, message.body)
        // TODO: dispatch to domain handlers based on message type
        message.ack()
      } catch (err) {
        console.error('[queue] Failed to process message', message.id, err)
        message.retry()
      }
    }
    void env
    void ctx
  },

  async scheduled(event: ScheduledEvent, env: WorkerEnv, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(handleScheduled(event, env, ctx))
  },
}
