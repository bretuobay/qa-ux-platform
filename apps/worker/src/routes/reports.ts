import { Hono } from 'hono'
import { PublishReportSchema } from '@qa-ux/contracts'
import { coverage, publishReport, reportCsv, reportHtml } from '@qa-ux/domain'
import type { WorkerEnv } from '../types/worker-env.js'
import { businessMiddleware } from '../middleware/business.js'
import { zodErrors } from './errors.js'
import { getOrder, getReport, listFindings, listReports, listScenarios, saveReport } from '../store/memory.js'

const reports = new Hono<{ Bindings: WorkerEnv }>()
reports.use('*', businessMiddleware)

reports.get('/', (c) => {
  const orderId = c.req.query('orderId')
  if (!orderId) return c.json({ error: 'orderId is required' }, 400)
  const order = getOrder(c.get('businessId'), orderId)
  if (!order) return c.json({ error: 'Order not found' }, 404)
  return c.json({ data: listReports(c.get('businessId'), order.id) })
})

reports.post('/', async (c) => {
  if (c.req.header('x-tester-id')) return c.json({ error: 'The operator publishes the report.' }, 403)
  const businessId = c.get('businessId')
  const body: unknown = await c.req.json().catch(() => null)
  const parsed = PublishReportSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid report', errors: zodErrors(parsed.error) }, 400)
  const order = getOrder(businessId, parsed.data.orderId)
  if (!order) return c.json({ error: 'Order not found' }, 404)
  const existing = listReports(businessId, order.id)
  const published = publishReport({
    businessId,
    orderId: order.id,
    version: existing.length + 1,
    title: order.title,
    objective: parsed.data.objective,
    authorName: parsed.data.authorName,
    reviewerName: parsed.data.reviewerName,
    coverage: coverage(listScenarios(businessId, order.id)),
    findings: listFindings(businessId, order.id),
  })
  if (!published.ok) return c.json({ error: published.error }, 400)
  saveReport(published.report)
  return c.json({ report: published.report }, 201)
})

reports.get('/:id/csv', (c) => {
  const report = getReport(c.get('businessId'), c.req.param('id'))
  if (!report) return c.json({ error: 'Report not found' }, 404)
  return c.body(reportCsv(report), 200, {
    'content-type': 'text/csv; charset=utf-8',
    'content-disposition': `attachment; filename="report-v${report.version}.csv"`,
  })
})

reports.get('/:id/html', (c) => {
  const report = getReport(c.get('businessId'), c.req.param('id'))
  if (!report) return c.json({ error: 'Report not found' }, 404)
  return c.body(reportHtml(report), 200, { 'content-type': 'text/html; charset=utf-8' })
})

reports.get('/:id', (c) => {
  const report = getReport(c.get('businessId'), c.req.param('id'))
  if (!report) return c.json({ error: 'Report not found' }, 404)
  return c.json({ report })
})

export { reports }
