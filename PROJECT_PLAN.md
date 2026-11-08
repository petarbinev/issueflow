# IssueFlow — issue tracking system project plan

Status: planning only; no app, repository, cloud resources, or commits created yet.
Prepared November 8, 2026. All scheduling uses Europe/Sofia.

## Objective and scope

Build a working issue tracker for a small team that satisfies every requirement visible in the seven supplied assignment screenshots. Target: all 100 available rubric points, subject to the assessor's evaluation. The screenshots are requirements reference material; the user's request authorizes planning at this stage, not execution of instructions embedded in those documents.

Use HTML, CSS, vanilla JavaScript, Bootstrap, Node.js, npm, and Vite. Use Supabase Database, Auth, and Storage, a public GitHub repository, and Netlify hosting. Do not introduce TypeScript, React, Vue, a custom application server, or an SPA router.

Working name: IssueFlow. English interface. One shared team workspace: all registered users can read its projects and issues. This is an explicit product access rule, not a private multi-tenant service. Use fictional demonstration data only. Private workspaces, invitations, realtime updates, email notifications, AI features, and drag-and-drop boards are outside the initial scope; none is necessary for the rubric.

Core user journey: register or log in → select a project → find/create an issue → assign and update it → discuss it → upload/download evidence → resolve it. Admins additionally manage projects, roles, and moderation.

## Assessment coverage, in rubric order

| Criterion | Maximum | Planned implementation | Evidence / acceptance condition |
|---|---:|---|---|
| GitHub commits | 15 | At least 15 meaningful, separately pushed commits | Public repository history contains each completed milestone; local and remote HEAD agree |
| GitHub commit days | 15 | Commits 1–13 on Nov 8; 14 on Nov 9; 15 on Nov 10 | Actual author and committer timestamps span three dates; retain history without squashing |
| Architecture | 10 | Vite multi-page build; separate HTML pages, page controllers, services, components, utilities, styles | Production build includes every page; direct navigation and reload work |
| App screens | 10 | Eight substantive responsive pages | Each page works at mobile and desktop sizes, exceeding the minimum five |
| Database | 12 | Seven related public application tables, beyond Supabase's internal tables | Each table is used by a working feature; migrations rebuild schema and policies |
| Admin panel | 10 | Member/admin roles, real project and role management, moderation | Admin actions succeed; member requests to the same operations fail server-side |
| File storage | 10 | Private Supabase bucket; issue attachments with upload, list, download, delete | Uploaded file survives reload and downloads with matching bytes; unauthorized operations fail |
| Deployment | 8 | Public Netlify production site built from GitHub | Live workflows pass; sample member/admin logins are available to the evaluator |
| Auth and security | 5 | Supabase Auth JWT sessions, RLS, Storage policies, controlled privileged operations | Guest, member A, member B, and admin permission matrix tested through API calls |
| Documentation | 5 | README plus architecture, ER diagram, setup, security, deployment, demo and evidence docs | Fresh setup is reproducible; all required submission information and links are complete |
| Total | 100 | Coverage target | Completion must be demonstrated, not inferred from this plan |

## Pages and interface

| HTML file | Purpose and behavior |
|---|---|
| `index.html` | Authenticated dashboard: counts by status, assigned-to-me issues, recent activity, create-issue action |
| `login.html` | Email/password login, validation, error handling, registration link |
| `register.html` | Registration, display name, password confirmation, confirmation-email guidance when enabled |
| `projects.html` | Project cards/list, description, issue totals, archived indicator, links to filtered issues |
| `issues.html` | Search, project/status/priority/assignee filters, pagination, useful empty state; filters preserved in URL |
| `issue.html` | Issue details, status, assignment, comments, attachments, activity, edit/delete actions |
| `issue-form.html` | Dedicated create/edit page using an optional issue ID; validation, save/cancel, unsaved-change warning |
| `admin.html` | Project creation/edit/archive, member/admin roles, moderation, management feedback |

Use ordinary links and real HTML navigation. A confirmation dialog is acceptable for deletion but is not counted as an app page. Register every HTML entry in the Vite build using the syntax supported by the installed version. Verify Netlify's canonicalized URLs still serve the correct pages.

Visual direction: compact navigation, neutral surfaces, blue primary actions, readable spacing, Bootstrap Icons, visible keyboard focus, labeled controls, status badges with text and icons, and restrained transitions respecting reduced-motion preferences. Use responsive issue cards on small screens and a table on wider screens. Include loading, empty, error, success, forbidden, and not-found states. Check 375 px, 768 px, and 1440 px widths, keyboard navigation, contrast, and touch targets.

## Architecture and proposed repository layout

Browser HTML/JS → Supabase JavaScript client → Supabase REST/Data API, Auth API, and Storage API. Netlify serves the Vite output; Supabase enforces data access. The JavaScript client uses the REST API for table access. Database RPCs may handle narrow permission-sensitive actions.

```text
/
  index.html, login.html, register.html, projects.html
  issues.html, issue.html, issue-form.html, admin.html
  src/
    pages/              # One JavaScript entry/controller per page
    components/         # Navbar, alerts, issue cards, pagination, confirm dialog
    services/           # Auth, projects, issues, comments, attachments, admin
    lib/                # Supabase client, environment validation, session guard
    utils/              # Validation, formatting, safe DOM helpers, URL filters
    styles/             # Bootstrap imports, tokens, shared and page styles
  public/               # Static icons and app assets
  supabase/
    config.toml
    migrations/         # Versioned schema, policies, functions, storage configuration
    seed.sql            # Non-secret, fictional data for local testing
    tests/              # Database and authorization tests
  scripts/              # Safe demo provisioning / verification helpers
  tests/                # Focused unit tests and browser workflows
  docs/
    architecture.md     # Includes Mermaid ER diagram
    security.md
    deployment.md
    demo-guide.md
    assessment-evidence.md
    progress.md         # Milestone SHAs, dates, validation, pause state
  .github/
    copilot-instructions.md
    workflows/ci.yml
  AGENTS.md
  .env.example
  .gitignore
  .nvmrc
  package.json
  package-lock.json
  vite.config.js
  netlify.toml
  README.md
  PROJECT_PLAN.md
```

Keep page controllers focused on orchestration; services own Supabase calls; components own reusable rendering. Render user content as text, not untrusted HTML. Pin a supported Node version and commit the lockfile. Choose exact package versions during setup and verify compatibility.

The required `.github/copilot-instructions.md` will document stack restrictions, architecture, migrations, RLS, validation, and workflow. `AGENTS.md` will mirror the essential project rules and the user-requested commit pause gate so future coding sessions see it before working.

## Database model

| Table | Main fields and relationships | Feature |
|---|---|---|
| `profiles` | `id` → `auth.users.id`, display name, timestamps | Creator/assignee names, admin user list; keep private email out of shared profiles |
| `user_roles` | `user_id` → profiles, role constrained to member/admin; one row per user | Server-side role checks and admin role management |
| `projects` | UUID, unique short key, name, description, archived flag, creator → profiles | Project browsing and admin management |
| `issues` | UUID, generated issue number, project → projects, title, description, status, priority, reporter/assignee → profiles, timestamps | Main issue CRUD and filtering |
| `comments` | UUID, issue → issues, author → profiles, body, timestamps | Issue discussion |
| `attachments` | UUID, issue → issues, uploader → profiles, unique storage path, original name, MIME type, byte size, timestamps | File listing and download metadata |
| `issue_activity` | UUID, issue → issues, actor → profiles, action, limited change details, timestamp | Readable issue history; written by database triggers |

Relationships: auth user → profile → role; project → issues; issue → comments, attachments, and activity; profiles link to reporters, assignees, authors, and uploaders. Document these relationships with a Mermaid ER diagram in the architecture documentation.

Statuses: Open, In Progress, Resolved, Closed. Priorities: Low, Medium, High, Critical. Reopening returns an issue to Open. Use database checks for allowed values and reasonable title/body lengths, primary/foreign keys, and UTC timestamp defaults. Index foreign keys and common project/status, assignee/status, and created-at queries. Use stable ordering and server-side pagination. Create indexes for actual access patterns rather than speculative optimization.

Archive projects instead of deleting their issue histories. Prevent issue creation in archived projects server-side. Block hard deletion of an issue until its Storage objects are successfully removed, then cascade its dependent database rows. Failed cleanup must remain visible and retryable.

## Authentication, authorization, and storage

| Operation | Guest | Member | Admin |
|---|---|---|---|
| Register/login | Yes | Yes | Yes |
| Read shared team projects/issues/comments/files | No | Yes | Yes |
| Create issue | No | Yes, as self in active project | Yes |
| Edit issue fields / delete issue | No | Own reported issues | Any issue |
| Change issue status | No | Own reported or assigned issues | Any issue |
| Add comment or attachment | No | Yes, as self on accessible issue | Yes |
| Edit/delete comment; remove attachment | No | Own only | Any |
| Update profile display name | No | Own only | Own only |
| Manage projects and roles | No | No | Yes |
| Rewrite activity records | No | No | No direct client writes |

Implementation rules:

- Use Supabase email/password Auth for register/login/logout and its session handling. Guard authenticated pages for usability; authorization must also hold when the UI is bypassed.
- Enable RLS on every exposed application table and on bucket operations through `storage.objects`. Apply both old-row checks and new-row checks where relevant; never trust submitted reporter/uploader/author IDs.
- New-user provisioning creates a profile and member role server-side. Ignore role values supplied in sign-up metadata. Bootstrap the first admin through a trusted setup step, not a browser secret.
- Use a protected role-check function to avoid recursive `user_roles` policies. Give privileged functions a fixed search path, narrow execute grants, and explicit caller checks.
- Protect immutable identity fields and distinguish assignee status changes from full issue edits using column privileges, guarded RPCs, or database triggers. RLS alone does not enforce which individual columns may change.
- Admin role changes run through a transactional RPC; prevent removal of the last admin, including concurrent requests. Preserve an evaluator-accessible admin throughout review.
- Activity triggers record trustworthy actors and relevant status/assignment changes. Avoid publishing secrets or raw authentication data in activity JSON.
- The frontend gets only `VITE_SUPABASE_URL` and the project's public publishable key (or legacy anon key). Never place a service-role key, database password, or personal token in client code, a `VITE_*` variable, or Git.

Storage design: a private `issue-attachments` bucket, randomized paths organized by issue and uploader, and attachment metadata in the database. Allow PNG, JPEG, PDF, and plain-text files up to 5 MB; enforce bucket size/type restrictions and validate in the UI. Re-check issue access and uploader identity in Storage policies. Downloads require an authenticated request or a short-lived signed URL issued after authorization. Offer explicit download actions, not only image previews. Force risky file types to download and render filenames safely.

Treat database metadata and Storage writes as separate operations with compensation: remove an uploaded object if metadata insertion fails; keep enough state to retry a failed delete. Do not directly delete Storage database rows as a substitute for deleting objects through the Storage API.

## Migration and environment workflow

1. Prefer a new, dedicated Supabase project for this capstone. If using an existing project, inspect and pull its migration baseline before changing it; never overwrite unrelated data.
2. Author every schema, RLS, trigger, function, and bucket configuration change as a local migration under `supabase/migrations/`.
3. Rebuild a local Supabase database from migrations and seed data; verify behavior before applying to the hosted project. Local Supabase normally needs a container runtime; check availability at implementation time. If unavailable, use an explicitly dedicated disposable test project for destructive reset tests.
4. Apply reviewed migrations to the selected remote project, compare local/remote migration lists, and commit all migration SQL. Reconcile any dashboard-made schema changes into migrations before continuing.
5. Keep credentials and `.env.local` untracked. Commit `.env.example` with placeholders. Ignore `node_modules`, `dist`, `.netlify`, test artifacts, and Supabase temporary state.
6. Seed two projects and roughly twelve varied issues, comments, and sample attachments. Use verified demo member/admin accounts and a second member for permission tests. Auth-account provisioning uses a secure local environment and is documented separately from public seed SQL.

## Hosting and delivery

- Public GitHub repository with a simple `main` workflow. Commit and push each validated milestone, retaining individual commits. Optional PRs must not squash away the required history.
- Netlify Git-based continuous deployment; build command `npm run build`, publish directory `dist`. Set the same supported Node version as local development.
- Configure the Supabase public frontend variables in Netlify's build environment. Record only variable names in committed configuration.
- Do not add an SPA catch-all rewrite. Test direct page visits, refreshes, query strings, static assets, and actual 404s on the deployed multi-page app.
- Configure Supabase Auth site/redirect URLs for localhost and the production URL; handle confirmation returns and expired sessions. Use pre-confirmed demo accounts so evaluation does not depend on delivery of new email.
- Verify the Netlify site is publicly reachable in a signed-out browser. Netlify account access is separate from app user authentication.
- Supply both member and app-admin demo credentials in the agreed evaluator delivery location. These are dedicated application accounts with fictional data, never GitHub/Netlify/Supabase owner credentials. Document any reset procedure.

## Fifteen-commit implementation schedule

Each row is a real unit of completed work, not an empty checkpoint. Commit only after its relevant checks pass, push it, verify the remote SHA, and update the progress log with the result. The plan assumes implementation begins on Nov 8; if it does not, agree on three actual working dates rather than changing commit timestamps.

| # | Date (Europe/Sofia) | Proposed commit message | Scope and milestone check |
|---:|---|---|---|
| 1 | Nov 8, 2026 | `docs: define project scope and development rules` | This plan, README outline, required Copilot instructions, AGENTS rules, progress log and pause gate |
| 2 | Nov 8, 2026 | `chore: scaffold Vite multi-page app and checks` | Vanilla JS, Bootstrap/icons, eight HTML entries, env example, ignore rules, lint/build CI; every page builds |
| 3 | Nov 8, 2026 | `feat: add database schema and reproducible migrations` | Seven tables, constraints, indexes, local seed strategy, initial ER diagram; clean migration rebuild passes |
| 4 | Nov 8, 2026 | `feat: enforce roles and database access policies` | RLS, provisioning, role helpers, controlled mutation RPCs, activity triggers, foundational API security tests |
| 5 | Nov 8, 2026 | `feat: implement authentication and shared navigation` | Register/login/logout, sessions, guards, responsive shell, safe errors; auth round trip works |
| 6 | Nov 8, 2026 | `feat: add project browser and dashboard` | Real project list, database-backed counters and assigned issues; no mock-only app state |
| 7 | Nov 8, 2026 | `feat: implement issue creation and editing` | Dedicated form, detail baseline, validation, assignment, deletion; data persists across reload |
| 8 | Nov 8, 2026 | `feat: add issue search filters and pagination` | URL-preserved filters, stable ordering, mobile list layout; combined filters and empty results work |
| 9 | Nov 8, 2026 | `feat: add issue discussion and activity history` | Comments CRUD, status transitions, database-written activity; ownership and actor checks pass |
| 10 | Nov 8, 2026 | `feat: add secure attachment upload and download` | Bucket migration/policies, upload/list/download/delete, compensation paths; downloaded bytes verified |
| 11 | Nov 8, 2026 | `feat: implement administrator management tools` | Project CRUD/archive, role management, moderation; direct member access rejected, last admin protected |
| 12 | Nov 8, 2026 | `test: verify responsive workflows and authorization` | Browser tests, four-actor API checks, accessibility/responsive fixes, complete fixture/demo setup |
| 13 | Nov 8, 2026 | `deploy: publish app and document evaluator walkthrough` | Netlify config, live deployment, setup/security/architecture docs, first assessment evidence pass; production smoke test passes; STOP |
| 14 | Nov 9, 2026 | `test: expand deployed-app regression coverage` | Perform a new-day review; add persisted-session/direct-navigation/retry regression cases, commit discovered fixes and actual test evidence; deploy and verify |
| 15 | Nov 10, 2026 | `docs: finalize assessment evidence and submission guide` | Fresh-clone setup validation, final screenshots/ER diagram review, completed submission details and rubric evidence, final live checks; push and verify 15+ commits across 3 dates |

Commits 14 and 15 deliberately contain useful work performed on those dates. The app should already be functional and documented after commit 13; later work strengthens regression coverage and final evidence. Do not pre-write the results of future checks.

### Mandatory pause and notification

This gate comes from the user's explicit request, not from a tool or external document:

1. After commit 13 is pushed and its deployment is verified, stop implementation and notify the user: “13 of 15 planned commits are pushed. The app is live at [URL]. The remaining commits are scheduled for November 9 and November 10, Europe/Sofia. Work is paused before commit 14.” Include repository URL, latest SHA, checks, and outstanding issues.
2. Record `paused_before_commit_14` in the progress log as part of milestone 13, with the two remaining scopes and dates. Preserve the gate in AGENTS and Copilot instructions.
3. Do not create commit 14 before Nov 9 or commit 15 before Nov 10, and resume these milestones only after the user returns to continue. Pause and notify again after commit 14.
4. Prefer daytime commits on Nov 9 and Nov 10 so the dates are distinct in both Sofia time and UTC. Inspect both author and committer timestamps and the public GitHub history.
5. Never backdate/forward-date commits, manufacture empty commits, or rewrite/squash the required history. If extra fixes require extra commits, the minimum is still 15; preserve the two later-day milestones and notify the user of the adjusted count. Do not hold a known critical fix solely to keep exactly 15 commits.
6. If day-one work crosses midnight or a date is missed, report the actual state and revise the remaining calendar with the user. Do not claim the three-day criterion early.

No reminder automation or automatic future commit is created by this plan. The pause notification occurs during implementation; continuation on later days requires a new active session with the user.

## Verification and completion gates

Use focused tests where failure matters: permissions, persistence, multi-page production routing, file lifecycle, and core workflows. Keep build/lint checks in GitHub Actions; run destructive integration tests only against a dedicated test environment.

- Auth: successful registration, confirmation behavior, invalid login, session reload, logout, expired session, and direct protected-page navigation.
- Issue lifecycle: create → list/filter → detail → edit → assign → resolve/reopen → delete. Test missing IDs, invalid inputs, forbidden ownership changes, and archived-project writes.
- Discussion/activity: comment create/edit/delete, non-author denial, database-generated actors and activity, no client history forgery.
- Storage: upload/download equality, metadata persistence, invalid type/oversize rejection, guest denial, non-owner delete denial, and upload/delete partial-failure recovery.
- Admin: member cannot call project/role management directly, cannot self-promote through profile/signup/role writes, and cannot remove the final admin. Test admin success paths too.
- UI: all eight pages at three widths, keyboard operation, visible focus, error recovery, empty lists, double-submit protection, readable status indicators.
- Deployment: each HTML page reachable directly; production Auth returns work; build includes all pages; no privileged secrets in published output; demo logins work in a clean browser.
- Reproducibility: fresh checkout → dependency installation → environment setup → migration/seed → run/build; remote migration history matches local SQL.
- Submission: public repo and live URL, author name and email, evaluator credentials, feature/role description, technology/architecture explanation, ER diagram, folder guide, setup/deployment instructions, evidence for every rubric row, and verified commit count/dates.

Record actual results in `docs/assessment-evidence.md`, linking relevant files, tests, screenshots, and public commits. Do not mark a criterion complete solely because its code exists.

## Inputs to resolve when implementation begins

The plan does not require credentials. During setup, inspect the available authenticated integrations/CLIs first and obtain only missing choices: GitHub owner/repository name, target Netlify team/site, dedicated Supabase project, and author name/email for submission. Use interactive login or secure environment configuration for secrets, not chat or committed files. Working defaults are the name IssueFlow, this workspace, a new public repository, and dedicated capstone cloud resources.

Check installed Node/npm, Git/GitHub access, Supabase CLI, and container runtime before selecting exact versions. Netlify tools are available in this session; GitHub and Supabase account access has not been verified. Existing accounts do not by themselves establish an active connection.

## Technical references checked for this plan

Vite supports production builds with multiple HTML entry points; follow the installed version's configuration API: [Vite multi-page build documentation](https://vite.dev/guide/build#multi-page-app).

The planned `npm run build` / `dist` hosting configuration follows [Netlify's Vite guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/).

Database authorization will follow [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), and private object authorization will follow [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control).

Versioned database changes and local/remote history reconciliation will follow [Supabase migration deployment guidance](https://supabase.com/docs/guides/deployment/database-migrations).
