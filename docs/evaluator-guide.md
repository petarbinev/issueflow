# Evaluator guide

Live app: https://issueflow-petarbinev.netlify.app
Repository: https://github.com/petarbinev/issueflow

Account details are supplied privately with the SoftUni submission. This repository does not publish working usernames/passwords or provision accounts with known passwords.

## Accounts and approval

Use the privately supplied member account to test issue creation/editing, assignment, comments and attachments. Use the separate private admin account to manage projects, approve/suspend workspace access, change roles and moderate content.

Registration creates a signed-in, unapproved member. Email confirmation is disabled for this capstone; email ownership is not verified. The account sees the approval screen until an admin grants access. The admin approves expected users in Administration → Access requests. An unapproved account cannot read or write workspace data or files through either the UI or API.

## Walkthrough

1. Sign in as the member and inspect the dashboard, projects, filters and pagination.
2. Create an issue, assign it, edit its description and reload its detail URL. Every approved member can change or clear any issue assignee directly on the detail page using Save assignee. Reporters/admins also have the full Edit issue form. The reporter, current assignee or an admin can update status; changing assignment does not grant permission to edit another reporter's issue content.
3. Add/edit/delete a comment. Upload a small permitted file, reload and download it.
4. Sign in as admin and create/edit/archive a project.
5. Suspend member workspace access. Confirm the member sees the approval screen and cannot load workspace data; restore access afterward.
6. Promote the private member to admin, verify access, and restore its member role. The final active admin cannot be demoted or suspended.
7. Register a separate test account to verify pending access and approval. No confirmation email is required in this deployment. Approve only the account you intentionally registered, then suspend it again after testing.
8. Remove temporary files/issues and sign out.

## Private local verification

Place the separately supplied account details in the ignored `.env.evaluator.local` file. Use `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `MEMBER_EMAIL` and `MEMBER_PASSWORD`; quote values containing spaces or `#`. Never commit this file or include it in screenshots.

Run `npm run test:hosted` only against the designated evaluation backend. It temporarily suspends/restores the private member and creates/removes its own issue/file fixtures. It never prints credentials or tokens.

The sample workspace has twelve fictional scenarios: six assigned to the member, five to the admin and one awaiting triage. Both accounts report issues and reply to each other. Scenario descriptions refer to fictional products, not promises that those product features exist in IssueFlow.
