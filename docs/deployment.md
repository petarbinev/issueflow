# Setup and deployment

## Frontend

Use Node 24. Run `npm ci`, copy `.env.example` to `.env.local`, and enter your Supabase API URL and public publishable key. Run `npm run dev`; `npm run check` runs lint, eleven local tests and a Vite production build.

The frontend receives no secret keys. `.env*` files (except the blank example), `.netlify`, dependencies and build artifacts are ignored by Git.

## Database and first administrator

Install the Supabase CLI and a supported container runtime. Run `supabase start` and `supabase db reset` for a local backend. Apply hosted migrations with the CLI only after reviewing the selected project and its existing history. Never apply an old credential-bearing seed revision.

Create a private confirmed account through Supabase Authentication. Copy its user UUID from the dashboard, then use the trusted SQL editor to bootstrap the first admin:

```sql
update public.user_roles
set role = 'admin', approved = true
where user_id = 'REPLACE_WITH_YOUR_CONFIRMED_USER_UUID';
```

Use a UUID placeholder replacement, not an email/password committed to the repository. Review the affected row before granting access. This operation requires the project owner; normal app users cannot bootstrap themselves.

Register/create a separate private member and approve it in the admin panel. Store evaluator credentials locally and share them with the assessor outside Git. See [evaluator-guide.md](evaluator-guide.md).

`supabase/seed.sql` optionally creates the two sample projects after an approved admin exists; it creates no accounts. Once both private accounts are provisioned and approved, configure the ignored settings file and run `npm run seed:workspace`. The command creates twelve fictional scenarios through authenticated API calls, with real actor history, assignments to both accounts, cross-user discussion, status transitions and one sample file. It skips existing scenarios and preserves their edits. `-- --replace-legacy` removes only the twelve known generic legacy samples before adding the new scenarios; it is not a general workspace reset.

For a hosted database, log in to the CLI, link the intended project, review `supabase db push --dry-run`, apply migrations, then compare `supabase migration list`. Pull an existing baseline before changing an unrelated project. Keep all applied migrations in history.

## Hosting

Netlify builds `main` with `npm run build` and publishes `dist` using Node 24. Configure only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as frontend build variables. Private evaluator credentials do not belong in Netlify frontend variables.

The app has separate HTML pages and no SPA catch-all rewrite. `public/404.html` supplies a real missing-page response. Configure Supabase Auth's production site URL and explicit `/index.html` return URL, plus both localhost and 127.0.0.1 development returns if used.

The site and source remain publicly reachable, but workspace data is accessible only after login and approval. For this capstone, Auth → Sign In / Providers → Confirm email is disabled with the owner's approval. Registration gives a session immediately, but a new member remains unapproved and cannot access workspace data. Email ownership is not verified; approve only expected users. Before a production rollout requiring verified email, configure custom SMTP and re-enable confirmation. The [default Supabase mail service](https://supabase.com/docs/guides/auth/auth-smtp) only sends to project-team addresses. Private evaluation accounts remain available independently of registration.

Run `node scripts/verify-deployment.mjs` for route checks and `npm run test:hosted` for the private-account API checks. The sample workflow command includes a downloadable reproduction-notes file. Test and seed cleanup signs out only its own sessions.

## Fresh-backend verification

The GitHub Actions `local-stack` job uses Node 24, Supabase CLI 3.0.0 and the runner's Docker runtime. It allocates available API/database/shadow ports, starts an isolated local stack, resets all eight migrations and the seed, verifies that application tables start empty, bootstraps a first admin, and tests public registration plus approval. It then creates the twelve sample scenarios and runs the real Auth/REST/Storage permission and file checks. This complements the fast embedded PostgreSQL tests with actual Supabase services.

To reproduce on a machine with Docker and the CLI installed:

```sh
npm ci
supabase start -x studio,imgproxy,mailpit,realtime,edge-runtime,logflare,vector,supavisor,postgres-meta
supabase db reset --yes
supabase status -o json > /tmp/issueflow-local-status.json
node scripts/verify-local-stack.mjs /tmp/issueflow-local-status.json
supabase stop --no-backup
```

Run this against a disposable local stack: reset replaces its local data, and the test leaves sample fixtures until the stack is stopped. The status file contains local-only keys; remove it afterward. The script accepts only a loopback HTTP API on an unprivileged port, generates random short-lived test credentials, and deletes its private settings in `finally`. It does not use hosted secrets or contact the deployed project. CI discards the local volumes even if a check fails. No private evaluator credentials are required in GitHub Actions.
