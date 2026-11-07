# QA Usability and Beta Testing Platform

> This is the product requirements document (v1.0, 27 October 2026, product owner Festus Yeboah).
> How it is sliced into build phases: [phases.md](./phases.md).


Product requirements document

Version 1.0 | 27 October 2026 | Product owner Festus Yeboah

# **1 Product direction**

Build a platform and managed service that helps solo founders, small software teams, and agencies assess whether an application works, whether intended users can use it, and what should be fixed before release. Support web applications, Android apps, and iOS apps through one customer workspace.

The initial business is a managed testing service supported by a lightweight platform. Customers buy an agreed testing scope; the operator recruits suitable people, coordinates delivery, reviews evidence, and returns actionable findings. Self-service recruitment and advanced automation follow only after repeat demand and operational quality are established.

## **Business hypothesis**

AI coding tools may increase the number and release frequency of products built by small teams. Those teams may need independent QA and user research without employing dedicated specialists. This is a hypothesis about customer demand and purchasing behaviour, not a verified market forecast.

## **Core promise**

Give customers credible evidence about their critical journeys before launch and after important changes. Each engagement identifies its tested build, scope, participants or testers, environments, unresolved issues, and limitations. Customers retain the release decision.

## **Initial operating assumptions**

* Serve English-speaking customers remotely; accept projects internationally only where recruitment, payments, and access can be supported.  
* Begin with ordinary consumer and business applications using staging environments and synthetic data.  
* Use real devices for contracted mobile coverage and actual intended users for usability studies.  
* Prioritize founders with launch commitments or existing users and small agencies delivering client products.  
* Validate web and Android delivery first; accept iOS projects once TestFlight recruitment and installation workflows are proven.

## **Goals and boundaries**

Goals are paid repeat use, useful findings, dependable delivery, and sustainable contribution margin. The service does not promise a bug-free product, store approval, market demand, security certification, or legal compliance. Security audits, load testing, full accessibility audits, and regulated workflows require separate specialist offerings and are outside the MVP.

# **2 Evidence and market assumptions**

Public discussions show developers requesting launch testers, reliable participation, bug discovery, and feedback on confusing experiences. Other discussions describe participant-recruitment costs and difficulty sustaining testing. These signals support customer discovery; they do not establish market size or willingness to pay.

## **Evidence from discovery**

| Signal | Interpretation | Limitation |
| :---- | :---- | :---- |
| Android developers request additional testers and reciprocal testing | Recruitment and coordination are visible problems | Many requests seek free help |
| Developers ask what is confusing or broken | Functional and usability concerns overlap for buyers | The desired depth and budget are unclear |
| Researchers ask for affordable screened participants | Recruitment quality and price matter | Specialist audiences can be expensive to source |
| Founders describe manual regression work | Repeat release testing may save founder time | A forum complaint is not a purchase commitment |

Sources and links are included in section 14. The strongest recent evidence concerns Android recruitment; evidence for the combined paid offer must come from pilots.

## **Competitive context**

Existing crowdtesting, beta-testing, usability-research, and freelance services already cover parts of this problem. Combining categories is insufficient differentiation. The proposed advantage is a clearly priced engagement, suitable participants, reviewed evidence, and continuity between releases for smaller customers.

## **Validation questions**

* What event makes a customer purchase: launch, a failed release, a client deadline, or a confusing onboarding funnel?  
* Do customers value execution, recruitment, analysis, or fix verification most?  
* What do they use today, what do they spend, and how much founder time is involved?  
* Will they share a usable test build and credentials promptly?  
* Will they pay again for the next release, rather than only for initial store testing?

## **Initial validation gate**

Complete at least 15 interviews across founders and agencies, then deliver five paid engagements for at least three unrelated customers. Seek two repeat purchases or paid follow-on bookings within 60 days of delivery. Require positive contribution on at least four engagements after assigning a realistic cost to founder delivery time. These are proposed decision thresholds, not forecasts. If they fail, narrow the audience or offer before building marketplace features.

# **3 Users and jobs to be done**

## **Customer roles**

The founder wants confidence without managing testers. The engineering lead needs reproducible issues tied to builds and environments. The product or design lead needs observed user behaviour and recommendations. The agency owner needs a reviewable report and separate workspaces for client projects.

| Persona | Trigger | Successful outcome |
| :---- | :---- | :---- |
| Solo founder | Preparing a serious launch | Main journeys tested and highest risks understood |
| Small product team | Shipping a substantial change | Regression evidence and verified fixes |
| Agency | Client acceptance or handover | Agreed coverage and a report suitable for client review |
| Product or design lead | Users abandon a key journey | Evidence of where suitable users struggle |

## **Delivery roles**

QA testers execute assigned scenarios and explore failures. Usability participants attempt tasks as intended users and explain their thinking where the study requires it. Beta testers use a product over an agreed period and report experiences. An operator manages matching, scheduling, and access. A reviewer validates evidence and prepares the report. One person may hold several internal roles during pilots, but each responsibility remains explicit.

## **Representative user stories**

* As a founder, I can describe three important journeys and receive a quote explaining exactly what will be tested and delivered.  
* As an engineer, I can reproduce a finding using its build, steps, expected result, actual result, and evidence.  
* As a product lead, I can distinguish a technical defect from a usability obstacle and see the participant context.  
* As an agency, I can keep client projects, credentials, reports, and invited reviewers separate.  
* As a tester, I can see tasks, device requirements, compensation, and acceptance rules before accepting an assignment.  
* As a participant, I can understand recording consent and stop a session without being pressured to give favourable feedback.  
* As an operator, I can replace a dropout without losing the original participation history.

## **Design principles**

Use plain language and a guided brief instead of asking customers to understand testing terminology. Show coverage and evidence before aggregate scores. Separate observation from interpretation. Keep compensation independent of finding a bug or giving positive feedback. Make project status and next actions visible to all authorized parties.

# **4 Service catalogue and commercial model**

Offer individual modules and a combined launch engagement. A single order may include several modules, with separate scope, participant requirements, and completion rules.

| Offer | Default pilot scope | Deliverable |
| :---- | :---- | :---- |
| QA check | Three critical journeys and three agreed environments | Execution results, reviewed bugs, coverage gaps |
| Usability study | Five screened participants and up to three tasks each | Consented recordings or notes, task outcomes, findings |
| Beta launch | Agreed cohort, test period, and usage tasks | Participation ledger, feedback, issues, limitations |
| Combined launch | QA check plus usability study; beta optional | Consolidated findings and one fix-verification round |
| Release check | Previously agreed journeys plus changed areas | Regression results and changes since prior report |

Environment means a specific browser and OS combination or a physical mobile device and OS. Coverage is named in the quote; the default does not imply every device or browser. Five usability participants support qualitative discovery and do not establish population-level rates.

## **Pricing requirements**

Launch with fixed project quotes and optional add-ons. Separate service fees, participant incentives, unusual device recruitment, and applicable payment charges in the price breakdown. Price beta cohorts by duration, task burden, and recruitment difficulty. Offer recurring release credits only once capacity and repeat demand are established; credits must have explicit expiry and usage rules.

Do not commit to a public price before pilot cost data. Calculate the minimum quote from delivery labour, recruitment, incentives, reviewer time, evidence storage, payment costs, replacement allowance, and target margin. Track customer revenue and tester compensation in separate ledgers.

## **Commercial rules**

* The customer approves a versioned scope, budget, timeline, and exclusions before payment and recruitment.  
* The clock starts after readiness checks pass; customer delays and agreed pauses are recorded.  
* A new build, extra journey, new language, or expanded audience may require a change order.  
* One fix-verification round covers the originally reported issues on one replacement build, submitted within 14 calendar days. Broader regression work is quoted separately.  
* Unfilled recruitment slots and undelivered tasks trigger replacement, revised scope, or proportionate service credit/refund under agreed terms.  
* Pay testers for valid agreed work even if no bugs are found. Customer dissatisfaction alone cannot indefinitely withhold compensation.

# **5 Customer journey and service lifecycle**

## **Booking and readiness**

The customer creates a workspace, registers an application, selects an objective, and submits a brief. The operator reviews feasibility, then returns an itemized quote and scope. After acceptance and confirmed payment, the team checks build access, credentials, task feasibility, audience availability, and recording consent requirements.

Readiness requires a reachable environment, a named build, working test accounts for each needed role, synthetic data, permissions to test the product, and a contact who can answer blockers. Payment alone does not start the delivery clock.

## **Execution and delivery**

The operator assigns testers or recruits participants. QA work produces scenario results and findings; usability work produces task observations; beta work produces scheduled participation and feedback. A reviewer validates submissions, merges duplicates while retaining authorship, and requests clarification where needed. Confirmed critical issues are escalated immediately rather than held for the final report.

The customer receives a report, reviews findings, and submits a replacement build for the included retest. The reviewer records fixed, still reproducible, or unable to verify. At closeout, the customer can export the report and propose another release check.

## **Order states**

Draft → scope review → quoted → accepted → payment pending → readiness check → recruiting → scheduled → in progress → review → delivered → retest → closed. Cancellation and pause states must be available with reasons. Paid, refunded, and partially refunded are payment states, not substitutes for service status.

## **Pilot service targets**

* Respond to a complete brief within one business day.  
* Deliver a standard QA check within three business days of readiness and confirmed capacity.  
* Target usability delivery within seven business days after successful recruitment; scarce audiences require a custom schedule.  
* Use an agreed beta duration; do not shorten a required external testing period.  
* Acknowledge confirmed critical findings within four staffed business hours.

Targets are pilot operating objectives. Publish business hours and time zone in the quote; do not advertise continuous support. Recruitment failure, inaccessible builds, unstable accounts, and customer changes must be visible in the timeline with revised dates and customer acknowledgement.

# **6 Customer platform requirements**

P0 means required for the managed MVP. P1 means after paid delivery is dependable. Each requirement below is P0 unless marked otherwise.

## **Accounts and projects**

REQ 01 Support customer workspaces with owner, member, and viewer roles; testers have assignment-specific access. An authorized viewer may read reports but cannot change scope, billing, or credentials. Server-side authorization must isolate organizations and agency client projects.

REQ 02 Store applications, platforms, test environments, build identifiers, installation links, and critical journeys. An order must reference an immutable snapshot of the tested build and scope. A new build cannot silently overwrite past results.

## **Brief quote and order**

REQ 03 Capture audience, goals, platform, release deadline, tasks, risks, exclusions, languages, accessibility needs, and desired evidence. Save drafts and validate required fields by selected module. Beta requests must state duration and participation tasks.

REQ 04 Support operator-written quotes with version, line items, incentives, target dates, deliverables, retest limits, terms, and expiry. Preserve customer acceptance with actor and time. Changes after acceptance require a new accepted revision.

REQ 05 Support payment through a provider-hosted checkout or invoice workflow. Verify successful payment server-side and process repeated payment events idempotently. Orders must not become paid solely from a browser redirect. Track cancellations, credits, and refunds against the original order.

## **Execution and collaboration**

REQ 06 Show readiness blockers, dates, recruitment progress, covered environments, outstanding customer actions, and a project activity feed. Label tester-reported participation separately from verified evidence.

REQ 07 Allow finding comments, clarification requests, customer priority, and retest requests. Secure credentials use a separate restricted field rather than ordinary comments. Initial notifications are in-app and transactional email.

## **Results and retention**

REQ 08 Show findings with evidence, coverage, task outcomes, exclusions, and retest history. Provide a downloadable report and structured issue export. Preserve the exact report version delivered. CSV export and printable HTML satisfy the MVP; direct issue-tracker integrations are P1.

REQ 09 Let customers copy an earlier scope into a new release order while retaining the earlier build and findings. Scheduled recurring execution is P1; a human must confirm readiness and capacity for each MVP order.

# **7 Tester participant and operator requirements**

## **Tester profiles and qualification**

REQ 10 Capture device model, OS, browser, country, languages, relevant experience, availability, and permitted payout method. Store whether a device claim was checked. QA applicants complete a small paid qualification task scored on reproduction, clarity, and evidence. Usability participants are screened for audience relevance rather than professional testing skill.

REQ 11 Assign work manually in the MVP using eligibility and capacity filters. Before acceptance, show scope, time commitment, compensation, deadline, consent, and evidence requirements. Do not expose product access or confidential details to unassigned applicants.

## **Task execution and quality control**

REQ 12 Provide scenario forms, bug submissions, task observations, evidence upload, and beta check-ins. Save incomplete submissions, handle upload retries, and record the build and environment used. A task may be completed with no defect found; require execution evidence or a clear outcome.

REQ 13 Review each submission as accepted, clarification needed, duplicate, invalid, or out of scope, with a reason. Preserve history and permit one appeal reviewed by another operator where staffing allows. A fixed task fee is the default; finding bonuses must never encourage duplicate or invented defects.

REQ 14 Track no-shows, accepted work, reviewer agreement, and assignment completion privately. Participants cannot see a public popularity score. Fraud signals trigger human review; they are not proof of misconduct.

## **Service operations**

REQ 15 Provide an operator queue for briefs, readiness, recruitment, blocked assignments, evidence review, delivery, and retests. Record the operator, next action, due date, and reason for every pause or replacement.

REQ 16 Maintain recruitment slots and replacement history. If a qualified participant drops out, recruit a replacement, revise dates, or reduce scope with customer acceptance. Never mark an unperformed task complete to meet a deadline.

## **Compensation**

REQ 17 Maintain a ledger of promised, earned, approved, paid, and disputed amounts with currency and payment reference. Pilot payouts may be executed manually through supported providers; record reconciliation in the platform. Settle valid work within seven business days after review, with review completed within three business days of submission. Define country and payout eligibility before recruiting.

The operator is responsible for service quality, even when an independent tester performs the work. Manual operations must use the same audit trail as future automation.

# **8 Functional QA delivery standard**

## **Test design**

Agree expected behaviour with the customer before execution. Cover successful flows, validation errors, permissions, interrupted operations, empty states, persistence, and relevant device behaviour. Select cases according to product risk; do not apply every example to every application.

For a booking app, an agreed journey might include creating a booking, rejecting an invalid date, recovering from a failed payment, and confirming the booking persists after reopening. AI-assisted products may also need checks for misleading loading states, retry behaviour, and handling unavailable model services.

## **Scenario and finding records**

Every scenario includes an ID, journey, prerequisites, steps, expected outcome, assigned environment, build, and execution status. Status is not run, pass, fail, blocked, or not applicable. Blocked and not run cases count as uncovered and must not inflate pass rates.

Every bug includes a concise title, actual and expected behaviour, reproducible steps, build, environment, evidence, reproducibility, severity, and linked scenario where applicable. A reviewer should reproduce consequential findings when feasible and label findings that remain unverified.

| Severity | Definition | Example |
| :---- | :---- | :---- |
| Critical | Exposure, data loss, or a core service unusable without workaround | One user can view another user’s records |
| High | A key journey fails for a relevant supported environment | Checkout cannot complete |
| Medium | Function is impaired with a practical workaround | A filter resets unexpectedly |
| Low | Limited functional or presentation impact | A nonessential label is truncated |

Severity describes impact. Priority is the customer’s decision about when to fix it. Usability findings use a separate impact assessment and are not automatically classified as technical defects.

## **Retest and release recommendation**

Retests reference the original issue and replacement build, preserve original evidence, and record fixed, still reproducible, or unable to verify. An issue marked fixed by the customer is not automatically verified.

The reviewer may recommend proceed, proceed with known issues, or address blockers first. Each recommendation lists coverage and unresolved risks; no score implies a guarantee. Stop affected testing and escalate if unintended access or destructive behaviour is discovered. This is incident handling, not authorization for security testing.

# **9 Usability and beta delivery standards**

## **Usability studies**

Define the research question, intended audience, screener, task prompts, success criteria, session length, and recording method before recruitment. Write tasks around user goals without naming the control to click. Conduct one pilot session to check instructions and access.

Use fresh participants for first-use questions. Previous testers may join longitudinal studies only when familiarity is intentional and disclosed. Do not use the QA team as a substitute for intended users. Record assisted success separately from independent completion; a participant who receives guidance has not completed the task unaided.

Capture completed, completed with assistance, or not completed for each task, plus observations, quotes, navigation errors, and optional post-task ease rating. Explain recording or timing failures. Store observations separately from the researcher’s interpretation and recommendations.

Report counts with denominators and context, for example three of five participants needed help finding invoices. Do not generalize small qualitative samples into conversion forecasts. Time on task is descriptive unless the study design supports stronger comparisons. If using a standardized questionnaire, use the correct version and scoring procedure; it is not required in the MVP.

## **Beta programmes**

Agree cohort attributes, eligible devices, duration, realistic usage tasks, check-in cadence, and feedback expectations. Provide installation and access instructions for the customer’s chosen distribution channel. Log invitation, enrollment, installation evidence where available, attendance, check-ins, feedback, withdrawal, and replacement independently.

Distinguish self-reported activity, operator-observed activity, and authorized platform data. A checkbox does not prove app use. Replacement does not transfer a departed tester’s elapsed enrollment time to another person. Show actual dates and cohort continuity.

The customer remains responsible for their developer account and submission. Verify current store requirements at booking and before application assistance; requirements depend on platform and account circumstances. Do not hardcode a universal tester count or approval rule into the product.

## **Completion and compensation**

Usability participants earn the agreed session fee for good-faith participation, regardless of success or opinion. Beta compensation reflects valid agreed tasks and participation, not positive reviews or approval. Never require public ratings, favourable feedback, artificial engagement, or store approval as payment conditions.

# **10 Reports and product experience**

## **Final report structure**

Each report contains the objective, accepted scope, tested builds and dates, coverage, participant characteristics in aggregate, executed tasks, important findings, supporting evidence, recommended actions, unresolved blockers, limitations, and retest status. Include an author and reviewer and a versioned delivery date.

Keep functional bugs, usability observations, participant suggestions, and untested assumptions visibly distinct. Link related records without merging their meaning. An observed obstacle is evidence; a suggested redesign is a recommendation to evaluate.

## **Useful summaries**

Show scenarios passed, failed, blocked, and not run against the total in scope. Show usability task outcomes by task with denominators and assistance labels. Show beta enrollment and completion dates with evidence status. Avoid a universal release-readiness percentage that hides severe failures or incomplete coverage.

For repeated release checks, show new findings, previously open issues, verified fixes, and changed coverage. A customer should be able to trace a recommendation to its evidence and the build on which it was observed.

## **Interface requirements**

* Customer home shows active orders, next actions, and upcoming dates.  
* Project pages contain brief and scope, builds and access, activity, coverage, findings, reports, and billing.  
* Tester home shows accepted work, deadlines, compensation status, and clarification requests.  
* Operator home emphasizes overdue actions, blocked work, recruitment gaps, and review queues.  
* Findings support filters for type, severity or impact, journey, environment, build, and status.  
* Evidence uses access-controlled previews; customers must not receive participant identity documents or private payout details.

## **Accessibility and low bandwidth**

Use semantic forms, keyboard navigation, visible focus, clear error messages, and readable contrast. Save task progress and support interrupted uploads. Show file size before evidence upload and permit compressed evidence or structured notes when the agreed study allows it. The customer portal must work on desktop and mobile browsers; no native platform application is required for the MVP.

## **Exports**

Export individual bugs in structured fields and a customer-readable final report. Include consent-approved evidence links with controlled expiry. An export must preserve exclusions, sample sizes, evidence status, and report version. Disable access after revocation or expiry without corrupting the underlying report history.

# **11 Data model and technical requirements**

## **Core entities**

| Entity | Required relationship |
| :---- | :---- |
| Organization and membership | Tenant ownership and role |
| Application environment and build | Product and immutable test target |
| Brief scope quote and order | Versioned agreement and service status |
| Journey scenario and execution | Planned work and actual result |
| Tester profile and device | Eligibility and verified attributes |
| Study task and session | Audience consent and observations |
| Assignment and participation event | Who performed work and when |
| Finding evidence and retest | Traceable result and verification |
| Report and report version | Delivered assessment snapshot |
| Payment payout and adjustment | Separate financial ledgers |
| Consent and audit event | Permission and accountability |

## **Implementation direction**

Use a modular web application with customer, tester, and operator views. A React and TypeScript client, TypeScript API, relational database, private object storage, and background jobs are a suitable starting point given the founder’s experience. Select providers after checking operational cost, regional availability, security requirements, and payout coverage. This is an implementation recommendation rather than a binding vendor choice.

Keep recruitment, orders, evidence review, reporting, and finance as explicit modules. Use managed authentication with tenant-level authorization enforced at every API and download endpoint. Background jobs handle invitations, reminders, upload processing, and report generation with retries and deduplication.

## **Nonfunctional targets**

Support an initial planning load of 20 concurrent engagements and 200 active testers. Target a 95th-percentile response time below two seconds for ordinary dashboard operations, excluding media transfer and asynchronous exports. Target 99.5 percent monthly application availability after public launch. These are engineering objectives, not initial contractual guarantees.

Keep daily encrypted backups; target recovery within 24 hours and no more than 24 hours of transactional data loss in the pilot. Test a restore before accepting paid projects. Preserve original evidence or explicitly label transcoded versions.

## **AI assistance and integrations**

AI may suggest test cases, improve report wording, group potential duplicates, and summarize evidence. Require reviewer approval for findings, severity, report conclusions, and payout decisions. No automatic release verdict. Confidential customer material must not enter an external model without agreed data handling and customer permission.

MVP imports accept URLs, manually entered builds, and attachments. GitHub or issue-tracker export, CI triggers, automated regression execution, and customer-facing MCP access are later integrations subject to demand.

# **12 Access privacy and operational safeguards**

## **Customer and participant access**

Restrict every record and object to its tenant, authorized project members, and assigned delivery staff. Testers receive only the credentials and product context required for their assignments. Use expiring signed evidence URLs; never make recordings public by default. Audit access grants, scope acceptance, exports, evidence deletion, and payment changes.

Keep secrets encrypted and separate from ordinary notes, logs, and reports. Prefer short-lived test accounts with synthetic data. Revoke assignment access when work ends. Uploaded builds and evidence require file-type validation, size limits, and malware scanning before broad access or download.

## **Consent and data minimization**

Obtain recording consent before a session begins and store its version and timestamp. Explain who can view recordings, their purpose, and planned retention. Provide instructions for avoiding personal notifications or unrelated screen content in recordings. Allow reporting and removal of accidental sensitive content.

Proposed defaults are 90 days for raw recordings, 12 months for reports and ordinary project evidence, and retention of financial records according to applicable obligations. Customers must see these rules before purchase. Confirm enforceable retention, data-processing terms, privacy notices, cross-border arrangements, and lawful payout operations with appropriate advisers before launch. The product must support configurable retention, deletion requests, and documented exceptions.

## **Service integrity**

* Verify customer authorization to test the application and agree the permitted environment and actions.  
* Use sandbox payments and synthetic identities; real-money flows require explicit separate scope and safeguards.  
* Exclude projects requiring access to production medical, financial, or similarly sensitive records from the pilot.  
* Avoid children’s research in the MVP; specialist consent and safeguarding would require a separate operating model.  
* Handle duplicate accounts, copied evidence, false device claims, and attendance disputes through documented review and appeal.  
* Never promise store acceptance or sell ratings, favourable reviews, or fabricated usage.

## **Incident handling**

Provide a clear reporting channel. Record suspected exposure, revoke affected access, preserve necessary evidence securely, and notify responsible contacts under the applicable incident process. Pause affected work until safe access is restored. Contractual obligations and notification deadlines must be confirmed for the business’s actual operating jurisdictions.

# **13 Roadmap success metrics and acceptance**

## **Delivery phases**

Phase A validates the service through interviews and five paid pilots. Use existing scheduling and meeting tools with secure project records. Complete qualification, scope templates, consent, compensation rules, and a sample report before recruiting customers.

Phase B builds the managed MVP: tenant access, briefs, quotes, orders, readiness, manual matching, assignments, evidence, review, reports, retests, and ledgers. Launch web and Android delivery first; enable iOS after a successful internal end-to-end pilot. Target six to eight weeks only as a planning assumption after requirements and staffing are confirmed.

Phase C adds proven repeat needs: saved regression suites, release credits, issue-tracker integration, improved participant screening, and more device coverage. Phase D may add self-service matching, automated tests, CI triggers, additional languages, and regional panels. Do not build an open marketplace before recruitment quality and dispute handling work reliably.

## **Metrics**

| Metric | Definition and proposed pilot threshold |
| :---- | :---- |
| Repeat purchase | At least two follow-on paid bookings within 60 days across five pilots |
| Contribution | Revenue less direct delivery costs, including founder time; positive on four of five pilots |
| On-time delivery | At least 90 percent by agreed adjusted date; separately disclose original-date performance |
| Evidence completeness | At least 95 percent of delivered findings meet the required fields |
| Valid QA findings | At least 90 percent of delivered bugs confirmed or explicitly qualified with evidence |
| Compensation timeliness | At least 95 percent settled within the stated payment window |

Track quote conversion, acquisition source, recruitment cost, dropout rate, review time, refunds, and customer-reported usefulness. Count actionable completed engagements rather than raw submitted bugs as the primary product outcome. Revisit thresholds after the pilot rather than presenting them as established benchmarks.

## **MVP release acceptance**

Demonstrate a complete paid order from brief to report and retest. Verify cross-tenant isolation for records and evidence. Demonstrate idempotent payment handling, restricted credentials, consent capture, interrupted upload recovery, replacement history, reviewed findings, report export, payout reconciliation, and a backup restore. Block launch if any unauthorized access, untraceable compensation, or lost evidence remains unresolved.

# **14 Risks decisions and discovery references**

## **Main risks and responses**

| Risk | Required response |
| :---- | :---- |
| Buyers want only free or very cheap testers | Qualify for launch commitment or existing revenue; validate paid repeat work |
| Service labour overwhelms margin | Bound journeys and environments; cost reviewer time and replacement work |
| Generic testers distort usability findings | Separate QA qualification from intended-user screening |
| Recruitment delays undermine promises | Confirm feasibility before dates; disclose gaps and alternatives |
| AI tools reduce demand for basic checks | Test whether customers still value independent evidence and observed behaviour |
| Unreliable or fabricated evidence | Qualification, reviewer sampling, provenance, appeals, and manual verification |
| Scope expands after every build | Versioned scope, explicit change orders, bounded retests |
| Sensitive data or insecure app behaviour | Staging data, restricted access, stop conditions, incident process |

## **Decisions before public launch**

Confirm the operating business and payment jurisdictions, supported payout countries, first customer segment, staffed hours, initial device pool, participant sourcing method, retention terms, and pilot pricing. Decide whether the first repeat offer is monthly release credits or individual repeat orders after observing usage. These decisions do not block a manually coordinated, appropriately scoped pilot.

## **Discovery references**

The following are qualitative discovery inputs from the preceding research. Individual posts are self-reported and do not validate spending intent. Earlier discussions remain useful interview prompts but should not be treated as current market statistics.

1. Android recruitment request for Arthena Job Manager, September 2026

https://www.reddit.com/r/TestersCommunity/comments/1wcjl06/need_4_android_testers_happy_to_test_your_app_in/

2. SessionQ request for feedback on confusing or broken behaviour, September 2026

https://www.reddit.com/r/TestersCommunity/comments/1wp6n44/need_android_testers_for_scheduling_app/

3. Android tester request explicitly reporting no testing budget, October 2026

https://www.reddit.com/r/AndroidClosedTesting/comments/1xfwthv/looking_for_beta_testers_for_my_android_app/

4. Discussion about affordable user-testing services

https://www.reddit.com/r/UXDesign/comments/1oz766c/does_anyone_know_if_there_is_a_user_testing/

5. Discussion about B2B recruitment cost and suspected fraudulent applicants

https://www.reddit.com/r/UXResearch/comments/1miqqbn/how_cheaply_recruit_50_validated_b2b_users_for/

6. Existing combined-service competitor

https://betatesting.com/services

Check current developer distribution rules directly with Google and Apple whenever configuring a beta engagement. Store requirements are dependencies to verify, not the foundation of the business model.