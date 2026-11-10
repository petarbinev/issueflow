# November 9 regression review

Browser review used the actual reported CSS viewport width, rather than assuming a requested override took effect. This is browser viewport emulation, not physical device testing.

| Screens | Widths (px) | Result |
|---|---|---|
| Login and registration | 320, 375, 768, 1440 | Fit viewport |
| Overview, issues, projects | 320, 375, 768, 1440 | Fit viewport |
| Issue detail with long diagnostic text | 320, 375, 768, 1440 | Fit viewport after fix |
| Create and edit issue variants | 320, 375, 768, 1440 | Fit viewport |
| Administration | 320, 375, 768, 1440 | Fit viewport |

All 36 screen/width combinations had document scroll width equal to viewport width. A temporary valid 160-character title and 1,000-character diagnostic token reproduced a 7,228-pixel scroll width in a 375-pixel viewport before the wrapping fix.

## Findings and resulting behavior

- Long titles/comments wrap inside their panels. Filter fields, account headers and attachment actions retain usable narrow layouts.
- An obsolete page link such as `issues.html?page=99` previously surfaced a PostgREST range error. It now recovers to the last available page while retaining filters; zero-match filters recover to page one.
- Filtered empty results explain how to recover. An empty assigned-work section no longer implies that the entire workspace is empty.
- Error pages offer Try again and Overview actions. Failed sign-in leaves the form usable for a successful retry.
- Sign out affects the current browser session. A separately authenticated member session retained workspace access after browser sign-out. Direct create/edit links and page reload preserved the signed-in session.
- A browser-uploaded plain-text file downloaded with identical bytes. Live API permission, assignment, ownership and file checks passed.
- Seven additional simulated file-failure tests cover rollback, lost upload/metadata responses, uncertain confirmation, repeated deletion and denied deletion. A completed write is not blindly repeated or undone after a lost response.

All eleven local tests, lint and the production build passed. Temporary issue/comment/file fixtures were removed, preserving the original twelve scenarios, sixteen comments and one sample attachment. Test account credentials stayed in ignored local configuration.

## November 10 scope

Fresh-checkout/full local Supabase reset and bootstrap, final submission evidence and evaluator-account review remain for November 10. New-account confirmation-email delivery remains unverified. No physical device or comprehensive offline-browser test is claimed by this review.

The reserved work was completed on November 10; see [the final review](final-review-2026-11-10.md). Email confirmation was disabled with the owner's approval while mandatory workspace approval was retained.
