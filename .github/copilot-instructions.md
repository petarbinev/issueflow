# IssueFlow development rules

Read PROJECT_PLAN.md and docs/progress.md before changing this project.
Use vanilla JavaScript, HTML, CSS, Bootstrap, Vite, and Supabase only. Keep separate HTML pages and modular services/controllers. No TypeScript or UI framework.
All schema/policy/storage changes belong in supabase/migrations. Enforce permissions in Supabase, never solely in UI. Never commit credentials or expose privileged keys. Render user content safely.
Validate each milestone before committing and pushing. Preserve meaningful individual commits and actual timestamps. Record evidence honestly; unrun tests are not passes.

## User-required pause
Stop after planned milestone/commit 13 and notify the user. Commit 14 is reserved for November 9, 2026, and commit 15 for November 10, 2026 (Europe/Sofia). Resume those milestones only when the user returns on the appropriate day. Never create empty commits, falsify dates, or squash this history. If the schedule slips, report actual dates.
