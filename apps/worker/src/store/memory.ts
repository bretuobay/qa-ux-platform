import type {
  Assignment,
  Brief,
  Execution,
  Finding,
  Order,
  OrderActivity,
  ProductApplication,
  ProductBuild,
  Quote,
  ReadinessItem,
  RecruitmentSlot,
  Report,
  Scenario,
  TestEnvironment,
  TesterProfile,
} from '@qa-ux/contracts'

/**
 * Process-local store. A later Neon adapter should replace this file
 * and keep the same function names. Data does not survive a worker restart.
 */
const orders = new Map<string, Order>()
const briefs = new Map<string, Brief>()
const quotes = new Map<string, Quote>()
const events: OrderActivity[] = []
const applications = new Map<string, ProductApplication>()
const environments = new Map<string, TestEnvironment>()
const builds = new Map<string, ProductBuild>()
const readiness = new Map<string, ReadinessItem>()
const profiles = new Map<string, TesterProfile>()
const assignments = new Map<string, Assignment>()
const slots = new Map<string, RecruitmentSlot>()
const scenarios = new Map<string, Scenario>()
const executions = new Map<string, Execution>()
const findings = new Map<string, Finding>()
const reports = new Map<string, Report>()

export function resetMemoryStore(): void {
  orders.clear()
  briefs.clear()
  quotes.clear()
  events.length = 0
  applications.clear()
  environments.clear()
  builds.clear()
  readiness.clear()
  profiles.clear()
  assignments.clear()
  slots.clear()
  scenarios.clear()
  executions.clear()
  findings.clear()
  reports.clear()
}

export function saveBrief(brief: Brief): void {
  briefs.set(brief.id, brief)
}

export function listBriefs(businessId: string): Brief[] {
  return [...briefs.values()].filter((brief) => brief.businessId === businessId)
}

export function saveOrder(order: Order): void {
  orders.set(order.id, order)
}

export function listOrders(businessId: string): Order[] {
  return [...orders.values()].filter((order) => order.businessId === businessId)
}

export function getOrder(businessId: string, id: string): Order | null {
  const order = orders.get(id)
  if (!order || order.businessId !== businessId) return null
  return order
}

export function saveQuote(quote: Quote): void {
  quotes.set(quote.id, quote)
}

export function getQuote(businessId: string, id: string): Quote | null {
  const quote = quotes.get(id)
  if (!quote || quote.businessId !== businessId) return null
  return quote
}

export function listQuotes(businessId: string): Quote[] {
  return [...quotes.values()].filter((quote) => quote.businessId === businessId)
}

export function listQuotesForOrder(businessId: string, orderId: string): Quote[] {
  return listQuotes(businessId).filter((quote) => quote.orderId === orderId)
}

export function saveEvent(activity: OrderActivity): void {
  events.push(activity)
}

export function listEvents(businessId: string, orderId: string): OrderActivity[] {
  return events.filter((event) => event.businessId === businessId && event.orderId === orderId)
}

export function saveApplication(application: ProductApplication): void {
  applications.set(application.id, application)
}

export function listApplications(businessId: string): ProductApplication[] {
  return [...applications.values()].filter((application) => application.businessId === businessId)
}

export function getApplication(businessId: string, id: string): ProductApplication | null {
  const application = applications.get(id)
  if (!application || application.businessId !== businessId) return null
  return application
}

export function saveEnvironment(environment: TestEnvironment): void {
  environments.set(environment.id, environment)
}

export function listEnvironments(businessId: string, applicationId: string): TestEnvironment[] {
  return [...environments.values()].filter(
    (environment) => environment.businessId === businessId && environment.applicationId === applicationId
  )
}

export function saveBuild(build: ProductBuild): void {
  builds.set(build.id, Object.freeze(build))
}

export function listBuilds(businessId: string, applicationId?: string): ProductBuild[] {
  return [...builds.values()].filter(
    (build) => build.businessId === businessId && (applicationId ? build.applicationId === applicationId : true)
  )
}

export function getBuild(businessId: string, id: string): ProductBuild | null {
  const build = builds.get(id)
  if (!build || build.businessId !== businessId) return null
  return build
}

function readinessKey(orderId: string, check: string): string {
  return `${orderId}:${check}`
}

export function saveReadiness(item: ReadinessItem): void {
  readiness.set(readinessKey(item.orderId, item.check), item)
}

export function listReadiness(businessId: string, orderId: string): ReadinessItem[] {
  return [...readiness.values()].filter(
    (item) => item.businessId === businessId && item.orderId === orderId
  )
}

export function saveProfile(profile: TesterProfile): void {
  profiles.set(profile.userId, profile)
}

export function listProfiles(): TesterProfile[] {
  return [...profiles.values()]
}

export function getProfile(userId: string): TesterProfile | null {
  return profiles.get(userId) ?? null
}

export function saveAssignment(assignment: Assignment): void {
  assignments.set(assignment.id, assignment)
}

export function listAssignments(businessId: string, orderId?: string): Assignment[] {
  return [...assignments.values()].filter(
    (assignment) =>
      assignment.businessId === businessId && (orderId ? assignment.orderId === orderId : true)
  )
}

export function listAssignmentsForTester(testerId: string): Assignment[] {
  return [...assignments.values()].filter((assignment) => assignment.testerId === testerId)
}

export function getAssignment(businessId: string, id: string): Assignment | null {
  const assignment = assignments.get(id)
  if (!assignment || assignment.businessId !== businessId) return null
  return assignment
}

export function getAssignmentForTester(testerId: string, id: string): Assignment | null {
  const assignment = assignments.get(id)
  if (!assignment || assignment.testerId !== testerId) return null
  return assignment
}

export function saveSlot(slot: RecruitmentSlot): void {
  slots.set(slot.id, slot)
}

export function listSlots(businessId: string, orderId: string): RecruitmentSlot[] {
  return [...slots.values()].filter((slot) => slot.businessId === businessId && slot.orderId === orderId)
}

export function saveScenario(scenario: Scenario): void {
  scenarios.set(scenario.id, scenario)
}

export function listScenarios(businessId: string, orderId: string): Scenario[] {
  return [...scenarios.values()].filter(
    (scenario) => scenario.businessId === businessId && scenario.orderId === orderId
  )
}

export function getScenario(businessId: string, id: string): Scenario | null {
  const scenario = scenarios.get(id)
  if (!scenario || scenario.businessId !== businessId) return null
  return scenario
}

export function saveExecution(execution: Execution): void {
  executions.set(execution.id, execution)
}

export function listExecutions(businessId: string, scenarioId?: string): Execution[] {
  return [...executions.values()].filter(
    (execution) =>
      execution.businessId === businessId && (scenarioId ? execution.scenarioId === scenarioId : true)
  )
}

export function getExecution(businessId: string, id: string): Execution | null {
  const execution = executions.get(id)
  if (!execution || execution.businessId !== businessId) return null
  return execution
}

export function hasSubmittedWork(businessId: string, orderId: string): boolean {
  return listExecutions(businessId).some(
    (execution) => execution.orderId === orderId && execution.status === 'submitted'
  )
}

export function saveFinding(finding: Finding): void {
  findings.set(finding.id, finding)
}

export function listFindings(businessId: string, orderId?: string): Finding[] {
  return [...findings.values()].filter(
    (finding) => finding.businessId === businessId && (orderId ? finding.orderId === orderId : true)
  )
}

export function getFinding(businessId: string, id: string): Finding | null {
  const finding = findings.get(id)
  if (!finding || finding.businessId !== businessId) return null
  return finding
}

export function saveReport(report: Report): void {
  const frozen = Object.freeze({
    ...report,
    coverage: Object.freeze({ ...report.coverage }),
    findings: Object.freeze(report.findings.map((finding) => Object.freeze({ ...finding }))),
  })
  reports.set(report.id, frozen as Report)
}

export function listReports(businessId: string, orderId: string): Report[] {
  return [...reports.values()]
    .filter((report) => report.businessId === businessId && report.orderId === orderId)
    .sort((left, right) => left.version - right.version)
}

export function getReport(businessId: string, id: string): Report | null {
  const report = reports.get(id)
  if (!report || report.businessId !== businessId) return null
  return report
}
