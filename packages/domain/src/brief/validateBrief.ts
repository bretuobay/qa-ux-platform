import { BriefSchema } from '@qa-ux/contracts'
import type { Brief } from '@qa-ux/contracts'
import { zodErrors } from '../zod-errors.js'
import type { ValidationResult } from '../order/validateOrder.js'

export function validateBrief(brief: Brief): ValidationResult {
  const parsed = BriefSchema.safeParse(brief)
  if (!parsed.success) return { success: false, errors: zodErrors(parsed.error) }

  const errors: string[] = []
  const needsJourneys =
    brief.module === 'qa_check' ||
    brief.module === 'combined_launch' ||
    brief.module === 'release_check'
  if (needsJourneys && brief.journeys.length < 1) {
    errors.push('journeys: Add at least one critical journey.')
  }
  if (
    (brief.module === 'usability_study' || brief.module === 'combined_launch') &&
    brief.tasks.length < 1
  ) {
    errors.push('tasks: Add at least one task.')
  }
  if (brief.module === 'beta_launch') {
    if (!brief.betaDurationDays) {
      errors.push('betaDurationDays: Beta requests must state a duration.')
    }
    if (brief.participationTasks.length < 1) {
      errors.push('participationTasks: Beta requests must state participation tasks.')
    }
  }
  if (brief.module === 'release_check') {
    if (!brief.priorOrderId) {
      errors.push('priorOrderId: A release check must reference the earlier order.')
    }
    if (!brief.changedAreas?.trim()) {
      errors.push('changedAreas: Describe what changed since the last report.')
    }
  }

  if (errors.length > 0) return { success: false, errors }
  return { success: true }
}
