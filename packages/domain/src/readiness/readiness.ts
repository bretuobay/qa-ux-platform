import type { Order, ReadinessCheck, ReadinessItem } from '@qa-ux/contracts'
import { READINESS_CHECKS } from '@qa-ux/contracts'

export function readinessBlockers(
  items: Pick<ReadinessItem, 'check' | 'passed'>[],
  order: Pick<Order, 'buildId'>
): ReadinessCheck[] {
  const blockers = READINESS_CHECKS.filter((check) => {
    const item = items.find((candidate) => candidate.check === check)
    return !item?.passed
  })
  if (!order.buildId && !blockers.includes('build_named')) blockers.push('build_named')
  return blockers
}

export function attachBuild(
  order: Order,
  buildId: string,
  hasSubmittedWork: boolean
): { ok: true; order: Order } | { ok: false; error: string } {
  if (hasSubmittedWork) {
    return { ok: false, error: 'A new build cannot overwrite past results.' }
  }
  return { ok: true, order: { ...order, buildId, updatedAt: new Date() } }
}
