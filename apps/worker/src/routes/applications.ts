import { Hono } from 'hono'
import {
  CreateProductApplicationSchema,
  CreateProductBuildSchema,
  CreateTestEnvironmentSchema,
} from '@qa-ux/contracts'
import type { WorkerEnv } from '../types/worker-env.js'
import { businessMiddleware } from '../middleware/business.js'
import { zodErrors } from './errors.js'
import {
  getApplication,
  listApplications,
  listBuilds,
  listEnvironments,
  saveApplication,
  saveBuild,
  saveEnvironment,
} from '../store/memory.js'

const applications = new Hono<{ Bindings: WorkerEnv }>()
applications.use('*', businessMiddleware)

applications.get('/', (c) => c.json({ data: listApplications(c.get('businessId')) }))

applications.post('/', async (c) => {
  const businessId = c.get('businessId')
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = CreateProductApplicationSchema.safeParse({ ...(body as object), businessId })
  if (!parsed.success) return c.json({ error: 'Invalid application', errors: zodErrors(parsed.error) }, 400)
  const now = new Date()
  const application = { ...parsed.data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
  saveApplication(application)
  return c.json({ application }, 201)
})

applications.post('/:id/environments', async (c) => {
  const businessId = c.get('businessId')
  const application = getApplication(businessId, c.req.param('id'))
  if (!application) return c.json({ error: 'Application not found' }, 404)
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = CreateTestEnvironmentSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid environment', errors: zodErrors(parsed.error) }, 400)
  const environment = {
    ...parsed.data,
    id: crypto.randomUUID(),
    businessId,
    applicationId: application.id,
    createdAt: new Date(),
  }
  saveEnvironment(environment)
  return c.json({ environment }, 201)
})

applications.get('/:id/environments', (c) => {
  const businessId = c.get('businessId')
  if (!getApplication(businessId, c.req.param('id'))) return c.json({ error: 'Application not found' }, 404)
  return c.json({ data: listEnvironments(businessId, c.req.param('id')) })
})

applications.post('/:id/builds', async (c) => {
  const businessId = c.get('businessId')
  const application = getApplication(businessId, c.req.param('id'))
  if (!application) return c.json({ error: 'Application not found' }, 404)
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = CreateProductBuildSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid build', errors: zodErrors(parsed.error) }, 400)
  const build = {
    ...parsed.data,
    id: crypto.randomUUID(),
    businessId,
    applicationId: application.id,
    createdAt: new Date(),
  }
  saveBuild(build)
  return c.json({ build }, 201)
})

applications.get('/:id/builds', (c) => {
  const businessId = c.get('businessId')
  if (!getApplication(businessId, c.req.param('id'))) return c.json({ error: 'Application not found' }, 404)
  return c.json({ data: listBuilds(businessId, c.req.param('id')) })
})

export { applications }
