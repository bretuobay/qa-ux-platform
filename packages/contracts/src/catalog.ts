import { z } from 'zod'
import { PlatformSchema } from './lifecycle.js'

export const ProductApplicationSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  name: z.string().min(1).max(200),
  platform: PlatformSchema,
  description: z.string().max(2000).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProductApplication = z.infer<typeof ProductApplicationSchema>

export const CreateProductApplicationSchema = ProductApplicationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateProductApplicationInput = z.input<typeof CreateProductApplicationSchema>

export const TestEnvironmentSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  applicationId: z.string().uuid(),
  name: z.string().min(1).max(200),
  platform: PlatformSchema,
  browser: z.string().max(100).optional(),
  os: z.string().max(100).optional(),
  device: z.string().max(200).optional(),
  createdAt: z.coerce.date(),
})

export type TestEnvironment = z.infer<typeof TestEnvironmentSchema>

export const CreateTestEnvironmentSchema = TestEnvironmentSchema.omit({
  id: true,
  businessId: true,
  applicationId: true,
  createdAt: true,
})

export type CreateTestEnvironmentInput = z.input<typeof CreateTestEnvironmentSchema>

export const ProductBuildSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  applicationId: z.string().uuid(),
  version: z.string().min(1).max(100),
  buildNumber: z.string().max(100).optional(),
  downloadUrl: z.string().url().max(1000).optional(),
  platform: PlatformSchema,
  createdAt: z.coerce.date(),
})

export type ProductBuild = z.infer<typeof ProductBuildSchema>

export const CreateProductBuildSchema = ProductBuildSchema.omit({
  id: true,
  businessId: true,
  applicationId: true,
  createdAt: true,
})

export type CreateProductBuildInput = z.input<typeof CreateProductBuildSchema>

export const READINESS_CHECKS = [
  'build_named',
  'environment_reachable',
  'test_accounts',
  'synthetic_data',
  'permission_to_test',
  'contact',
] as const

export const ReadinessCheckSchema = z.enum(READINESS_CHECKS)
export type ReadinessCheck = z.infer<typeof ReadinessCheckSchema>

export const ReadinessItemSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  orderId: z.string().uuid(),
  check: ReadinessCheckSchema,
  passed: z.boolean(),
  updatedAt: z.coerce.date(),
})

export type ReadinessItem = z.infer<typeof ReadinessItemSchema>

export const SaveReadinessSchema = z.object({
  checks: z.object({
    build_named: z.boolean(),
    environment_reachable: z.boolean(),
    test_accounts: z.boolean(),
    synthetic_data: z.boolean(),
    permission_to_test: z.boolean(),
    contact: z.boolean(),
  }),
})

export type SaveReadinessInput = z.infer<typeof SaveReadinessSchema>
