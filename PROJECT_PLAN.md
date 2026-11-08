# IssueFlow implementation plan

IssueFlow is a small-team issue tracker for the Software Technologies with AI capstone. The supplied assignment screenshots define the assessment requirements. This plan reflects the approved private-evaluation setup.

## Product and architecture

Use HTML, CSS, vanilla JavaScript, Bootstrap, Node.js, npm and Vite. Keep eight separate HTML pages: dashboard, login, registration, projects, issue list, issue detail, issue form and administration. No TypeScript, React, Vue or SPA router.

Netlify serves the static Vite build from the public GitHub repository. Supabase provides Auth, PostgreSQL/REST and private file Storage. Controllers, services, shared components, utilities and styles live in separate modules.

The site is publicly reachable but has no published login credentials. New users register and confirm email where required, then wait for administrator approval. Approved private member/admin accounts are supplied directly to SoftUni evaluators.

## Assessment coverage

| Criterion | Maximum | Implementation / evidence |
|---|---:|---|
| GitHub commits | 15 | At least 15 meaningful individually pushed commits |
| Commit days | 15 | Actual commits on November 8, 9 and 10, 2026 |
| Architecture | 10 | Vite build with eight HTML entries and modular source |
| Screens | 10 | Eight responsive screens; phone-size verification remains a scheduled check |
| Database | 12 | Seven public application tables with relationships, constraints and indexes |
| Admin panel | 10 | Project management, workspace approval/suspension, roles and moderation |
| File storage | 10 | Private issue-file upload, explicit download and delete |
| Deployment | 8 | Publicly reachable Netlify app connected to GitHub |
| Auth/security | 5 | JWT sessions, approved membership, RLS, ownership and role checks |
| Documentation | 5 | README, architecture/ER diagram, setup, evaluator guide and evidence |
| Total | 100 | Coverage target; final grading belongs to the assessor |

## Database and permissions

Application tables: profiles, user_roles, projects, issues, comments, attachments and issue_activity. Roles are member/admin; user_roles.approved defaults to false. A private historical-identity registry is not exposed to API roles.

All workspace table/file access requires an approved, unbanned identity with a valid Auth session. Pending users can retrieve only their own approval status. Admin RPCs approve/suspend members and manage roles, protect the last effective admin and serialize access changes. Safe assignment lists include only active approved members.

Every approved member can assign, unassign or reassign any issue to an active approved teammate. Members manage their reported issues, update assigned issue status and manage their own comments/files. Admins manage all app content. Column grants protect immutable identities; triggers write activity. All user content is safely escaped.

The file bucket is private, limits individual files to 5 MB and permits PNG/JPEG/PDF/plain text. Storage and metadata failures require compensation/retry. There are no promised comprehensive per-user quotas or malware scanning.

## Credentials and setup

No working usernames/passwords or account seeds are published. Business-data seeds require an approved admin and never create Auth accounts. The first administrator is bootstrapped through a trusted owner operation documented in docs/deployment.md. Private settings stay in ignored local configuration.

Old published passwords were invalidated. Applied migrations and commit history remain as the audit trail; historical identity references are not current login credentials.

## Delivery checkpoints

The initial thirteen milestones implemented scope/instructions, Vite scaffolding, schema, authorization, authentication, dashboard/projects, issue CRUD, search, discussion/activity, files, admin tools, validation and deployment.

November 8 maintenance secured exposed accounts, introduced private credentials and approved workspace access, and then renamed/rotated the private admin and removed retired Auth accounts. Sample records were initially transferred to the approved member; a subsequent workflow review replaced the generic samples with realistic cross-user scenarios and added direct assignment controls and a neutral session-loading header.

After the current update, pause before the two reserved milestones:

1. **November 9, 2026, Europe/Sofia:** regression review, real phone/device checks, persisted sessions/direct navigation/retry cases and observed fixes (normally actual commit 19).
2. **November 10, 2026, Europe/Sofia:** fresh-checkout setup, final submission/evidence audit and final live checks (normally actual commit 20).

Keep actual timestamps, preserve meaningful history, and resume only when the user returns on the appropriate date. Additional necessary fixes may raise the total above the minimum. Never use empty commits, backdating or squashing to manufacture assessment evidence.

## Verification

Run lint, isolated PostgreSQL/validation tests and the eight-page production build. Hosted tests use privately configured member/admin accounts to check approval, role changes, ownership and file integrity, restoring temporary state. Browser checks cover private login, pending access, admin approval and active assignees.

Final outstanding checks are tracked in docs/assessment-evidence.md: full new-user email delivery, full local Supabase reset/fresh bootstrap, and phone-width/device review. Do not label unrun checks as passed.
