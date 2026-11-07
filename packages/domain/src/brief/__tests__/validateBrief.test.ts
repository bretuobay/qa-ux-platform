import { describe, expect, it } from 'vitest'
import * as fc from 'fast-check'
import { createBrief } from '../createBrief.js'
import { validateBrief } from '../validateBrief.js'
import type { CreateBriefInput } from '@qa-ux/contracts'

const base: CreateBriefInput = {
  businessId: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
  applicationId: 'b2c3d4e5-f6a7-4890-9bcd-ef0123456789',
  module: 'qa_check',
  audience: 'New customers checking out on a phone',
  goals: 'Learn whether checkout completes',
  platform: 'web',
  journeys: ['Pay for an order'],
}

describe('validateBrief', () => {
  it('accepts a QA brief that names a journey', () => {
    const created = createBrief(base)
    expect(created.ok).toBe(true)
  })

  it('rejects a QA brief with no journeys', () => {
    const created = createBrief({ ...base, journeys: [] })
    expect(created.ok).toBe(false)
    if (created.ok) return
    expect(created.errors.some((error) => error.startsWith('journeys:'))).toBe(true)
  })

  it('rejects a beta brief that omits duration or participation tasks', () => {
    const created = createBrief({
      ...base,
      module: 'beta_launch',
      journeys: [],
      participationTasks: [],
    })
    expect(created.ok).toBe(false)
    if (created.ok) return
    expect(created.errors.some((error) => error.includes('betaDurationDays'))).toBe(true)
    expect(created.errors.some((error) => error.includes('participationTasks'))).toBe(true)
  })

  it('accepts a beta brief with duration and tasks', () => {
    const created = createBrief({
      ...base,
      module: 'beta_launch',
      journeys: [],
      betaDurationDays: 14,
      participationTasks: ['Install the build and complete one booking'],
    })
    expect(created.ok).toBe(true)
  })

  it('rejects a release check that does not name the earlier order', () => {
    const created = createBrief({
      ...base,
      module: 'release_check',
      changedAreas: 'Payment retry copy',
    })
    expect(created.ok).toBe(false)
  })
})

describe('validateBrief property tests', () => {
  it('a QA brief with at least one journey passes', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 80 }), { minLength: 1, maxLength: 5 }),
        (journeys) => {
          const created = createBrief({ ...base, journeys })
          if (!created.ok) return false
          return validateBrief(created.brief).success === true
        }
      )
    )
  })

  it('a usability brief without tasks fails', () => {
    fc.assert(
      fc.property(fc.constant('usability_study' as const), () => {
        const created = createBrief({ ...base, module: 'usability_study', journeys: [], tasks: [] })
        return created.ok === false
      })
    )
  })
})
