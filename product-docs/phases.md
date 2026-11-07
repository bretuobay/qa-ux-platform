# Delivery phases

Sliced from [prd.md](./prd.md) section 13, with Phase B broken into build slices a single person can ship and demo. Phase A is service validation, not a software release.

| Phase | What it proves | Build? |
|---|---|---|
| A | Interviews, five paid pilots, templates, consent, compensation rules, sample report | No product code. Use existing scheduling tools plus secure project records. |
| B | Managed MVP: a paid order can go from brief to report and retest | Yes. Web and Android first. iOS after one internal end-to-end pilot. |
| C | Repeat work: saved regression suites, release credits, issue-tracker export, tighter screening | After paid delivery is dependable. |
| D | Self-service matching, automated tests, CI triggers, more languages, regional panels | Only after recruitment quality and disputes are reliable. Do not build an open marketplace before that. |

P0 requirements in the PRD belong to Phase B. P1 items (issue-tracker integrations, scheduled recurring execution, customer-facing automation) wait for Phase C or D.

## Phase B slices

Each slice ends with `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` passing.

### B1 — Brief, quote, and order lifecycle (shipped)

The spine everything else attaches to. Service status and payment status are different fields, matching section 5.

Covers:

- REQ 03 draft briefs, saved by module, with module-specific validation (journeys, tasks, beta duration, release-check predecessor)
- REQ 04 operator quote with version, line items, deliverables, retest limit, expiry, and recorded acceptance
- Order states: draft → scope review → quoted → accepted → payment pending → readiness check → recruiting → scheduled → in progress → review → delivered → retest → closed, plus pause (with resume) and cancel (with a reason)
- Payment states: unpaid, paid, refunded, partially refunded. Confirming payment is the only transition that marks an order paid. Cancelling does not refund.
- Buyer home: orders, next action, quote amount. New brief. Activity on an order.
- Operator queue: issue a quote and move work forward
- Schema for organizations (already present), environments, briefs, quotes, and order events

Not in B1:

- Real sign-in, membership enforcement, or provider checkout (REQ 01 and REQ 05). The API isolates tenants with `X-Business-Id`. The dev SPAs send a fixed local tenant id.
- A database connection. Drizzle tables are in `packages/db`. The worker stores briefs, quotes, orders, and events in memory so the lifecycle can be exercised before Neon is provisioned.
- iOS recruitment. A brief may name iOS. Delivery stays web and Android until the internal pilot in the PRD.

### B2 — Readiness, matching, and execution (this slice)

REQ 02 immutable builds and environments on the order. REQ 06 readiness blockers. REQ 10–12 and 15–16: tester profiles, manual assignment, scenario forms, evidence metadata with a retry state, recruitment slots, replacement history. Access material stays hidden until someone is assigned. Still in memory, with Drizzle tables ready for Neon. The activity feed is still the order event list from B1. A database-backed feed waits for the connection.

### B3 — Review, findings, retest, and reports

REQ 07–08 and 13–14. Sections 8–10. Severity versus customer priority. Reviewer outcomes (accepted, clarification, duplicate, invalid, out of scope). Retest results: fixed, still reproducible, unable to verify. Versioned report, CSV and printable HTML. Finding filters.

### B4 — Money, consent, and safeguards

REQ 05 idempotent provider webhooks (an order is never marked paid from a browser redirect). REQ 09 copy a prior scope into a release check. REQ 17 payout ledger. Section 12: consent version and timestamp, retention, signed evidence URLs, audit events, credential separation, backup restore.

Launch acceptance from section 13 is the exit test for B4: one paid order from brief through retest, cross-tenant isolation, idempotent payment, consent, upload recovery, replacement history, report export, payout reconciliation, and a tested restore.

## Phase C

Saved regression suites, release credits with expiry, issue-tracker export, stronger participant screening, broader device coverage. A human still confirms readiness and capacity for every order.

## Phase D

Self-service matching, automated execution, CI triggers, additional languages, regional panels. No open marketplace until disputes and evidence review are boringly reliable.

## Working agreement

Build B1, then B2, then B3, then B4. Do not start Phase C features while a Phase B requirement is still a stub, unless a pilot forces a narrow exception and it is written down here.
