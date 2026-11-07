import { pgTable, uuid, varchar, text, integer, json, timestamp } from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'
import { orders } from './orders.js'

export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  version: integer('version').notNull(),
  lineItems: json('line_items').$type<{ description: string; amountCents: number }[]>().notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  incentivesCents: integer('incentives_cents').notNull().default(0),
  deliverables: text('deliverables').notNull(),
  retestLimit: integer('retest_limit').notNull().default(1),
  terms: text('terms'),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
