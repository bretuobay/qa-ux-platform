import { CreateQuoteSchema } from '@qa-ux/contracts'
import type { CreateQuoteInput, Quote } from '@qa-ux/contracts'
import { zodErrors } from '../zod-errors.js'

export type CreateQuoteResult = { ok: true; quote: Quote } | { ok: false; errors: string[] }

export function createQuote(input: CreateQuoteInput): CreateQuoteResult {
  const parsed = CreateQuoteSchema.safeParse(input)
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error) }
  const now = new Date()
  return {
    ok: true,
    quote: {
      ...parsed.data,
      id: globalThis.crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    },
  }
}
