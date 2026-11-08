# Implementation progress

Started November 8, 2026 (Europe/Sofia).

- Milestone 1: scope and agent instructions prepared; Git identity and remote connection pending.
- Milestones 2–13: pending.
- Milestone 14: reserved for November 9; user continuation required.
- Milestone 15: reserved for November 10; user continuation required.

GitHub and Supabase connections are not yet confirmed. No cloud acceptance tests have run.

Milestone 1: pushed `59b3e0d` to https://github.com/petarbinev/issueflow.
Milestone 2: eight-page Vite scaffold, shared responsive shell, environment handling, CI, and validation checks prepared. Lint, 2 tests, and all eight production HTML outputs passed.
Supabase project: `ynpgrmkpfdlikckuravp` (IssueFlow, Frankfurt), created with the user's organization confirmation.

Milestone 3: seven-table schema applied to the empty hosted project with RLS enabled on all tables. Local embedded PostgreSQL rebuild and constraint checks passed (3 tests total). Local migration filename matches hosted migration version `20261108075544`. ER diagram added.

Milestone 4: hosted RLS, column grants, assignee restrictions, provisioning, activity triggers and serialized last-admin protection applied. Four local tests pass, including direct SQL authorization attempts under the authenticated/anon roles. These simulate auth/storage schemas; hosted API tests remain required.

Milestone 5: registration/login forms, confirmation guidance, sign-out, session guards, role-aware navigation, safe rendering and error handling implemented. Lint, four local tests and production build pass; hosted auth journey to be checked in milestone 12.

Milestone 6: projects browser and dashboard use Supabase queries for status counts, assigned issues, and recent activity. Empty states implemented; lint and production build pass. Demo data and live journey checks remain pending.

Milestone 7: create/edit/detail/delete issue workflow implemented, including permission-aware actions, validated fields, assignment and unsaved-change warning. Lint and production build pass. Storage prevents deleting issues that still contain files.

Milestone 8: title search, combined project/status/priority/assignee filters, stable server pagination, URL persistence and reset controls implemented. Lint and production build pass.

Milestone 9: comments create/edit/delete, reporter/assignee status controls and database-written activity history implemented. Lint and build pass. Fictional demo accounts, two projects and twelve sample issues provisioned in the dedicated project for live testing; no real user data used.

Milestone 10: private bucket migration applied, local filename matches remote `20261108080623`; attachment upload/download/delete and partial-failure cleanup implemented. Four local tests and production build pass. Live file round trip is scheduled in milestone 12.

Milestone 11: admin project create/edit/archive/restore, transactional member/admin role management, and moderation navigation implemented. Member access blocked by both page guard and database. Lint/build pass; live verification underway.

Milestone 12: live API tests passed for three demo logins, guest denial, role/project restrictions, reporter/assignee column permissions, comment ownership and private file byte integrity/cleanup. Browser verified member login, dashboard, projects/search, issue create/edit, comment persistence, sign-out, admin access and member denial. Saved dashboard screenshot. Browser viewport override was clamped to 767px; phone-size QA remains pending and is explicitly recorded in the evidence file.

Security-advisor findings about inherited function grants were fixed in migration `20261108081410`; tests now simulate Supabase default grants and assert internal trigger functions are not client-executable. Hosted API tests passed again after hardening. Remaining advisor notices are documented in docs/security.md.
