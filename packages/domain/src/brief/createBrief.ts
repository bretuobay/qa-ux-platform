import { CreateBriefSchema } from '@qa-ux/contracts'
import type { Brief, CreateBriefInput } from '@qa-ux/contracts'
import { zodErrors } from '../zod-errors.js'
import { validateBrief } from './validateBrief.js'

export type CreateBriefResult =
  | { ok: true; brief: Brief }
  | { ok: false; errors: string[] }

export function createBrief(input: CreateBriefInput): CreateBriefResult {
  const parsed = CreateBriefSchema.safeParse(input)
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error) }

  const now = new Date()
  const brief: Brief = {
    ...parsed.data,
    id: globalThis.crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  const validation = validateBrief(brief)
  if (!validation.success) return { ok: false, errors: validation.errors }
  return { ok: true, brief }
}
