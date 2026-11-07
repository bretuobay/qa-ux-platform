import { pgTable, uuid, varchar, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import { orders } from './orders.js'
import { users } from './users.js'

export const assignments = pgTable('assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  testerId: uuid('tester_id').notNull().references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('offered'),
  timeCommitment: varchar('time_commitment', { length: 200 }),
  compensationCents: integer('compensation_cents'),
  currency: varchar('currency', { length: 3 }).default('USD'),
  deadline: timestamp('deadline'),
  consentRequired: boolean('consent_required').notNull().default(true),
  evidenceRequired: text('evidence_required'),
  accessInstructions: text('access_instructions'),
  accessUsername: varchar('access_username', { length: 200 }),
  accessSecret: text('access_secret'),
  replacementOfId: uuid('replacement_of_id'),
  replacedReason: text('replaced_reason'),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
