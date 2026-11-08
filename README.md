# IssueFlow

IssueFlow is a small-team issue tracker built for the SoftUni **Software Technologies with AI** capstone. Track issues across projects, assign work, discuss updates, upload evidence, and follow progress from Open to Closed.

- **Frontend:** HTML, CSS, vanilla JavaScript, Bootstrap and Bootstrap Icons, Vite.
- **Backend:** Supabase PostgreSQL, Auth, REST API and private Storage.
- **Delivery:** public GitHub repository and Git-based Netlify deployment.

## Run locally

Use Node 24. Run `npm ci`, copy `.env.example` to `.env.local`, enter your Supabase URL and public publishable key, then run `npm run dev`. The terminal prints the local app URL. Run `npm run check` for lint, local tests and the production build.

See [deployment and database setup](docs/deployment.md) for migrations, local Supabase, and hosting configuration.

## Users and features

All registered users share one team workspace. Members create and manage their reported issues, update issues assigned to them, and manage their own comments/files. Admins manage projects and roles and moderate team content. Database policies enforce the same rules when the UI is bypassed.

Eight separate screens cover the dashboard, login, registration, projects, issue search, issue details, create/edit, and administration. Search supports combined filters and server pagination. Files support explicit upload/download/delete through a private bucket.

## Evaluation

Repository: https://github.com/petarbinev/issueflow

Live app: https://issueflow-petarbinev.netlify.app

Dedicated public demo logins are documented in the [evaluator guide](docs/demo-guide.md). All use `IssueFlowDemo!2026`: `member@issueflow.example`, `reviewer@issueflow.example`, and `admin@issueflow.example`. Use fictional data only.

Author: Petar Binev (`petarbinev`); public commit contact: `petarbinev@users.noreply.github.com`.

## Project guide

| Path | Purpose |
|---|---|
| Root HTML files | Eight independent Vite page entry points |
| `src/pages` | Page controllers |
| `src/components` | Shared shell, issue rendering, forms, discussion and files |
| `src/services` | Supabase data and business operations |
| `src/lib` | Supabase configuration, sessions and page lifecycle |
| `src/utils`, `src/styles` | Validation, safe rendering, formatting and responsive styling |
| `supabase/migrations` | Versioned schema, RLS, functions, private bucket and hardening |
| `supabase/seed.sql` | Dedicated fictional evaluation accounts and data |
| `tests` | Embedded PostgreSQL and validation tests |
| `scripts/verify-hosted.mjs` | Live auth/permissions/file lifecycle checks against the dedicated demo project |
| `.github` | Required AI instructions and CI workflow |

Read the [architecture and ER diagram](docs/architecture.md), [security model](docs/security.md), [assessment evidence](docs/assessment-evidence.md), and [project plan](PROJECT_PLAN.md).

The commit schedule reserves meaningful work for November 9 and 10, 2026. Implementation must pause after milestone 13 and again after milestone 14. The three-day criterion is incomplete until those later commits actually exist.
