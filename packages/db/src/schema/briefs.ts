import { pgTable, uuid, varchar, text, integer, json, timestamp } from 'drizzle-orm/pg-core'
import { organizations } from './organizations.js'
import { applications } from './applications.js'

export const briefs = pgTable('briefs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  applicationId: uuid('application_id').notNull().references(() => applications.id),
  module: varchar('module', { length: 50 }).notNull(),
  audience: text('audience').notNull(),
  goals: text('goals').notNull(),
  platform: varchar('platform', { length: 50 }).notNull(),
  releaseDeadline: timestamp('release_deadline'),
  journeys: json('journeys').$type<string[]>().notNull().default([]),
  tasks: json('tasks').$type<string[]>().notNull().default([]),
  risks: text('risks'),
  exclusions: text('exclusions'),
  languages: json('languages').$type<string[]>().notNull().default(['en']),
  accessibilityNeeds: text('accessibility_needs'),
  desiredEvidence: text('desired_evidence'),
  betaDurationDays: integer('beta_duration_days'),
  participationTasks: json('participation_tasks').$type<string[]>().notNull().default([]),
  changedAreas: text('changed_areas'),
  priorOrderId: uuid('prior_order_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
