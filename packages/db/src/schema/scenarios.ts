import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { orders } from './orders.js'

export const scenarios = pgTable('scenarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  steps: text('steps'),
  expectedOutcome: text('expected_outcome'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
