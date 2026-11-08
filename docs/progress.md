# Implementation progress

State: `shared_assignment_then_paused`. November 8 maintenance includes private accounts, retired-account removal, and assignment/navigation/sample-workflow fixes. Pause after verification and push. The remaining two milestones are reserved for November 9 and November 10, normally actual commits 19 and 20.

Live app: https://issueflow-petarbinev.netlify.app
Repository: https://github.com/petarbinev/issueflow

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
| 13 | `e428f4e` | November 8, 2026 | Deployment configuration and evaluator documentation |
| 14 | `5db9f2e` | November 8, 2026 | Disable exposed privileged accounts and protect private evaluator access |
| 15 | `ca939fb` | November 8, 2026 | Private member rotation, approved membership and credential-free setup |
| 16 | `8583175` | November 8, 2026 | Rename private admin settings/login, rotate admin password and remove retired accounts |
| 17 | `0b94712` | November 8, 2026 | Direct assignment controls, session-loading header, realistic samples and regression checks |

| 18 | Current shared-assignment checkpoint | November 8, 2026 | Allow approved members to reassign any issue with server-side field permissions |

## Verified current behavior

- Private member/admin accounts authenticate. The member password was replaced with a random private value; previous login credentials fail and previous sessions are revoked.
- Workspace RLS requires approval, an unbanned identity and an existing unexpired Auth session. Still-unexpired tokens from removed sessions cannot read workspace data.
- New accounts start pending. Only admins approve/suspend access or change roles. The final effective administrator cannot be demoted or suspended.
- The two retired Auth accounts were deleted after their sample ownership moved to the approved member. The later workflow review replaced the twelve generic legacy samples and their discussions/files with twelve realistic scenarios. Exactly two Auth users remain. Public account credentials are no longer seeded or published in current documentation/scripts.
- The private admin login and display name were renamed. Its password is a distinct random value, old sessions were globally revoked, and local settings now use ADMIN_EMAIL/ADMIN_PASSWORD.
- Local lint, four isolated tests and the Vite production build passed. Tests cover pending access, approval, suspension, revoked sessions, roles, ownership and active members.
- Hosted checks passed for private account access, approval/suspension, real role changes, last-admin safeguards, issue/comment ownership and file byte integrity/cleanup. Fixture state was restored.
- Browser checks verified the pending screen, admin approval, and assignment choices containing only the two approved accounts. Temporary suspension was restored.
- Eight migrations are tracked locally and in hosted history. Migration 20261108114909 adds shared assignment with guarded issue edits; its local/remote source checksum matches.
- Private passwords remain in ignored owner-readable local configuration and are scanned against Git-eligible files/build output without printing values.

- Every approved member can assign, unassign and reassign from the detail page, including when neither reporter nor assignee. Reporter/admin content editing and reporter/assignee/admin status rules remain enforced. Pending and retired accounts cannot be selected as new assignees. Local, hosted and browser checks cover the new rule.
- The header starts with a neutral session check and shows Sign in only for a confirmed guest. Browser navigation through Overview/Issues/Projects showed no guest link while signed in.
- Samples include both reporters, six member assignments, five admin assignments, one triage item, cross-user comments and reproduction evidence. Seed reruns preserve existing edits. Temporary browser/API fixtures are removed after review.
- Test and seed cleanup now closes only the current test session, preserving other signed-in browser sessions.

## Remaining dated milestones

- **November 9 (Europe/Sofia):** regression review, persisted sessions/retry behavior and real phone-width/device QA. Available browser viewport overrides previously clamped to 767px; 375px/1440px verification is not claimed.
- **November 10 (Europe/Sofia):** fresh-checkout/full Supabase reset and bootstrap, submission/evidence audit, evaluator account review and final live checks.

New-user email delivery remains unverified and depends on hosted SMTP settings. Private pre-confirmed evaluator accounts remain available for testing.

Keep actual dates and preserve commit/migration history. Historic passwords no longer authenticate; do not restore historical account seeds.
