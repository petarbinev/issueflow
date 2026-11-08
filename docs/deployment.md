# Deployment and local development

## Local frontend

Use Node 24 (see `.nvmrc`). Run `npm ci`, copy `.env.example` to `.env.local`, and supply your Supabase API URL and public publishable key. Run `npm run dev`, then open the printed local URL. `npm run check` runs ESLint, local PostgreSQL/validation tests, and the Vite production build. `npm run preview` serves `dist` after a build.

The project public settings are available in Supabase Project Settings → API. Never use a secret/service-role key in `VITE_*` variables. `.env.local`, `.netlify`, build files, dependency files, and test reports are ignored.

## Database setup

Install the Supabase CLI and a supported container runtime for a complete local Supabase environment. From the project root, run `supabase start` and `supabase db reset`. The checked-in config, ordered migrations, and demo seed rebuild the backend. The seed uses pgcrypto in the Supabase `extensions` schema. It creates a confirmed public member and a banned sample maintainer with a random password. It never creates an admin with a known password. Provision a private evaluator separately as described in the demo guide; apply seed SQL only to the dedicated demonstration backend.

For a new hosted project, log in through `supabase login`, run `supabase link --project-ref YOUR_PROJECT_REF`, then review `supabase db push --dry-run` before `supabase db push`. Apply the demo seed only to the selected capstone project through its SQL editor. Local tests use embedded PostgreSQL and simulated Auth/Storage metadata; they are not a replacement for resetting a full Supabase instance or testing its Storage API.

If starting from an existing database, pull its baseline first with `supabase db pull`. Compare `supabase migration list` after each change. This project's migration filenames match the versions returned by the hosted migration history. Do not reapply an already recorded migration. Commit every schema/policy/function/bucket change as SQL.

## Netlify

Connect the existing `petarbinev/issueflow` repository to the `pbinev` Netlify team, using branch `main`. Build command: `npm run build`; publish directory: `dist`; Node: `24`.

Set these build environment variables in Netlify:

- `VITE_SUPABASE_URL`: selected project API URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: selected project public publishable key.

Both values are intentionally public in browser builds. Do not disable secret scanning. No SPA catch-all rewrite is used; every page is built as a separate HTML output. Netlify may canonicalize `.html` URLs; query strings and reloads must continue to work. `public/404.html` supplies a true not-found page.

In Supabase Auth URL Configuration, set the production site URL and allow its `/index.html` confirmation return, plus the local development URL/return. Pre-confirmed demo accounts bypass email delivery for assessment. New registrations with confirmation enabled require working email delivery and allowed redirects.

A push to `main` triggers a new build. Review build results and production behavior before marking deployment complete. For a bad published change, fix forward with a new commit; do not rewrite assessment history.

## Verified deployment

Live site: https://issueflow-petarbinev.netlify.app. Git source: `petarbinev/issueflow`, branch `main`, Netlify team `pbinev`. Production Auth site and three explicit return URLs were saved. Run `node scripts/verify-deployment.mjs` to check eight HTML routes and the real 404. Run `npm run test:hosted` for the dedicated backend checks. Demo attachment provisioning is available with `node scripts/seed-attachment.mjs`.
