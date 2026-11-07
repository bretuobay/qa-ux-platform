import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'
import { applications } from './applications.js'
import { builds } from './builds.js'

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  applicationId: uuid('application_id').notNull().references(() => applications.id),
  buildId: uuid('build_id').references(() => builds.id),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  priority: varchar('priority', { length: 50 }).notNull().default('medium'),
  testerCount: integer('tester_count').notNull().default(1),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
