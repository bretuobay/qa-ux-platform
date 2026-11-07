import type { Assignment, AssignmentStatus, Platform, RecruitmentSlot, TesterProfile } from '@qa-ux/contracts'

export type AssignmentViewer = 'customer' | 'operator' | 'tester'

export interface AssignmentAccess {
  instructions?: string
  username?: string
  secret?: string
}

export type AssignmentView = Omit<
  Assignment,
  'accessInstructions' | 'accessUsername' | 'accessSecret'
> & { access?: AssignmentAccess }

export function isEligible(profile: TesterProfile, platform: Platform): boolean {
  if (!profile.isAvailable || profile.qualification === 'failed') return false
  if (platform === 'ios') return false
  if (platform === 'web') return true
  const blob = `${profile.os ?? ''} ${(profile.devices ?? []).join(' ')} ${profile.deviceModel ?? ''}`.toLowerCase()
  return profile.deviceChecked === true && blob.includes('android')
}

export function presentAssignment(assignment: Assignment, viewer: AssignmentViewer): AssignmentView {
  const { accessInstructions, accessUsername, accessSecret, ...rest } = assignment
  const reveal =
    viewer === 'operator' || (viewer === 'tester' && assignment.status === 'accepted')
  if (!reveal) return rest

  const access: AssignmentAccess = {}
  if (accessInstructions) access.instructions = accessInstructions
  if (accessUsername) access.username = accessUsername
  if (accessSecret) access.secret = accessSecret
  if (Object.keys(access).length === 0) return rest
  return { ...rest, access }
}

export function acceptAssignment(
  assignment: Assignment
): { ok: true; assignment: Assignment } | { ok: false; error: string } {
  if (assignment.status !== 'offered') {
    return { ok: false, error: 'Only an open offer can be accepted.' }
  }
  const now = new Date()
  return { ok: true, assignment: { ...assignment, status: 'accepted', acceptedAt: now, updatedAt: now } }
}

export function replaceAssignment(
  assignment: Assignment,
  reason: string
): { ok: true; assignment: Assignment } | { ok: false; error: string } {
  const note = reason.trim()
  if (!note) return { ok: false, error: 'A reason is required.' }
  if (assignment.status === 'replaced') return { ok: false, error: 'This assignment was already replaced.' }
  return {
    ok: true,
    assignment: { ...assignment, status: 'replaced', replacedReason: note, updatedAt: new Date() },
  }
}

export function fillSlot(slot: RecruitmentSlot, assignmentId: string): RecruitmentSlot {
  return { ...slot, status: 'filled', assignmentId, updatedAt: new Date() }
}

export function reopenSlot(slot: RecruitmentSlot): RecruitmentSlot {
  const next: RecruitmentSlot = { ...slot, status: 'open', updatedAt: new Date() }
  delete next.assignmentId
  return next
}

export function canWork(status: AssignmentStatus): boolean {
  return status === 'accepted'
}
