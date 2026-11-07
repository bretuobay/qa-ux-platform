import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'
import { applications } from './applications.js'
import { builds } from './builds.js'
import { briefs } from './briefs.js'

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  applicationId: uuid('application_id').notNull().references(() => applications.id),
  buildId: uuid('build_id').references(() => builds.id),
  briefId: uuid('brief_id').references(() => briefs.id),
  quoteId: uuid('quote_id'),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  module: varchar('module', { length: 50 }).notNull().default('qa_check'),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  paymentStatus: varchar('payment_status', { length: 50 }).notNull().default('unpaid'),
  priority: varchar('priority', { length: 50 }).notNull().default('medium'),
  testerCount: integer('tester_count').notNull().default(1),
  pausedFrom: varchar('paused_from', { length: 50 }),
  pauseReason: text('pause_reason'),
  cancelReason: text('cancel_reason'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
