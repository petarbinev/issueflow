# Security and access model

IssueFlow is one shared team workspace containing fictional data. All registered members can read shared projects, issues, comments, attachments and activity. This is not private tenant isolation.

Supabase Auth provides JWT sessions. Every application table has RLS. Guests have no application table privileges. Roles are stored separately from editable user metadata; registration always provisions a member. Administrator credentials are private and never stored in the repository.

## Public demonstration boundary

Only one fixed member login is public. A private, RLS-protected registry records shared and retired demo identities. Demo identities cannot gain effective administrator access, even if a stored role is changed accidentally. The guarded role RPC rejects promotion of these identities.

The retired admin/reviewer accounts are banned and demoted; refresh tokens are revoked and sessions expired. Restrictive policies on all seven application tables and the issue-file bucket also deny these accounts any data access through already-issued JWTs. This avoids relying solely on token expiry after account banning.

Seeded issues are owned by a blocked sample maintainer, so the shared member cannot edit or delete them. The public member can create and manage its own disposable test content. Its files and comments may be changed by anyone sharing that login; no private data belongs there.

A narrow before-update trigger on `auth.users` prevents registered demo accounts from changing their password, email, pending email, phone or pending phone. It permits ordinary sign-in timestamp updates. Private evaluator accounts retain normal account management. Changing a fixed demo credential requires a trusted project owner to deliberately adjust its private registry protection; it is never exposed as an app operation.

## Data permissions

Column grants protect reporter/project IDs and timestamps. Assignees can change status only; a trigger rejects other edits. Reporters/admins may edit issues. Comment/file mutation is restricted to author/uploader or private admin. Role changes serialize and protect the final admin. Clients cannot write activity records.

Storage uses a private bucket, authenticated issue reads, owner/admin deletes, randomized paths, and a server-enforced 5 MB/type limit per file (PNG/JPEG/PDF/plain text). Supabase project quotas still apply; this demo does not provide comprehensive per-user rate or storage quotas, malware scanning or protection against all resource abuse.

All user content is escaped. Validation runs in both the client and database. The frontend receives only public project settings; no service-role key or database password is committed.

Deleting an issue requires removing files first. Upload compensation removes orphan objects if metadata insertion fails; cleanup failures are visible and retryable.

## Verification and operational notes

`npm test` verifies schema and SQL permissions with simulated Auth/Storage metadata, including fixed credentials, forbidden demo promotions, and retired-account denial even with an old identity claim. `npm run test:hosted` uses the public member and privately configured evaluator against this dedicated project, creates temporary fixtures, and cleans them up. It never logs credentials or tokens.

Removing a credential from current files does not remove it from Git history. Previously published privileged credentials are rendered unusable by disabling those accounts and denying their access. Do not restore an old database seed. Historical commits are retained for the assignment; no history rewrite is necessary to invalidate disabled credentials.

Intentional authenticated SECURITY DEFINER helpers/RPCs use fixed search paths and explicit execute grants. Internal trigger functions are not API-executable. See [Supabase function-execution guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable). Leaked-password protection remains an account-plan setting to review before using real data: [Supabase password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
