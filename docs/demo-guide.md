# Evaluator walkthrough

All demo accounts use `IssueFlowDemo!2026`. These are fictional app-only accounts.

| Role | Email |
|---|---|
| Admin | admin@issueflow.example |
| Member/reporter | member@issueflow.example |
| Member/assignee | reviewer@issueflow.example |

1. Sign in as member. Inspect dashboard counts and projects.
2. Open Issues, combine status/priority/project filters, search a title, and use pagination.
3. Create an issue in an active project, select a priority/assignee, and reload its detail URL.
4. Edit the title/description. Post a comment and edit/delete your own comment.
5. Upload a small text file or image, reload, download it, and compare the content. Delete the attachment before deleting the issue.
6. Sign in as reviewer to update the status of an assigned issue. Full edits of another reporter's issue are denied.
7. Sign in as admin. Create/edit/archive a project, change a member role, and moderate an issue/comment/file.
8. Attempt to demote the final admin; the database rejects it. Restore any other role changes after testing.
9. Sign out; direct visits to protected pages return to sign-in.

Keep demo content fictional. Seed data lives in `supabase/seed.sql`. Seed provisioning touches Auth internals for this dedicated demonstration; in a production application, use the supported Admin Auth API to provision confirmed accounts from a trusted server.
