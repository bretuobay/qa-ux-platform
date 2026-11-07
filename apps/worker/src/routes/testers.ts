import { Hono } from 'hono'
import { CreateTesterProfileSchema, PlatformSchema } from '@qa-ux/contracts'
import { isEligible, presentAssignment, qualityRecord } from '@qa-ux/domain'
import type { Platform } from '@qa-ux/contracts'
import type { WorkerEnv } from '../types/worker-env.js'
import { businessMiddleware } from '../middleware/business.js'
import { zodErrors } from './errors.js'
import {
  getProfile,
  listAssignments,
  listAssignmentsForTester,
  listFindings,
  listProfiles,
  saveProfile,
} from '../store/memory.js'

const testers = new Hono<{ Bindings: WorkerEnv }>()
testers.use('*', businessMiddleware)

function testerId(header: string | undefined): string | null {
  if (!header) return null
  return /^[0-9a-f-]{36}$/i.test(header) ? header : null
}

testers.get('/', (c) => {
  const platformResult = PlatformSchema.safeParse(c.req.query('platform') ?? 'web')
  const platform: Platform = platformResult.success ? platformResult.data : 'web'
  const data = listProfiles().map((profile) => ({
    profile,
    eligible: isEligible(profile, platform),
  }))
  return c.json({ data })
})

testers.get('/me', (c) => {
  const userId = testerId(c.req.header('x-tester-id'))
  if (!userId) return c.json({ error: 'X-Tester-Id header is required' }, 400)
  const profile = getProfile(userId)
  if (!profile) return c.json({ error: 'Profile not found' }, 404)
  return c.json({ profile })
})

testers.put('/me', async (c) => {
  const userId = testerId(c.req.header('x-tester-id'))
  if (!userId) return c.json({ error: 'X-Tester-Id header is required' }, 400)
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = CreateTesterProfileSchema.safeParse({ ...(body as object), userId })
  if (!parsed.success) return c.json({ error: 'Invalid profile', errors: zodErrors(parsed.error) }, 400)
  const now = new Date()
  const existing = getProfile(userId)
  const profile = {
    ...parsed.data,
    id: existing?.id ?? crypto.randomUUID(),
    completedOrders: existing?.completedOrders ?? 0,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  saveProfile(profile)
  return c.json({ profile })
})

testers.get('/me/assignments', (c) => {
  const userId = testerId(c.req.header('x-tester-id'))
  if (!userId) return c.json({ error: 'X-Tester-Id header is required' }, 400)
  const data = listAssignmentsForTester(userId).map((assignment) => presentAssignment(assignment, 'tester'))
  return c.json({ data })
})

testers.get('/:userId/quality', (c) => {
  if (c.req.header('x-tester-id')) return c.json({ error: 'Quality records stay with the operator.' }, 403)
  const userId = testerId(c.req.param('userId'))
  if (!userId) return c.json({ error: 'Unknown tester' }, 400)
  const businessId = c.get('businessId')
  return c.json(qualityRecord(userId, listFindings(businessId), listAssignments(businessId)))
})

export { testers }
