# Evaluator walkthrough

Live app: https://issueflow-petarbinev.netlify.app

## Public member demo

Email: `member@issueflow.example`
Password: `IssueFlowDemo!2026`

This shared account can read the fictional workspace, create its own issues, manage its own comments/files, and update issues assigned to it. It cannot edit/delete seeded issues, change its login credentials, or be promoted to admin. Sample attachments remain disposable.

## Private administrator evaluation

A separate confirmed evaluator account is provisioned privately. Its credentials are given directly to the assessor outside this repository. They are not included in seed SQL, CI, screenshots, or test source. The previously published privileged logins are disabled, and their old access tokens are blocked by database policies.

1. Sign in as the public member. Inspect the dashboard and projects.
2. Open Issues, combine filters, search a title and use pagination.
3. Create your own issue in an active project. Edit it and reload its detail URL.
4. Post a comment, then edit/delete your own comment.
5. On the seeded login issue, download `sample-evidence.txt`. On your own issue, upload a small text file or image, reload and download it. Remove your attachments before deleting your issue.
6. Confirm the public login cannot edit/delete seeded issues or open Administration.
7. Sign in with the privately supplied evaluator login to manage projects, moderate content and inspect roles. Attempts to promote the shared demo account are rejected.
8. Test role management with a separate private member account. Restore any changes afterward. The final administrator cannot be demoted.
9. Sign out; direct protected-page visits return to login.

## Private local verification

Create the confirmed evaluator through Supabase Authentication with a unique password. A trusted project owner grants its application admin role. Keep the credentials in the ignored `.env.evaluator.local` file:

```dotenv
EVALUATOR_EMAIL=your-private-evaluator-email
EVALUATOR_PASSWORD="your-unique-private-password"
```

Use quotes when a password contains `#` or spaces. Do not reuse the public demo password. Run `npm run test:hosted`; credentials and tokens are never printed. The public seed creates no working admin account. Never run old seed revisions against the hosted project.
