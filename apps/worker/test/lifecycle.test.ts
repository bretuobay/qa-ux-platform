import { beforeEach, describe, expect, it } from 'vitest'
import { DEV_APPLICATION_ID, DEV_BUSINESS_ID } from '@qa-ux/contracts'
import { app } from '../src/index.js'
import { resetMemoryStore } from '../src/store/memory.js'

const OTHER_BUSINESS = 'c3d4e5f6-a7b8-4901-8cde-f01234567890'

function request(path: string, init: RequestInit = {}, businessId = DEV_BUSINESS_ID) {
  const headers = new Headers(init.headers)
  headers.set('x-business-id', businessId)
  if (init.body) headers.set('content-type', 'application/json')
  return app.request(`http://localhost${path}`, { ...init, headers })
}

const briefBody = {
  applicationId: DEV_APPLICATION_ID,
  module: 'qa_check',
  audience: 'People paying an invoice on a phone',
  goals: 'See whether the invoice can be paid',
  platform: 'web',
  journeys: ['Pay an invoice'],
  title: 'Invoice payment check',
  testerCount: 3,
}

describe('order lifecycle API', () => {
  beforeEach(() => resetMemoryStore())

  it('rejects a missing tenant header', async () => {
    const res = await app.request('http://localhost/api/v1/orders')
    expect(res.status).toBe(400)
  })

  it('rejects a QA brief with no journeys', async () => {
    const res = await request('/api/v1/briefs', {
      method: 'POST',
      body: JSON.stringify({ ...briefBody, journeys: [] }),
    })
    expect(res.status).toBe(400)
    const json = (await res.json()) as { errors: string[] }
    expect(json.errors.some((error) => error.startsWith('journeys:'))).toBe(true)
  })

  it('hides another tenant’s order and walks quote acceptance', async () => {
    const created = await request('/api/v1/briefs', {
      method: 'POST',
      body: JSON.stringify(briefBody),
    })
    expect(created.status).toBe(201)
    const { order } = (await created.json()) as { order: { id: string; status: string } }
    expect(order.status).toBe('draft')

    const hidden = await request(`/api/v1/orders/${order.id}`, {}, OTHER_BUSINESS)
    expect(hidden.status).toBe(404)
    const otherList = await request('/api/v1/orders', {}, OTHER_BUSINESS)
    const otherJson = (await otherList.json()) as { data: unknown[] }
    expect(otherJson.data).toHaveLength(0)

    const submitted = await request(`/api/v1/orders/${order.id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ event: 'submit' }),
    })
    expect(submitted.status).toBe(200)

    const quoted = await request(`/api/v1/orders/${order.id}/transition`, {
      method: 'POST',
      body: JSON.stringify({
        event: 'issue_quote',
        quote: {
          lineItems: [{ description: 'QA check', amountCents: 50000 }],
          deliverables: 'Reviewed findings for the invoice journey',
          expiresAt: '2026-12-01T00:00:00.000Z',
        },
      }),
    })
    expect(quoted.status).toBe(200)
    const quotedJson = (await quoted.json()) as {
      order: { status: string; quoteId?: string; paymentStatus: string }
    }
    expect(quotedJson.order.status).toBe('quoted')
    expect(quotedJson.order.quoteId).toBeTruthy()
    expect(quotedJson.order.paymentStatus).toBe('unpaid')

    const accepted = await request(`/api/v1/orders/${order.id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ event: 'accept' }),
    })
    expect(accepted.status).toBe(200)

    const skipped = await request(`/api/v1/orders/${order.id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ event: 'start' }),
    })
    expect(skipped.status).toBe(409)

    await request(`/api/v1/orders/${order.id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ event: 'request_payment' }),
    })
    const paid = await request(`/api/v1/orders/${order.id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ event: 'confirm_payment' }),
    })
    const paidJson = (await paid.json()) as { order: { status: string; paymentStatus: string } }
    expect(paidJson.order.status).toBe('readiness_check')
    expect(paidJson.order.paymentStatus).toBe('paid')

    const again = await request(`/api/v1/orders/${order.id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ event: 'confirm_payment' }),
    })
    expect(again.status).toBe(409)
  })
})
