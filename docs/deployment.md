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

The site and source remain publicly reachable, but workspace data is accessible only after login and approval. New-user confirmation emails require a working hosted email configuration; the built-in SMTP service may not deliver to arbitrary assessor addresses. Keep pre-confirmed private evaluation accounts available.

Run `node scripts/verify-deployment.mjs` for route checks and `npm run test:hosted` for the private-account API checks. The sample workflow command includes a downloadable reproduction-notes file. Test and seed cleanup signs out only its own sessions.
