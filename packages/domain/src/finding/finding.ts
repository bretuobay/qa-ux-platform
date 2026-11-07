import type {
  CoverageSnapshot,
  CustomerPriority,
  Finding,
  FindingComment,
  FindingImpact,
  FindingReview,
  FindingType,
  Report,
  ReportFinding,
  Reproducibility,
  RetestRecord,
  RetestResult,
  ReviewOutcome,
  Severity,
} from '@qa-ux/contracts'

export interface CreateFindingDraft {
  businessId: string
  orderId: string
  reporterId: string
  type: FindingType
  title: string
  steps: string
  expectedBehavior: string
  actualBehavior: string
  buildId: string
  reproducibility: Reproducibility
  scenarioId?: string
  executionId?: string
  environmentId?: string
  journey?: string
  severity?: Severity
  impact?: FindingImpact
}

export type FindingResult = { ok: true; finding: Finding } | { ok: false; error: string }

const SECRET = /password\s*[:=]\s*\S+/i

function required(value: string, label: string): string | null {
  return value.trim() ? null : `${label} is required.`
}

export function createFinding(draft: CreateFindingDraft): FindingResult {
  if (draft.type === 'bug' && !draft.severity) {
    return { ok: false, error: 'A bug needs a severity. Priority is the customer’s decision and is separate.' }
  }
  if (draft.type === 'usability' && !draft.impact) {
    return { ok: false, error: 'A usability finding needs an impact. It is not a technical severity.' }
  }
  if (draft.type === 'bug' && draft.impact) {
    return { ok: false, error: 'Severity describes a bug. Impact is for a usability finding.' }
  }
  if (draft.type === 'usability' && draft.severity) {
    return { ok: false, error: 'A usability finding uses impact, not technical severity.' }
  }
  if ((draft.type === 'suggestion' || draft.type === 'assumption') && (draft.severity || draft.impact)) {
    return { ok: false, error: 'Suggestions and assumptions are not scored as defects.' }
  }
  const missing =
    required(draft.title, 'A title') ??
    required(draft.steps, 'Steps') ??
    required(draft.expectedBehavior, 'Expected behaviour') ??
    required(draft.actualBehavior, 'Actual behaviour')
  if (missing) return { ok: false, error: missing }

  const now = new Date()
  const finding: Finding = {
    id: globalThis.crypto.randomUUID(),
    businessId: draft.businessId,
    orderId: draft.orderId,
    reporterId: draft.reporterId,
    type: draft.type,
    title: draft.title.trim(),
    steps: draft.steps.trim(),
    expectedBehavior: draft.expectedBehavior.trim(),
    actualBehavior: draft.actualBehavior.trim(),
    buildId: draft.buildId,
    reproducibility: draft.reproducibility,
    customerPriority: 'unset',
    reviews: [],
    retests: [],
    comments: [],
    createdAt: now,
    updatedAt: now,
  }
  if (draft.scenarioId) finding.scenarioId = draft.scenarioId
  if (draft.executionId) finding.executionId = draft.executionId
  if (draft.environmentId) finding.environmentId = draft.environmentId
  if (draft.journey?.trim()) finding.journey = draft.journey.trim()
  if (draft.severity) finding.severity = draft.severity
  if (draft.impact) finding.impact = draft.impact
  return { ok: true, finding }
}

export function reviewFinding(
  finding: Finding,
  input: { outcome: ReviewOutcome; reason: string; reviewerId: string }
): { ok: true; finding: Finding; review: FindingReview } | { ok: false; error: string } {
  const reason = input.reason.trim()
  if (!reason) return { ok: false, error: 'A review needs a reason.' }
  const appealOpen = Boolean(finding.appeal) && finding.reviews.length === 1
  if (finding.reviews.length === 0 || appealOpen) {
    const first = finding.reviews[0]
    if (appealOpen && first && first.reviewerId === input.reviewerId) {
      return { ok: false, error: 'The appeal is reviewed by a different operator.' }
    }
  } else if (finding.appeal) {
    return { ok: false, error: 'The appeal has already been reviewed.' }
  } else {
    return { ok: false, error: 'This finding already has a review. An appeal opens one more review.' }
  }

  const review: FindingReview = {
    id: globalThis.crypto.randomUUID(),
    findingId: finding.id,
    outcome: input.outcome,
    reason,
    reviewerId: input.reviewerId,
    createdAt: new Date(),
  }
  return {
    ok: true,
    review,
    finding: { ...finding, reviews: [...finding.reviews, review], updatedAt: review.createdAt },
  }
}

export function appealFinding(finding: Finding, reason: string): FindingResult {
  const trimmed = reason.trim()
  if (!trimmed) return { ok: false, error: 'An appeal needs a reason.' }
  if (finding.reviews.length === 0) {
    return { ok: false, error: 'Appeal waits until a reviewer has recorded an outcome.' }
  }
  if (finding.appeal) return { ok: false, error: 'A finding can be appealed once.' }
  const createdAt = new Date()
  return {
    ok: true,
    finding: { ...finding, appeal: { reason: trimmed, createdAt }, updatedAt: createdAt },
  }
}

export function setCustomerPriority(finding: Finding, priority: CustomerPriority): Finding {
  return { ...finding, customerPriority: priority, updatedAt: new Date() }
}

export function recordRetest(
  finding: Finding,
  input: { result: RetestResult; buildId: string; notes?: string }
): FindingResult {
  const latest = finding.reviews[finding.reviews.length - 1]
  if (!latest || latest.outcome !== 'accepted') {
    return { ok: false, error: 'Only an accepted finding can be retested.' }
  }
  if (input.buildId === finding.buildId) {
    return {
      ok: false,
      error: 'A retest uses the replacement build, not the build where the issue was found.',
    }
  }
  const retest: RetestRecord = {
    id: globalThis.crypto.randomUUID(),
    findingId: finding.id,
    buildId: input.buildId,
    result: input.result,
    createdAt: new Date(),
  }
  if (input.notes?.trim()) retest.notes = input.notes.trim()
  return {
    ok: true,
    finding: {
      ...finding,
      retests: [...finding.retests, retest],
      updatedAt: retest.createdAt,
    },
  }
}

export function addComment(
  finding: Finding,
  input: { body: string; authorId: string; authorRole: FindingComment['authorRole'] }
): FindingResult {
  const body = input.body.trim()
  if (!body) return { ok: false, error: 'A comment needs text.' }
  if (SECRET.test(body)) return { ok: false, error: 'Keep access secrets out of comments.' }
  const comment: FindingComment = {
    id: globalThis.crypto.randomUUID(),
    findingId: finding.id,
    authorId: input.authorId,
    authorRole: input.authorRole,
    body,
    createdAt: new Date(),
  }
  return {
    ok: true,
    finding: { ...finding, comments: [...finding.comments, comment], updatedAt: comment.createdAt },
  }
}

export interface FindingFilter {
  type?: FindingType
  severity?: Severity
  impact?: FindingImpact
  buildId?: string
  environmentId?: string
  journey?: string
  outcome?: ReviewOutcome | 'unreviewed'
}

export function filterFindings(findings: Finding[], filter: FindingFilter): Finding[] {
  return findings.filter((finding) => {
    if (filter.type && finding.type !== filter.type) return false
    if (filter.severity && finding.severity !== filter.severity) return false
    if (filter.impact && finding.impact !== filter.impact) return false
    if (filter.buildId && finding.buildId !== filter.buildId) return false
    if (filter.environmentId && finding.environmentId !== filter.environmentId) return false
    if (filter.journey && finding.journey !== filter.journey) return false
    if (filter.outcome === 'unreviewed') return isOpenFinding(finding)
    if (filter.outcome) {
      const latest = finding.reviews[finding.reviews.length - 1]
      if (!latest || latest.outcome !== filter.outcome) return false
    }
    return true
  })
}

export function isOpenFinding(finding: Finding): boolean {
  return finding.reviews.length === 0 || Boolean(finding.appeal && finding.reviews.length === 1)
}

export function toReportFinding(finding: Finding): ReportFinding {
  const latest = finding.reviews[finding.reviews.length - 1]
  const retest = finding.retests[finding.retests.length - 1]
  const snapshot: ReportFinding = {
    id: finding.id,
    type: finding.type,
    title: finding.title,
    steps: finding.steps,
    expectedBehavior: finding.expectedBehavior,
    actualBehavior: finding.actualBehavior,
    buildId: finding.buildId,
    reproducibility: finding.reproducibility,
    customerPriority: finding.customerPriority,
  }
  if (finding.environmentId) snapshot.environmentId = finding.environmentId
  if (finding.journey) snapshot.journey = finding.journey
  if (finding.severity) snapshot.severity = finding.severity
  if (finding.impact) snapshot.impact = finding.impact
  if (latest) {
    snapshot.reviewOutcome = latest.outcome
    snapshot.reviewReason = latest.reason
  }
  if (retest) {
    snapshot.retestResult = retest.result
    snapshot.retestBuildId = retest.buildId
  }
  return snapshot
}

export function publishReport(draft: {
  businessId: string
  orderId: string
  version: number
  title: string
  objective: string
  authorName: string
  reviewerName: string
  coverage: CoverageSnapshot
  findings: Finding[]
}): { ok: true; report: Report } | { ok: false; error: string } {
  if (draft.version < 1) return { ok: false, error: 'Report versions start at 1.' }
  if (!draft.title.trim() || !draft.objective.trim() || !draft.authorName.trim() || !draft.reviewerName.trim()) {
    return { ok: false, error: 'A report needs a title, objective, author, and reviewer.' }
  }
  return {
    ok: true,
    report: {
      id: globalThis.crypto.randomUUID(),
      businessId: draft.businessId,
      orderId: draft.orderId,
      version: draft.version,
      title: draft.title.trim(),
      objective: draft.objective.trim(),
      authorName: draft.authorName.trim(),
      reviewerName: draft.reviewerName.trim(),
      coverage: { ...draft.coverage },
      findings: draft.findings.map(toReportFinding),
      publishedAt: new Date(),
    },
  }
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`
  return value
}

export function reportCsv(report: Report): string {
  const header = ['id', 'type', 'title', 'severity', 'impact', 'priority', 'review', 'retest', 'build', 'journey']
  const rows = report.findings.map((finding) =>
    [
      finding.id,
      finding.type,
      finding.title,
      finding.severity ?? '',
      finding.impact ?? '',
      finding.customerPriority,
      finding.reviewOutcome ?? '',
      finding.retestResult ?? '',
      finding.buildId,
      finding.journey ?? '',
    ]
      .map(csvCell)
      .join(',')
  )
  return [header.join(','), ...rows].join('\n')
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function reportHtml(report: Report): string {
  const findings = report.findings
    .map(
      (finding) => `<article>
      <h3>${escapeHtml(finding.title)}</h3>
      <p>${escapeHtml(finding.type)} · ${escapeHtml(finding.severity ?? finding.impact ?? 'unscored')} · priority ${escapeHtml(finding.customerPriority)}</p>
      <p>Expected: ${escapeHtml(finding.expectedBehavior)}</p>
      <p>Actual: ${escapeHtml(finding.actualBehavior)}</p>
      <p>Steps: ${escapeHtml(finding.steps)}</p>
      <p>Review: ${escapeHtml(finding.reviewOutcome ?? 'unreviewed')}${finding.reviewReason ? ` · ${escapeHtml(finding.reviewReason)}` : ''}</p>
      <p>Retest: ${escapeHtml(finding.retestResult ?? 'not retested')}</p>
    </article>`
    )
    .join('')
  const { coverage } = report
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${escapeHtml(report.title)}</title>
<style>body{font-family:Georgia,serif;max-width:720px;margin:2rem auto;color:#111} article{border-top:1px solid #ccc;padding:1rem 0}</style>
</head>
<body>
<h1>${escapeHtml(report.title)}</h1>
<p>Version ${report.version} · ${escapeHtml(report.publishedAt.toISOString())}</p>
<p>Author ${escapeHtml(report.authorName)} · Reviewer ${escapeHtml(report.reviewerName)}</p>
<h2>Objective</h2>
<p>${escapeHtml(report.objective)}</p>
<h2>Coverage</h2>
<p>${coverage.passed} passed, ${coverage.failed} failed, ${coverage.blocked} blocked, ${coverage.notRun} not run, of ${coverage.inScope} in scope.</p>
<h2>Findings</h2>
${findings || '<p>No findings in this version.</p>'}
</body></html>`
}

export interface QualityRecord {
  accepted: number
  clarification: number
  duplicate: number
  invalid: number
  outOfScope: number
  appeals: number
  appealAgreements: number
  noShows: number
  acceptedAssignments: number
}

export function qualityRecord(
  testerId: string,
  findings: Finding[],
  assignments: { testerId: string; status: string }[]
): QualityRecord {
  const mine = findings.filter((finding) => finding.reporterId === testerId)
  const count = (outcome: ReviewOutcome) =>
    mine.filter((finding) => finding.reviews.some((review) => review.outcome === outcome)).length
  const appealed = mine.filter((finding) => finding.appeal && finding.reviews.length >= 2)
  const testerAssignments = assignments.filter((assignment) => assignment.testerId === testerId)
  return {
    accepted: count('accepted'),
    clarification: count('clarification'),
    duplicate: count('duplicate'),
    invalid: count('invalid'),
    outOfScope: count('out_of_scope'),
    appeals: mine.filter((finding) => finding.appeal).length,
    appealAgreements: appealed.filter((finding) => finding.reviews[0]?.outcome === finding.reviews[1]?.outcome)
      .length,
    noShows: testerAssignments.filter((assignment) => assignment.status === 'withdrawn').length,
    acceptedAssignments: testerAssignments.filter((assignment) => assignment.status === 'accepted').length,
  }
}
