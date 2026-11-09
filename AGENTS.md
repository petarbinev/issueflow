# IssueFlow development rules

Read PROJECT_PLAN.md and docs/progress.md before changes. Use vanilla JavaScript, HTML, CSS, Bootstrap, Vite and Supabase. Keep separate HTML pages and modular controllers/services. No TypeScript or UI framework.

All schema, RLS and Storage changes belong in versioned migrations. Enforce login, approval, session and ownership checks server-side. Never commit working credentials or privileged keys. Render user content safely. Keep evaluator settings in ignored local files and do not print them.

Validate and push meaningful changes individually. Preserve actual commit timestamps and migration history.

## Current pause schedule

November 9 regression review is authorized and complete after its verification, push and deployment. Pause at that checkpoint. The final planned milestone remains November 10, 2026 (Europe/Sofia), normally actual commit 20: fresh-checkout/bootstrap and submission review. Resume the planned milestone only when the user returns on November 10. Explicit user requests for additional fixes still authorize their stated scope. Preserve actual timestamps; never manufacture commits or dates.
