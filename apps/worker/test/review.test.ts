import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEV_APPEAL_OPERATOR_ID,
  DEV_APPLICATION_ID,
  DEV_BUSINESS_ID,
  DEV_OPERATOR_ID,
  DEV_TESTER_ID,
} from '@qa-ux/contracts'
import type { Finding, Report } from '@qa-ux/contracts'
import { app } from '../src/index.js'
import { resetMemoryStore } from '../src/store/memory.js'

const OTHER_BUSINESS = '11111111-1111-4111-8111-111111111111'

function request(path: string, init: RequestInit = {}, extra: Record<string, string> = {}) {
  const headers = new Headers(init.headers)
  headers.set('x-business-id', extra['x-business-id'] ?? DEV_BUSINESS_ID)
  for (const [key, value] of Object.entries(extra)) {
    if (key !== 'x-business-id') headers.set(key, value)
  }
  if (init.body) headers.set('content-type', 'application/json')
  return app.request(`http://localhost${path}`, { ...init, headers })
}

async function json<T>(res: Response): Promise<T> {
  return (await res.json()) as T
}

describe('review, retest, and reports', () => {
  beforeEach(() => resetMemoryStore())

  it('reviews a finding, freezes the report, and retests on a replacement build', async () => {
    const application = await request('/api/v1/applications', {
      method: 'POST',
      body: JSON.stringify({ name: 'Invoices', platform: 'web', applicationId: DEV_APPLICATION_ID }),
    })
    const { application: appRecord } = await json<{ application: { id: string } }>(application)
    const first = await request(`/api/v1/applications/${appRecord.id}/builds`, {
      method: 'POST',
      body: JSON.stringify({ version: '1.0.0', platform: 'web' }),
    })
    const second = await request(`/api/v1/applications/${appRecord.id}/builds`, {
      method: 'POST',
      body: JSON.stringify({ version: '1.1.0', platform: 'web' }),
    })
    const { build } = await json<{ build: { id: string } }>(first)
    const { build: replacement } = await json<{ build: { id: string } }>(second)

    const created = await request('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify({
        applicationId: appRecord.id,
        title: 'Invoice payment check',
        module: 'qa_check',
        priority: 'high',
        testerCount: 1,
      }),
    })
    const { order } = await json<{ order: { id: string } }>(created)

    await request(`/api/v1/orders/${order.id}/build`, {
      method: 'POST',
      body: JSON.stringify({ buildId: build.id }),
    })
    await request(`/api/v1/orders/${order.id}/readiness`, {
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

    const steps = [
      { event: 'submit' },
      {
        event: 'issue_quote',
        quote: {
          lineItems: [{ description: 'QA', amountCents: 50000 }],
          deliverables: 'Findings',
          expiresAt: '2026-12-01T00:00:00.000Z',
        },
      },
      { event: 'accept' },
      { event: 'request_payment' },
      { event: 'confirm_payment' },
      { event: 'mark_ready' },
      { event: 'schedule' },
      { event: 'start' },
      { event: 'submit_for_review' },
    ]
    for (const body of steps) {
      const res = await request(`/api/v1/orders/${order.id}/transition`, {
        method: 'POST',
        body: JSON.stringify(body),
      })
      expect(res.status, body.event).toBe(200)
    }

    const early = await request(`/api/v1/orders/${order.id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ event: 'deliver' }),
    })
    expect(early.status).toBe(409)
    expect(await early.json()).toMatchObject({ error: expect.stringMatching(/Publish a report/) })

    await request('/api/v1/testers/me', {
      method: 'PUT',
      headers: { 'x-tester-id': DEV_TESTER_ID },
      body: JSON.stringify({
        deviceModel: 'Pixel 7',
        os: 'Android 14',
        devices: ['Pixel 7'],
        languages: ['en'],
        deviceChecked: true,
        qualification: 'passed',
        isAvailable: true,
      }),
    })
    const offer = await request(`/api/v1/assignments?orderId=${order.id}&platform=web`, {
      method: 'POST',
      body: JSON.stringify({
        testerId: DEV_TESTER_ID,
        timeCommitment: '2 hours',
        compensationCents: 8000,
        deadline: '2026-12-01T00:00:00.000Z',
        evidenceRequired: 'A note',
      }),
    })
    const { assignment } = await json<{ assignment: { id: string } }>(offer)
    await request(`/api/v1/assignments/${assignment.id}/accept`, {
      method: 'POST',
      headers: { 'x-tester-id': DEV_TESTER_ID },
    })

    const filed = await request('/api/v1/findings', {
      method: 'POST',
      headers: { 'x-tester-id': DEV_TESTER_ID },
      body: JSON.stringify({
        orderId: order.id,
        type: 'bug',
        title: 'Checkout stays on the spinner',
        steps: 'Open the invoice and tap Pay',
        expectedBehavior: 'A receipt is shown',
        actualBehavior: 'The pay button never finishes',
        buildId: build.id,
        reproducibility: 'always',
        severity: 'high',
        journey: 'Pay an invoice',
      }),
    })
    expect(filed.status).toBe(201)
    const { finding } = await json<{ finding: Finding }>(filed)

    const hidden = await request(`/api/v1/findings/${finding.id}`, {}, { 'x-business-id': OTHER_BUSINESS })
    expect(hidden.status).toBe(404)

    const reviewed = await request(`/api/v1/findings/${finding.id}/review`, {
      method: 'POST',
      headers: { 'x-operator-id': DEV_OPERATOR_ID },
      body: JSON.stringify({ outcome: 'accepted', reason: 'Reproduced on 1.0.0' }),
    })
    expect(reviewed.status).toBe(200)

    const testerReview = await request(`/api/v1/findings/${finding.id}/review`, {
      method: 'POST',
      headers: { 'x-tester-id': DEV_TESTER_ID },
      body: JSON.stringify({ outcome: 'invalid', reason: 'no' }),
    })
    expect(testerReview.status).toBe(403)

    const priority = await request(`/api/v1/findings/${finding.id}/priority`, {
      method: 'POST',
      body: JSON.stringify({ priority: 'now' }),
    })
    const prioritized = await json<{ finding: Finding }>(priority)
    expect(prioritized.finding.customerPriority).toBe('now')
    expect(prioritized.finding.severity).toBe('high')

    const sameBuild = await request(`/api/v1/findings/${finding.id}/retest`, {
      method: 'POST',
      body: JSON.stringify({ result: 'fixed', buildId: build.id }),
    })
    expect(sameBuild.status).toBe(409)

    const retested = await request(`/api/v1/findings/${finding.id}/retest`, {
      method: 'POST',
      body: JSON.stringify({ result: 'still_reproducible', buildId: replacement.id, notes: 'Spinner remains' }),
    })
    expect(retested.status).toBe(200)
    const afterRetest = await json<{ finding: Finding }>(retested)
    expect(afterRetest.finding.steps).toBe('Open the invoice and tap Pay')
    expect(afterRetest.finding.retests[0]?.buildId).toBe(replacement.id)

    const secret = await request(`/api/v1/findings/${finding.id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body: 'password: hunter2' }),
    })
    expect(secret.status).toBe(400)

    const published = await request('/api/v1/reports', {
      method: 'POST',
      body: JSON.stringify({
        orderId: order.id,
        objective: 'Learn whether checkout finishes',
        authorName: 'Operator',
        reviewerName: 'Reviewer',
      }),
    })
    expect(published.status).toBe(201)
    const { report } = await json<{ report: Report }>(published)
    expect(report.version).toBe(1)
    expect(report.findings[0]?.title).toBe('Checkout stays on the spinner')
    expect(report.findings[0]).not.toHaveProperty('reporterId')

    await request(`/api/v1/findings/${finding.id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body: 'Changed after the report' }),
    })
    const csv = await request(`/api/v1/reports/${report.id}/csv`)
    const csvText = await csv.text()
    expect(csvText).toContain('Checkout stays on the spinner')
    expect(csvText).not.toContain('Changed after the report')
    const html = await request(`/api/v1/reports/${report.id}/html`)
    expect(html.headers.get('content-type')).toContain('text/html')
    expect(await html.text()).toContain('Learn whether checkout finishes')

    const delivered = await request(`/api/v1/orders/${order.id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ event: 'deliver' }),
    })
    expect(delivered.status).toBe(200)

    const appeal = await request(`/api/v1/findings/${finding.id}/appeal`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Please look at the recording' }),
    })
    expect(appeal.status).toBe(200)
    const again = await request(`/api/v1/findings/${finding.id}/appeal`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Once more' }),
    })
    expect(again.status).toBe(409)
    const sameOperator = await request(`/api/v1/findings/${finding.id}/review`, {
      method: 'POST',
      headers: { 'x-operator-id': DEV_OPERATOR_ID },
      body: JSON.stringify({ outcome: 'accepted', reason: 'Same person' }),
    })
    expect(sameOperator.status).toBe(409)
    const appealReview = await request(`/api/v1/findings/${finding.id}/review`, {
      method: 'POST',
      headers: { 'x-operator-id': DEV_APPEAL_OPERATOR_ID },
      body: JSON.stringify({ outcome: 'accepted', reason: 'Recording reproduces it' }),
    })
    expect(appealReview.status).toBe(200)

    const quality = await request(`/api/v1/testers/${DEV_TESTER_ID}/quality`)
    expect(quality.status).toBe(200)
    expect(await quality.json()).toMatchObject({ accepted: 1, acceptedAssignments: 1 })
    const leaked = await request(`/api/v1/testers/${DEV_TESTER_ID}/quality`, {}, { 'x-tester-id': DEV_TESTER_ID })
    expect(leaked.status).toBe(403)

    const severe = await request(`/api/v1/findings?orderId=${order.id}&severity=low`)
    expect((await json<{ data: Finding[] }>(severe)).data).toHaveLength(0)
    const high = await request(`/api/v1/findings?orderId=${order.id}&severity=high&journey=Pay%20an%20invoice`)
    expect((await json<{ data: Finding[] }>(high)).data).toHaveLength(1)
  })
})
