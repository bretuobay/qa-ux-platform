import { integer, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'
import { orders } from './orders.js'

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  version: integer('version').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  objective: text('objective').notNull(),
  authorName: varchar('author_name', { length: 200 }).notNull(),
  reviewerName: varchar('reviewer_name', { length: 200 }).notNull(),
  coverage: jsonb('coverage').$type<Record<string, number>>().notNull(),
  findings: jsonb('findings').$type<Record<string, unknown>[]>().notNull(),
  publishedAt: timestamp('published_at').notNull(),
})
