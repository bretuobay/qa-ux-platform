import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { findings } from './findings.js'
import { users } from './users.js'

export const findingReviews = pgTable('finding_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  findingId: uuid('finding_id').notNull().references(() => findings.id),
  outcome: varchar('outcome', { length: 50 }).notNull(),
  reason: text('reason').notNull(),
  reviewerId: uuid('reviewer_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
