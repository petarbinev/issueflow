# Security and access model

IssueFlow is one shared team workspace. All registered users can read all projects, issues, comments, attachments and activity. It is a fictional demonstration, not private tenant isolation.

Supabase Auth provides JWT sessions. Every application table has RLS enabled. Guests have no application table privileges. Member/admin roles are stored separately from editable user metadata; signup always provisions a member. The initial demo administrator is provisioned by the trusted seed script.

Column grants prevent changing reporter IDs, project IDs and creation timestamps through normal client updates. Assignees may update status only; a database trigger rejects other edits. Reporters/admins may edit issues. Comment and file mutation is restricted to the author/uploader or admin. A transactional role RPC serializes role changes and protects the final admin. Clients cannot write activity records.

Storage uses a private bucket with authenticated issue-level reads and owner/admin deletes. File paths contain issue/user UUIDs. The bucket restricts files to 5 MB and PNG/JPEG/PDF/plain-text MIME types. Downloads are forced through explicit download controls. Client validation supplements server rules; supplied MIME types do not constitute malware scanning. Use fictional files only in this public demonstration.

All user content is escaped before HTML rendering. Forms validate both in the browser and database. No privileged key is shipped to the client. `VITE_*` settings are public build inputs. Database credentials and owner-account tokens must never be committed.

Deleting an issue requires removing its files first. A reporter cannot remove another user's attachment; an admin can help remove those files. Object/metadata failures produce retryable errors. Upload cleanup errors disclose the orphan object path only to the current user for admin support.

Run `npm test` for isolated PostgreSQL role checks. Run `node scripts/verify-hosted.mjs` only against this dedicated demo project for authenticated API and Storage tests. The latter creates and removes its own temporary issue/file. It never prints tokens.

Public demo credentials are intentionally provided for evaluation. These accounts have no infrastructure access. Do not store real personal or company data in the demo.

## Advisor review (November 8)

The advisor initially identified inherited API-role EXECUTE grants. The hardening migration explicitly revokes them from anon/authenticated as well as PUBLIC. The remaining two SECURITY DEFINER warnings are intentional: authenticated users need the role-check helper and the guarded admin role RPC. Their implementation checks are covered by tests. See [Supabase function-execution advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).

The project also reports leaked-password protection disabled. This account configuration is not a database authorization bypass; review availability and enable it in Auth settings before accepting real users. See [Supabase password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
