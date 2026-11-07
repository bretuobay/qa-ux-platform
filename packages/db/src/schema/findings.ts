import { pgTable, uuid, varchar, text, json, timestamp } from 'drizzle-orm/pg-core'
import { orders } from './orders.js'
import { executions } from './executions.js'
import { users } from './users.js'

export const findings = pgTable('findings', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  executionId: uuid('execution_id').notNull().references(() => executions.id),
  reporterId: uuid('reporter_id').notNull().references(() => users.id),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  severity: varchar('severity', { length: 50 }).notNull().default('medium'),
  status: varchar('status', { length: 50 }).notNull().default('open'),
  stepsToReproduce: text('steps_to_reproduce'),
  expectedBehavior: text('expected_behavior'),
  actualBehavior: text('actual_behavior'),
  evidenceUrls: json('evidence_urls').$type<string[]>().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
