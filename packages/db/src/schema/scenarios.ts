import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { orders } from './orders.js'

export const scenarios = pgTable('scenarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  title: varchar('title', { length: 200 }).notNull(),
  journey: varchar('journey', { length: 300 }),
  description: text('description'),
  prerequisites: text('prerequisites'),
  steps: text('steps'),
  expectedOutcome: text('expected_outcome'),
  environmentId: uuid('environment_id'),
  buildId: uuid('build_id'),
  status: varchar('status', { length: 50 }).notNull().default('not_run'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
