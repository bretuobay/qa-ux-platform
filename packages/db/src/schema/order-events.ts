import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'
import { orders } from './orders.js'

export const orderEvents = pgTable('order_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  event: varchar('event', { length: 50 }).notNull(),
  fromStatus: varchar('from_status', { length: 50 }).notNull(),
  toStatus: varchar('to_status', { length: 50 }).notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
