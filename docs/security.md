# Security and access model

IssueFlow hosts a shared workspace for approved users. Repository visibility and site availability do not grant workspace access. Working account credentials are never published in source, documentation, migrations or seed data.

## Authentication and approval

Supabase Auth supplies JWT sessions. Registration provisions a member with `approved=false`. A narrow `workspace_status` RPC reports only the caller's status so the UI can display the approval state without exposing workspace data.

Restrictive RLS policies protect all seven application tables and issue-file Storage operations. Access requires approval, an unbanned account, and an existing unexpired session matching the JWT session ID. Removing a session therefore also denies still-unexpired access tokens. The app Sign out action ends only the current session, preserving other devices; account suspension still denies every session through RLS.

Only an approved administrator can approve/suspend users or change roles. Role and access changes use the same advisory transaction lock. The last effective administrator cannot be demoted or suspended. Editable signup metadata cannot grant approval or admin privileges.

Both remaining accounts have distinct private passwords. The private admin was renamed and rotated, and previous sessions were globally revoked. Retired privileged Auth accounts were deleted after their sample records were transferred to the approved member. Historical Git commits can contain obsolete values; those values no longer authenticate. Do not restore historical account seeds.

## Membership and data

`active_members` returns only approved, unbanned members for assignment. The admin-only `workspace_users` RPC provides the approval queue and member inventory; retired users cannot be approved.

All approved members may change or clear any issue assignee. New assignees must be active approved members. Reporters/admins may edit issue content or delete issues; the reporter, current assignee or an admin may change status. The update RLS policy admits approved workspace members, while the guard trigger enforces these column-specific rules and rejects combined assignment/content or unauthorized status changes. Column grants protect reporter/project IDs and timestamps. Authors/uploaders or admins manage comments/files. Clients cannot write activity history.

All approved members can read shared workspace content. This is not a private tenant-per-user product. Use fictional assessment data. The private bucket enforces supported file types and a 5 MB per-file limit; comprehensive per-user quotas and malware scanning are outside this capstone's scope.

User content is escaped before rendering. No secret/service-role key is shipped to the frontend. Public project URLs and publishable keys identify the app but do not bypass authorization.

## Credentials and verification

Private member/admin settings live in ignored owner-readable local files. Tests read configuration rather than hardcoded identities/passwords. `scripts/verify-private-settings.mjs` checks Git-eligible files for the configured private passwords without printing them.

Local PostgreSQL tests verify pending access denial, approval, suspension, revoked-session denial, ownership, active assignees and admin safeguards. Hosted tests exercise the private accounts against the real APIs and restore temporary state.

Applied migration files are retained as an audit trail. Historical identity references do not disclose current passwords. Internal Auth/Storage operations remain protected even when the UI is bypassed.

File operations check whether metadata committed after a lost response before removing a possibly valid object. Deletion retries accept already-removed records, while visible records that cannot be deleted still report a permission error. When confirmation itself is unavailable, the app asks for a refresh instead of automatically repeating an uncertain write. These network-failure paths are tested with simulated failures; successful transfers are also checked through the live API and browser.
