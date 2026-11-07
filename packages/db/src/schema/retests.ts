import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { findings } from './findings.js'
import { builds } from './builds.js'

export const retests = pgTable('retests', {
  id: uuid('id').primaryKey().defaultRandom(),
  findingId: uuid('finding_id').notNull().references(() => findings.id),
  buildId: uuid('build_id').notNull().references(() => builds.id),
  result: varchar('result', { length: 50 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
