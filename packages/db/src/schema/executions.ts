import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'
import { orders } from './orders.js'
import { users } from './users.js'

export const executions = pgTable('executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  testerId: uuid('tester_id').notNull().references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('in_progress'),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
