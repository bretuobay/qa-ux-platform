import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { orders } from './orders.js'
import { users } from './users.js'

export const executions = pgTable('executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  scenarioId: uuid('scenario_id'),
  assignmentId: uuid('assignment_id'),
  testerId: uuid('tester_id').notNull().references(() => users.id),
  buildId: uuid('build_id'),
  outcome: varchar('outcome', { length: 50 }),
  notes: text('notes'),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
