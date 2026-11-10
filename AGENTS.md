# IssueFlow development rules

Read PROJECT_PLAN.md and docs/progress.md before changes. Use vanilla JavaScript, HTML, CSS, Bootstrap, Vite and Supabase. Keep separate HTML pages and modular controllers/services. No TypeScript or UI framework.

All schema, RLS and Storage changes belong in versioned migrations. Enforce login, approval, session and ownership checks server-side. Never commit working credentials or privileged keys. Render user content safely. Keep evaluator settings in ignored local files and do not print them.

Validate and push meaningful changes individually. Preserve actual commit timestamps and migration history.

## Dated delivery checkpoints

The user returned for the November 9 regression review and November 10 final bootstrap/submission review. Actual commits now span November 8, 9 and 10, 2026 (Europe/Sofia). No scheduled pause remains. Preserve actual timestamps and meaningful history; never manufacture commits or dates. Keep the final verification evidence current when making subsequent changes.
