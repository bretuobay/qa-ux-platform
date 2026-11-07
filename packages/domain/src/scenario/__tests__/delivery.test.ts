import { describe, expect, it } from 'vitest'
import * as fc from 'fast-check'
import { attachBuild, readinessBlockers } from '../../readiness/readiness.js'
import {
  acceptAssignment,
  isEligible,
  presentAssignment,
  replaceAssignment,
} from '../../assignment/assignment.js'
import { coverage, submitExecution } from '../scenario.js'
import { createOrder } from '../../order/createOrder.js'
import type { Assignment, Execution, ScenarioStatus, TesterProfile } from '@qa-ux/contracts'
import { READINESS_CHECKS, ScenarioStatusSchema } from '@qa-ux/contracts'

const order = createOrder({
  businessId: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
  applicationId: 'b2c3d4e5-f6a7-4890-9bcd-ef0123456789',
  title: 'Checkout',
  module: 'qa_check',
  priority: 'high',
  testerCount: 2,
})

function profile(overrides: Partial<TesterProfile> = {}): TesterProfile {
  return {
    id: 'd4e5f6a7-b8c9-4012-8def-1234567890ab',
    userId: 'c1d2e3f4-a5b6-4789-8abc-def012345678',
    skills: [],
    devices: ['Pixel 7'],
    languages: ['en'],
    currency: 'USD',
    isAvailable: true,
    deviceChecked: true,
    qualification: 'passed',
    os: 'Android 14',
    completedOrders: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function assignment(status: Assignment['status'] = 'offered'): Assignment {
  return {
    id: 'e5f6a7b8-c9d0-4123-8efa-234567890abc',
    businessId: order.businessId,
    orderId: order.id,
    testerId: 'c1d2e3f4-a5b6-4789-8abc-def012345678',
    status,
    timeCommitment: '2 hours',
    compensationCents: 8000,
    currency: 'USD',
    deadline: new Date('2026-12-01T00:00:00.000Z'),
    consentRequired: true,
    evidenceRequired: 'Screenshot of the paid invoice',
    accessSecret: 'staging-password',
    accessUsername: 'qa-user',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

function execution(overrides: Partial<Execution> = {}): Execution {
  return {
    id: 'f6a7b8c9-d0e1-4234-8fab-34567890abcd',
    businessId: order.businessId,
    orderId: order.id,
    scenarioId: 'a7b8c9d0-e1f2-4345-8abc-4567890abcde',
    assignmentId: assignment().id,
    testerId: assignment().testerId,
    status: 'draft',
    evidence: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('readiness and builds', () => {
  it('keeps every unchecked item and a missing build as blockers', () => {
    const blockers = readinessBlockers([], order)
    expect(blockers).toEqual([...READINESS_CHECKS])
  })

  it('still blocks when the build check is ticked but no build is attached', () => {
    const items = READINESS_CHECKS.map((check) => ({ check, passed: true }))
    expect(readinessBlockers(items, order)).toEqual(['build_named'])
  })

  it('clears blockers once every check passes and a build is attached', () => {
    const items = READINESS_CHECKS.map((check) => ({ check, passed: true }))
    const attached = attachBuild(order, 'b8c9d0e1-f2a3-4456-8bcd-567890abcdef', false)
    expect(attached.ok).toBe(true)
    if (!attached.ok) return
    expect(readinessBlockers(items, attached.order)).toEqual([])
  })

  it('refuses to point an order at a new build after submitted work', () => {
    const result = attachBuild(order, 'b8c9d0e1-f2a3-4456-8bcd-567890abcdef', true)
    expect(result.ok).toBe(false)
  })
})

describe('assignments', () => {
  it('hides access until the tester accepts, and never shows it to the customer', () => {
    const offered = presentAssignment(assignment(), 'tester')
    expect(offered.access).toBeUndefined()
    expect(JSON.stringify(offered)).not.toContain('staging-password')

    const accepted = acceptAssignment(assignment())
    expect(accepted.ok).toBe(true)
    if (!accepted.ok) return
    expect(presentAssignment(accepted.assignment, 'tester').access?.secret).toBe('staging-password')
    expect(presentAssignment(accepted.assignment, 'customer').access).toBeUndefined()
    expect(presentAssignment(accepted.assignment, 'operator').access?.username).toBe('qa-user')
  })

  it('records a dropout without inventing a completed result', () => {
    const replaced = replaceAssignment(assignment('accepted'), 'did not attend')
    expect(replaced.ok).toBe(true)
    if (!replaced.ok) return
    expect(replaced.assignment.status).toBe('replaced')
    expect(replaced.assignment.replacedReason).toBe('did not attend')
  })

  it('matches android testers only when the device was checked', () => {
    expect(isEligible(profile(), 'android')).toBe(true)
    expect(isEligible(profile({ deviceChecked: false }), 'android')).toBe(false)
    expect(isEligible(profile(), 'ios')).toBe(false)
    expect(isEligible(profile({ isAvailable: false }), 'web')).toBe(false)
  })
})

describe('execution and coverage', () => {
  it('rejects a submission with no note and no uploaded evidence', () => {
    const result = submitExecution(execution({ outcome: 'pass' }))
    expect(result.ok).toBe(false)
  })

  it('accepts a pass that has a note and no defect', () => {
    const result = submitExecution(execution({ outcome: 'pass', notes: 'Completed with no defect.' }))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.execution.status).toBe('submitted')
  })

  it('does not let blocked or not-run scenarios increase the pass count', () => {
    const summary = coverage([
      { status: 'pass' },
      { status: 'blocked' },
      { status: 'not_run' },
      { status: 'not_applicable' },
    ])
    expect(summary.passed).toBe(1)
    expect(summary.inScope).toBe(3)
    expect(summary.notApplicable).toBe(1)
  })
})

describe('coverage property', () => {
  it('in-scope counts exclude not applicable and never treat blocked as passed', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...ScenarioStatusSchema.options), { maxLength: 20 }),
        (statuses: ScenarioStatus[]) => {
          const summary = coverage(statuses.map((status) => ({ status })))
          const applicable = statuses.filter((status) => status !== 'not_applicable')
          return (
            summary.inScope === applicable.length &&
            summary.passed === statuses.filter((status) => status === 'pass').length &&
            summary.passed + summary.failed + summary.blocked + summary.notRun === summary.inScope
          )
        }
      )
    )
  })
})
