export interface WorkerEnv {
  // Cloudflare Queues
  QA_QUEUE: Queue

  // Cloudflare Hyperdrive (Neon in production)
  HYPERDRIVE: Hyperdrive

  // Cloudflare R2
  EVIDENCE_BUCKET: R2Bucket

  // Environment variables
  ENVIRONMENT: string
  HUBTEL_API_KEY?: string
  JWT_SECRET?: string
  COOKIE_SECRET?: string
}
