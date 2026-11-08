# IssueFlow development rules

Read PROJECT_PLAN.md and docs/progress.md before changing this project.
Use vanilla JavaScript, HTML, CSS, Bootstrap, Vite, and Supabase only. Keep separate HTML pages and modular services/controllers. No TypeScript or UI framework.
All schema/policy/storage changes belong in supabase/migrations. Enforce permissions in Supabase, never solely in UI. Never commit credentials or expose privileged keys. Render user content safely.
Validate each milestone before committing and pushing. Preserve meaningful individual commits and actual timestamps. Record evidence honestly; unrun tests are not passes.

## User-required pause
The initial 13 milestones are complete. The user then authorized one extra security commit on November 8. After that fix, pause until the user returns: the remaining two planned milestones are reserved for November 9 and November 10, 2026 (Europe/Sofia), normally actual commits 15 and 16. Never create empty commits, falsify dates, or squash this history. If the schedule slips, report actual dates.

## Authorized security exception (November 8, 2026)
The user explicitly authorized securing the exposed demo accounts after milestone 13. One extra security commit is permitted today. Keep two later-day commits reserved for November 9 and November 10 (now actual commits 15 and 16 if no other fixes are needed). Resume the planned pause after this security fix. Never put working private evaluator credentials in Git or output.
