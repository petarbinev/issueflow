# Assessment evidence

Status on November 10, 2026: all three actual commit dates are recorded. See [the final review](final-review-2026-11-10.md) for reproducibility and submission evidence. Maximum points remain a target, not an awarded score.

| Criterion | Evidence | Status |
|---|---|---|
| 15 commits | Public Git history and docs/progress.md | At least 22 meaningful commits including the final review; no empty or backdated commits |
| 3 commit days | Actual Git timestamps | November 8, 9 and 10, 2026 (actual author dates, Europe/Sofia) |
| Architecture | Eight HTML files, vite.config.js, src/services and components | Build passed |
| Five responsive screens | Eight page controllers, shared responsive CSS | All eight screens reviewed at actual browser widths 320/375/768/1440; no physical device testing claimed |
| Four DB tables | Seven tables, versioned SQL, ER diagram | Seven-table reset, first-admin bootstrap and hosted migration source hashes verified |
| Admin panel | src/pages/admin.js and set_user_role RPC | Browser access/denial and hosted privilege checks passed |
| File storage | Private bucket migration and attachment service | Hosted byte-equality upload/download and unauthorized-delete denial passed |
| Deployment | [Live app](https://issueflow-petarbinev.netlify.app) | Published from GitHub; production member login, navigation/reload and eight direct routes passed |
| Auth/security | SQL grants/RLS, tests/security.test.js, scripts/verify-hosted.mjs | Eleven local tests, real local Supabase service CI and live API checks passed |
| Documentation | README, architecture, security, deployment, evaluator guide | Setup, ER diagram, evaluator guide, final review and submission checklist available |

Browser checks performed through the real UI: member login, dashboard, search, issue create/edit, comment creation, detail navigation, sign-out/admin login, member admin-page denial, admin panel and projects display. Temporary browser-created issue was removed through trusted cleanup. The original November 8 viewport checks were clamped to 767px. The November 9 review verified actual 320/375/768/1440 viewport widths and no horizontal overflow across 36 screen/width combinations. See [the regression review](regression-review-2026-11-09.md).

![Dashboard](screenshots/dashboard.png)

Security update: retired Auth accounts were deleted after preserving their sample records, all evaluator credentials are private, and workspace access requires approval and a valid session. The three-day requirement is now met by actual November 8, 9 and 10 commits.

Access update: accounts and passwords are no longer published. The former shared member password was rotated privately and old sessions revoked. Pending-account and retired-assignee checks are included in local/hosted validation.

Browser/API verification now includes the pending-access screen, admin approval/suspension, real role changes, revoked-session denial and filtering retired assignees. No working credential values are published.

Workflow review: the detail page exposes assignment controls for every approved workspace member; issue content/status changes retain their own server-side permissions. A neutral session-loading header replaces the initial guest link. Twelve generic samples were replaced with authenticated cross-user scenarios. Local checks, hosted permission/file tests and browser create/edit/assignment/status/discussion flows were reviewed; test cleanup uses local-session sign-out.

November 9: fixed long-text overflow, stale pagination, contextual empty states, current-session sign-out and ambiguous file-write/delete outcomes. Browser upload/download integrity and sign-in retry passed; all temporary fixtures were removed.


November 10: a fresh public checkout passed `npm ci` (zero audit vulnerabilities), lint, all eleven tests and the production build. All eight hosted migration source hashes match local SQL. Hosted permission/file tests and direct-page/404 checks passed. Public signup now creates a pending session without email confirmation; live tests verified denied access, safe role metadata handling, approval and suspension. The temporary registration identity and privileged local settings were removed. Full local-service CI results are linked in the final review.
