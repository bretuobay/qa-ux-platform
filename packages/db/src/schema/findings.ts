import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'
import { orders } from './orders.js'
import { executions } from './executions.js'
import { users } from './users.js'
import { builds } from './builds.js'
import { environments } from './environments.js'
import { scenarios } from './scenarios.js'

export const findings = pgTable('findings', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  scenarioId: uuid('scenario_id').references(() => scenarios.id),
  executionId: uuid('execution_id').references(() => executions.id),
  reporterId: uuid('reporter_id').notNull().references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  steps: text('steps').notNull(),
  expectedBehavior: text('expected_behavior').notNull(),
  actualBehavior: text('actual_behavior').notNull(),
  buildId: uuid('build_id').notNull().references(() => builds.id),
  environmentId: uuid('environment_id').references(() => environments.id),
  journey: varchar('journey', { length: 300 }),
  reproducibility: varchar('reproducibility', { length: 50 }).notNull(),
  severity: varchar('severity', { length: 50 }),
  impact: varchar('impact', { length: 50 }),
  customerPriority: varchar('customer_priority', { length: 50 }).notNull().default('unset'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
