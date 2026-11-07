import { describe, expect, it } from 'vitest'
import * as fc from 'fast-check'
import {
  CUSTOMER_PRIORITIES,
  CustomerPrioritySchema,
  DEV_APPEAL_OPERATOR_ID,
  DEV_BUSINESS_ID,
  DEV_OPERATOR_ID,
  DEV_TESTER_ID,
  SEVERITIES,
  SeveritySchema,
} from '@qa-ux/contracts'
import type { CreateFindingDraft } from '../finding.js'
import {
  appealFinding,
  createFinding,
  filterFindings,
  publishReport,
  recordRetest,
  reportCsv,
  reportHtml,
  reviewFinding,
  setCustomerPriority,
} from '../finding.js'

const BUILD_A = 'f1e2d3c4-b5a6-4789-8abc-def012345678'
const BUILD_B = 'a9b8c7d6-e5f4-4321-8abc-def012345678'

function draft(overrides: Partial<CreateFindingDraft> = {}): CreateFindingDraft {
  return {
    businessId: DEV_BUSINESS_ID,
    orderId: 'b2c3d4e5-f6a7-4890-9bcd-ef0123456789',
    reporterId: DEV_TESTER_ID,
    type: 'bug',
    title: 'Checkout stays on the spinner',
    steps: 'Open the invoice and tap Pay',
    expectedBehavior: 'A receipt is shown',
    actualBehavior: 'The pay button never finishes',
    buildId: BUILD_A,
    reproducibility: 'always',
    severity: 'high',
    journey: 'Pay an invoice',
    ...overrides,
  }
}

function filed(overrides: Partial<CreateFindingDraft> = {}) {
  const created = createFinding(draft(overrides))
  if (!created.ok) throw new Error(created.error)
  return created.finding
}

const emptyCoverage = {
  passed: 0,
  failed: 1,
  blocked: 0,
  notRun: 0,
  notApplicable: 0,
  inScope: 1,
}

describe('findings', () => {
  it('keeps severity when the customer sets a priority', () => {
    const finding = setCustomerPriority(filed(), 'now')
    expect(finding.severity).toBe('high')
    expect(finding.customerPriority).toBe('now')
  })

  it('asks for severity on a bug and impact on a usability finding', () => {
    const bugDraft = draft()
    delete bugDraft.severity
    const bug = createFinding(bugDraft)
    expect(bug.ok).toBe(false)
    const usabilityDraft = draft({ type: 'usability', impact: 'high' })
    delete usabilityDraft.severity
    const usability = createFinding(usabilityDraft)
    expect(usability.ok).toBe(true)
    if (!usability.ok) return
    expect(usability.finding.severity).toBeUndefined()
    expect(usability.finding.impact).toBe('high')
  })

  it('allows one appeal and a second operator', () => {
    const reviewed = reviewFinding(filed(), {
      outcome: 'invalid',
      reason: 'Could not reproduce on build 1.2.0',
      reviewerId: DEV_OPERATOR_ID,
    })
    expect(reviewed.ok).toBe(true)
    if (!reviewed.ok) return
    const appealed = appealFinding(reviewed.finding, 'The recording shows the spinner')
    expect(appealed.ok).toBe(true)
    if (!appealed.ok) return
    expect(appealFinding(appealed.finding, 'Please look again').ok).toBe(false)
    const sameReviewer = reviewFinding(appealed.finding, {
      outcome: 'accepted',
      reason: 'Looking again',
      reviewerId: DEV_OPERATOR_ID,
    })
    expect(sameReviewer.ok).toBe(false)
    const second = reviewFinding(appealed.finding, {
      outcome: 'accepted',
      reason: 'The recording reproduces it',
      reviewerId: DEV_APPEAL_OPERATOR_ID,
    })
    expect(second.ok).toBe(true)
    if (!second.ok) return
    expect(second.finding.reviews).toHaveLength(2)
    expect(second.finding.reviews[0]?.outcome).toBe('invalid')
  })

  it('keeps the original steps when a replacement build is retested', () => {
    const reviewed = reviewFinding(filed(), {
      outcome: 'accepted',
      reason: 'Reproduced',
      reviewerId: DEV_OPERATOR_ID,
    })
    if (!reviewed.ok) throw new Error(reviewed.error)
    expect(recordRetest(reviewed.finding, { result: 'fixed', buildId: BUILD_A }).ok).toBe(false)
    const retested = recordRetest(reviewed.finding, {
      result: 'still_reproducible',
      buildId: BUILD_B,
      notes: 'Spinner remains',
    })
    expect(retested.ok).toBe(true)
    if (!retested.ok) return
    expect(retested.finding.steps).toBe('Open the invoice and tap Pay')
    expect(retested.finding.retests[0]?.result).toBe('still_reproducible')
    expect(retested.finding.retests[0]?.buildId).toBe(BUILD_B)
  })

  it('freezes finding text inside the published report', () => {
    const finding = filed()
    const published = publishReport({
      businessId: DEV_BUSINESS_ID,
      orderId: finding.orderId,
      version: 1,
      title: 'Invoice payment check',
      objective: 'Learn whether checkout finishes',
      authorName: 'Operator',
      reviewerName: 'Reviewer',
      coverage: emptyCoverage,
      findings: [finding],
    })
    expect(published.ok).toBe(true)
    if (!published.ok) return
    finding.title = 'Changed after delivery'
    expect(published.report.findings[0]?.title).toBe('Checkout stays on the spinner')
    expect('reporterId' in (published.report.findings[0] ?? {})).toBe(false)
    expect(reportHtml(published.report)).toContain('Checkout stays on the spinner')
    expect(reportHtml({ ...published.report, findings: [{ ...published.report.findings[0]!, title: '<script>' }] })).toContain(
      '&lt;script&gt;'
    )
    expect(reportCsv({ ...published.report, findings: [{ ...published.report.findings[0]!, title: 'Pay, then wait' }] })).toContain(
      '"Pay, then wait"'
    )
  })
})

describe('finding properties', () => {
  it('customer priority never rewrites severity', () => {
    fc.assert(
      fc.property(fc.constantFrom(...SEVERITIES), fc.constantFrom(...CUSTOMER_PRIORITIES), (severity, priority) => {
        const finding = filed({ severity })
        const next = setCustomerPriority(finding, priority)
        return next.severity === severity && next.customerPriority === priority
      })
    )
  })

  it('a severity filter returns only that severity', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SeveritySchema.options),
        fc.array(fc.constantFrom(...SeveritySchema.options), { minLength: 1, maxLength: 6 }),
        (wanted, severities) => {
          const findings = severities.map((severity) => filed({ severity }))
          return filterFindings(findings, { severity: wanted }).every((finding) => finding.severity === wanted)
        }
      )
    )
  })

  it('every customer priority is stored on its own', () => {
    fc.assert(
      fc.property(fc.constantFrom(...CustomerPrioritySchema.options), (priority) => {
        return setCustomerPriority(filed(), priority).customerPriority === priority
      })
    )
  })
})
