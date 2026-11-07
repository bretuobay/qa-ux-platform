import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'
import { orders } from './orders.js'

export const readinessChecks = pgTable('readiness_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  check: varchar('check', { length: 50 }).notNull(),
  passed: boolean('passed').notNull().default(false),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
