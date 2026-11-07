import { beforeEach, describe, expect, it } from 'vitest'
import { DEV_APPLICATION_ID, DEV_BUSINESS_ID, DEV_TESTER_ID } from '@qa-ux/contracts'
import { app } from '../src/index.js'
import { resetMemoryStore } from '../src/store/memory.js'

function request(path: string, init: RequestInit = {}, extra: Record<string, string> = {}) {
  const headers = new Headers(init.headers)
  headers.set('x-business-id', DEV_BUSINESS_ID)
  for (const [key, value] of Object.entries(extra)) headers.set(key, value)
  if (init.body) headers.set('content-type', 'application/json')
  return app.request(`http://localhost${path}`, { ...init, headers })
}

describe('readiness, assignment, and execution', () => {
  beforeEach(() => resetMemoryStore())

  it('hides access until acceptance, blocks readiness, and keeps a dropout unfinished', async () => {
    const application = await request('/api/v1/applications', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Invoices',
        platform: 'web',
        applicationId: DEV_APPLICATION_ID,
      }),
    })
    expect(application.status).toBe(201)
    const { application: appRecord } = (await application.json()) as { application: { id: string } }

    const buildRes = await request(`/api/v1/applications/${appRecord.id}/builds`, {
      method: 'POST',
      body: JSON.stringify({ version: '1.0.0', platform: 'web' }),
    })
    expect(buildRes.status).toBe(201)
    const { build } = (await buildRes.json()) as { build: { id: string; version: string } }
    expect(build.version).toBe('1.0.0')

    const brief = await request('/api/v1/briefs', {
      method: 'POST',
      body: JSON.stringify({
        applicationId: appRecord.id,
        module: 'qa_check',
        audience: 'People paying an invoice',
        goals: 'See whether payment finishes',
        platform: 'web',
        journeys: ['Pay an invoice'],
        title: 'Invoice check',
        testerCount: 1,
      }),
    })
    const { order } = (await brief.json()) as { order: { id: string } }
    for (const body of [
      { event: 'submit' },
      {
        event: 'issue_quote',
        quote: {
          lineItems: [{ description: 'QA check', amountCents: 50000 }],
          deliverables: 'Reviewed findings',
          expiresAt: '2026-12-01T00:00:00.000Z',
        },
      },
      { event: 'accept' },
      { event: 'request_payment' },
      { event: 'confirm_payment' },
    ]) {
      const step = await request(`/api/v1/orders/${order.id}/transition`, {
        method: 'POST',
        body: JSON.stringify(body),
      })
      expect(step.status).toBe(200)
    }

    const profile = await request(
      '/api/v1/testers/me',
      {
        method: 'PUT',
        body: JSON.stringify({
          devices: ['Chrome'],
          languages: ['en'],
          isAvailable: true,
          deviceChecked: true,
          qualification: 'passed',
        }),
      },
      { 'x-tester-id': DEV_TESTER_ID }
    )
    expect(profile.status).toBe(200)

    const offered = await request(`/api/v1/assignments?orderId=${order.id}&platform=web`, {
      method: 'POST',
      body: JSON.stringify({
        testerId: DEV_TESTER_ID,
        timeCommitment: '2 hours',
        compensationCents: 8000,
        deadline: '2026-12-01T00:00:00.000Z',
        evidenceRequired: 'A screenshot',
        accessSecret: 'staging-password',
        accessUsername: 'qa-user',
      }),
    })
    expect(offered.status).toBe(201)
    const { assignment } = (await offered.json()) as { assignment: { id: string; access?: { secret?: string } } }

    const hidden = await request('/api/v1/testers/me/assignments', {}, { 'x-tester-id': DEV_TESTER_ID })
    const hiddenJson = (await hidden.json()) as { data: { access?: unknown }[] }
    expect(hiddenJson.data[0]?.access).toBeUndefined()

    const accepted = await request(
      `/api/v1/assignments/${assignment.id}/accept`,
      { method: 'POST' },
      { 'x-tester-id': DEV_TESTER_ID }
    )
    const acceptedJson = (await accepted.json()) as { assignment: { access?: { secret?: string } } }
    expect(acceptedJson.assignment.access?.secret).toBe('staging-password')

    const blocked = await request(`/api/v1/orders/${order.id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ event: 'mark_ready' }),
    })
    expect(blocked.status).toBe(409)
    const blockedJson = (await blocked.json()) as { error: string }
    expect(blockedJson.error).toMatch(/Readiness blockers/)

    await request(`/api/v1/orders/${order.id}/build`, {
      method: 'POST',
      body: JSON.stringify({ buildId: build.id }),
    })
    const ready = await request(`/api/v1/orders/${order.id}/readiness`, {
      method: 'PUT',
      body: JSON.stringify({
        checks: {
          build_named: true,
          environment_reachable: true,
          test_accounts: true,
          synthetic_data: true,
          permission_to_test: true,
          contact: true,
        },
      }),
    })
    expect(ready.status).toBe(200)
    const cleared = await request(`/api/v1/orders/${order.id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ event: 'mark_ready' }),
    })
    expect(cleared.status).toBe(200)

    const replaced = await request(`/api/v1/assignments/${assignment.id}/replace`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'did not attend' }),
    })
    const replacedJson = (await replaced.json()) as { assignment: { status: string }; slot: { status: string } }
    expect(replacedJson.assignment.status).toBe('replaced')
    expect(replacedJson.slot.status).toBe('open')

    await request(`/api/v1/scenarios?orderId=${order.id}`, {
      method: 'POST',
      body: JSON.stringify({
        journey: 'Pay an invoice',
        steps: 'Open the invoice and pay it',
        expectedOutcome: 'A receipt is shown',
      }),
    })
    const scenarios = await request(`/api/v1/scenarios?orderId=${order.id}`)
    const scenarioJson = (await scenarios.json()) as { data: { status: string }[] }
    expect(scenarioJson.data.every((scenario) => scenario.status !== 'pass')).toBe(true)
  })
})
