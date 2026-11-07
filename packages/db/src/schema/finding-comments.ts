import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { findings } from './findings.js'
import { users } from './users.js'

export const findingComments = pgTable('finding_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  findingId: uuid('finding_id').notNull().references(() => findings.id),
  authorId: uuid('author_id').notNull().references(() => users.id),
  authorRole: varchar('author_role', { length: 50 }).notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
