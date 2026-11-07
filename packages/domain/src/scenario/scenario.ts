import type {
  Execution,
  ExecutionEvidence,
  ExecutionOutcome,
  Scenario,
  ScenarioStatus,
} from '@qa-ux/contracts'

export interface Coverage {
  passed: number
  failed: number
  blocked: number
  notRun: number
  notApplicable: number
  inScope: number
}

export function coverage(scenarios: Pick<Scenario, 'status'>[]): Coverage {
  const count = (status: ScenarioStatus) => scenarios.filter((scenario) => scenario.status === status).length
  const passed = count('pass')
  const failed = count('fail')
  const blocked = count('blocked')
  const notRun = count('not_run')
  const notApplicable = count('not_applicable')
  return {
    passed,
    failed,
    blocked,
    notRun,
    notApplicable,
    inScope: passed + failed + blocked + notRun,
  }
}

export function saveExecutionDraft(
  execution: Execution,
  patch: { outcome?: ExecutionOutcome; notes?: string }
): { ok: true; execution: Execution } | { ok: false; error: string } {
  if (execution.status === 'submitted') {
    return { ok: false, error: 'A submitted result cannot be edited.' }
  }
  const next: Execution = { ...execution, updatedAt: new Date() }
  if (patch.outcome) next.outcome = patch.outcome
  if (patch.notes !== undefined) {
    if (patch.notes.trim()) next.notes = patch.notes.trim()
    else delete next.notes
  }
  return { ok: true, execution: next }
}

export function addEvidence(
  execution: Execution,
  input: { fileName: string; sizeBytes: number; contentType: string }
): { ok: true; execution: Execution; evidence: ExecutionEvidence } | { ok: false; error: string } {
  if (execution.status === 'submitted') {
    return { ok: false, error: 'A submitted result cannot take new evidence.' }
  }
  if (input.sizeBytes <= 0 || input.sizeBytes > 20_000_000) {
    return { ok: false, error: 'Evidence must be between 1 byte and 20 MB.' }
  }
  const evidence: ExecutionEvidence = {
    id: globalThis.crypto.randomUUID(),
    executionId: execution.id,
    fileName: input.fileName,
    sizeBytes: input.sizeBytes,
    contentType: input.contentType,
    status: 'pending',
    r2Key: `evidence/${execution.id}/${globalThis.crypto.randomUUID()}`,
    createdAt: new Date(),
  }
  return { ok: true, evidence, execution: { ...execution, evidence: [...execution.evidence, evidence], updatedAt: new Date() } }
}

export function markEvidence(
  execution: Execution,
  evidenceId: string,
  status: 'uploaded' | 'failed' | 'pending'
): { ok: true; execution: Execution } | { ok: false; error: string } {
  const target = execution.evidence.find((item) => item.id === evidenceId)
  if (!target) return { ok: false, error: 'Evidence not found.' }
  if (status === 'pending' && target.status !== 'failed') {
    return { ok: false, error: 'Only a failed upload can be retried.' }
  }
  return {
    ok: true,
    execution: {
      ...execution,
      updatedAt: new Date(),
      evidence: execution.evidence.map((item) => (item.id === evidenceId ? { ...item, status } : item)),
    },
  }
}

export function submitExecution(
  execution: Execution
): { ok: true; execution: Execution } | { ok: false; error: string } {
  if (execution.status === 'submitted') return { ok: false, error: 'Already submitted.' }
  if (!execution.outcome) return { ok: false, error: 'Choose an outcome before submitting.' }
  const uploaded = execution.evidence.some((item) => item.status === 'uploaded')
  if (!execution.notes?.trim() && !uploaded) {
    return {
      ok: false,
      error: 'Add a note or uploaded evidence. A pass with no defect still needs a clear outcome.',
    }
  }
  return { ok: true, execution: { ...execution, status: 'submitted', updatedAt: new Date() } }
}

export function scenarioAfterExecution(scenario: Scenario, execution: Execution): Scenario {
  if (execution.status !== 'submitted' || !execution.outcome) return scenario
  return { ...scenario, status: execution.outcome, updatedAt: new Date() }
}
