import type { WorkerEnv } from '../types/worker-env.js'

export async function handleScheduled(
  event: ScheduledEvent,
  env: WorkerEnv,
  _ctx: ExecutionContext
): Promise<void> {
  console.log(`[cron] Triggered at ${new Date(event.scheduledTime).toISOString()} cron=${event.cron}`)

  // TODO: implement cron jobs
  // e.g. expire stale orders, send reminder notifications, generate daily reports
  void env
}
