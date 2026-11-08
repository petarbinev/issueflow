# IssueFlow

IssueFlow is a small-team issue tracker built for the SoftUni **Software Technologies with AI** capstone. Track issues across projects, assign work, discuss updates, upload evidence, and follow progress from Open to Closed.

- **Frontend:** HTML, CSS, vanilla JavaScript, Bootstrap and Bootstrap Icons, Vite.
- **Backend:** Supabase PostgreSQL, Auth, REST API and private Storage.
- **Delivery:** public GitHub repository and Git-based Netlify deployment.

## Run locally

Use Node 24. Run `npm ci`, copy `.env.example` to `.env.local`, enter your Supabase URL and public publishable key, then run `npm run dev`. The terminal prints the local app URL. Run `npm run check` for lint, local tests and the production build.

See [deployment and database setup](docs/deployment.md) for migrations, local Supabase, and hosting configuration.

## Users and features

Approved members share one team workspace. New accounts require administrator approval. Members create and manage their reported issues, update issues assigned to them, and manage their own comments/files. Admins manage projects and roles and moderate team content. Database policies enforce the same rules when the UI is bypassed.

Eight separate screens cover the dashboard, login, registration, projects, issue search, issue details, create/edit, and administration. Search supports combined filters and server pagination. Files support explicit upload/download/delete through a private bucket.

## Evaluation

Repository: https://github.com/petarbinev/issueflow

Live app: https://issueflow-petarbinev.netlify.app

Member and administrator credentials are supplied privately to SoftUni evaluators. Registration requests workspace access; an admin must approve it before any projects, issues or files are accessible. See the [evaluator guide](docs/evaluator-guide.md).

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
| `supabase/seed.sql` | Optional project fixtures; no account provisioning |
| `scripts/seed-workspace.mjs` | Realistic sample workflows through private member/admin API sessions |
| `tests` | Embedded PostgreSQL and validation tests |
| `scripts/verify-hosted.mjs` | Live auth/permissions/file lifecycle checks against the evaluation backend |
| `.github` | Required AI instructions and CI workflow |

Read the [architecture and ER diagram](docs/architecture.md), [security model](docs/security.md), [assessment evidence](docs/assessment-evidence.md), and [project plan](PROJECT_PLAN.md).

Development and assessment checkpoints are recorded in [docs/progress.md](docs/progress.md).
