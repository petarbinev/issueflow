# IssueFlow development rules

Read PROJECT_PLAN.md and docs/progress.md before changes. Use vanilla JavaScript, HTML, CSS, Bootstrap, Vite and Supabase. Keep separate HTML pages and modular controllers/services. No TypeScript or UI framework.

All schema, RLS and Storage changes belong in versioned migrations. Enforce login, approval, session and ownership checks server-side. Never commit working credentials or privileged keys. Render user content safely. Keep evaluator settings in ignored local files and do not print them.

Validate and push meaningful changes individually. Preserve actual commit timestamps and migration history.

## Current pause schedule

The user authorized the security fix and then the private-workspace update on November 8, 2026. After this update is verified and pushed, pause. Two later-day milestones remain reserved for November 9 and November 10 (Europe/Sofia), normally actual commits 16 and 17. Resume only when the user returns on the relevant day; pause again after November 9 work. Never manufacture commits or dates.
