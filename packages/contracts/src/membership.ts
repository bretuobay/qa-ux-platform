import { z } from 'zod'

/** REQ 01. Viewers can read reports and cannot change scope, billing, or credentials. */
export const MembershipRoleSchema = z.enum(['owner', 'member', 'viewer'])
export type MembershipRole = z.infer<typeof MembershipRoleSchema>
