# Implementation progress

State: `security_fix_authorized_then_paused`. The user explicitly authorized the November 8 security repair after milestone 13. Pause after its push/deployment; the two later-day milestones remain reserved.

Live app: https://issueflow-petarbinev.netlify.app
Repository: https://github.com/petarbinev/issueflow
Supabase project: `ynpgrmkpfdlikckuravp` (IssueFlow, Frankfurt).
Netlify project: `b6d85424-5e59-4a38-bfe5-705c0d3d76bc`, team `pbinev`, Git deployment from `main`.

## Commit ledger

| Milestone | SHA | Actual author timestamp | Scope |
|---|---|---|---|
| 1 | `59b3e0d` | 2026-11-08T09:51:15+02:00 | docs: define project scope and development rules |
| 2 | `7ccfa1a` | 2026-11-08T09:55:22+02:00 | chore: scaffold Vite multi-page app and checks |
| 3 | `7a7f0d5` | 2026-11-08T09:57:41+02:00 | feat: add database schema and reproducible migrations |
| 4 | `61f69dd` | 2026-11-08T10:01:06+02:00 | feat: enforce roles and database access policies |
| 5 | `a67b518` | 2026-11-08T10:01:59+02:00 | feat: implement authentication and shared navigation |
| 6 | `fe82f0c` | 2026-11-08T10:03:04+02:00 | feat: add project browser and dashboard |
| 7 | `870b4a7` | 2026-11-08T10:03:30+02:00 | feat: implement issue creation and editing |
| 8 | `61bc353` | 2026-11-08T10:04:40+02:00 | feat: add issue search filters and pagination |
| 9 | `b1946af` | 2026-11-08T10:06:17+02:00 | feat: add issue discussion and activity history |
| 10 | `0598e86` | 2026-11-08T10:07:50+02:00 | feat: add secure attachment upload and download |
| 11 | `a23f481` | 2026-11-08T10:08:21+02:00 | feat: implement administrator management tools |
| 12 | `042d711` | 2026-11-08T10:16:28+02:00 | test: verify responsive workflows and authorization |
| 13 | See the commit containing this checkpoint | November 8, 2026 | Deploy configuration, live app, setup and evaluator documentation |

The milestone 13 SHA and final deployment/CI result are reported in the implementation chat; inspect `git log -1` for the exact checkpoint. No amended commit is needed to record its own SHA.

## Verified

- All milestones 1–12 were individually committed and pushed; GitHub Actions passed each code-bearing push.
- Local ESLint, four tests, and eight-entry Vite production build passed.
- Embedded PostgreSQL tests rebuild the application schema and check foreign keys, constraints, role escalation, assignee restrictions, immutable reporter identity, forged activity, last-admin protection, and actual API-role function grants. Auth and Storage metadata are simulated locally.
- Hosted API checks passed for three confirmed demo logins, guest denial, admin permissions, issue/comment ownership, assignee status updates, and private file upload/download byte equality/delete restrictions and cleanup.
- Browser verified login, dashboard, projects, search, issue create/edit, comment persistence, sign-out/admin login, member admin-page denial and admin panel display. Temporary verification issue was cleaned up.
- Production member login, direct issue navigation and reload passed. All eight HTML URLs returned HTTP 200 and a missing page returned HTTP 404.
- Supabase Auth site URL and production/local `/index.html` returns saved and observed. Actual new-user email delivery has not been exercised.
- Local/remote migrations match versions 20261108075544, 20261108075747, 20261108080623, 20261108081410.
- Security advisor inherited-function-grant warnings were fixed. Intended authenticated helper/RPC notices and disabled leaked-password protection are explained in docs/security.md.
- A fictional `sample-evidence.txt` attachment is stored on the demo login issue; a provisioning script is included.

## Remaining work on the two reserved days

- **November 9, 2026 (Europe/Sofia), normally actual commit 15:** fresh-day regression review, real phone-width/device QA, persisted sessions/direct navigation/retry cases, and any discovered fixes. Available browser viewport overrides were clamped to an observed 767px, so 375px and 1440px checks are not claimed.
- **November 10, 2026 (Europe/Sofia), normally actual commit 16:** fresh-checkout setup validation, final screenshots/submission/evidence audit, demo-account review and final live checks. Verify at least 15 public commits on three actual dates.

Resume each only when the user returns on that date or later. Keep actual timestamps, no empty commits, no squashing/backdating. Pause and notify after the November 9 milestone as well.

## Additional security repair authorized November 8

The user requested that public privileged access be removed immediately. An audit found only the three expected demo identities and no unexpected admins. The exposed admin/reviewer accounts were demoted, banned, their refresh tokens revoked and sessions expired. A separately user-created private evaluator is now the sole app administrator.

Migrations `20261108085356_secure_demo_accounts` and `20261108090435_protect_effective_admin_count` protect fixed demo credentials, forbid demo promotion, deny retired identities through restrictive RLS/Storage policies, protect seeded issue ownership and count only effective private administrators in the last-admin safeguard. Both are recorded in the hosted migration history.

Private credentials are read only from ignored local configuration and are not printed. Public seed SQL no longer provisions a known admin password or automatically grants admin. Current docs expose only the limited member login. Historical privileged credentials remain in Git history but their accounts are disabled and denylisted.

Local checks and hosted API tests passed for private admin login, retired-account rejection, public password-change denial, forbidden demo promotion (including by an admin), seeded issue protection, normal member ownership/status and file integrity/cleanup. A private-value scan passed across Git-eligible files. Final push/deployment verification is reported in chat. This additional commit gives 14 today plus two reserved commits, for at least 16 total.
