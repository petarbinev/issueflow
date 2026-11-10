# Final review — November 10, 2026

The third dated milestone completes the capstone verification. The app remains at [issueflow-petarbinev.netlify.app](https://issueflow-petarbinev.netlify.app); source and actual dated history are in [petarbinev/issueflow](https://github.com/petarbinev/issueflow). Rubric coverage is documented in [assessment-evidence.md](assessment-evidence.md). Grading remains the assessor's decision.

## Reproducibility

- A new clone of the public repository at `606a916` installed with `npm ci`: zero audit vulnerabilities. Using only the public backend URL/key, it passed lint, all eleven tests and the eight-page Vite production build. That checkout used this Mac's Node 26; Node 24 is the documented and CI-tested version.
- The final CI workflow adds actual Supabase services on an isolated Linux runner with Docker. [The successful run at `58ef9bf`](https://github.com/petarbinev/issueflow/actions/runs/42761516986) passed both the Node 24 app checks and the full Supabase reset/bootstrap job.
- The first local-service CI attempt failed before database startup because the default database port was occupied. Commit `58ef9bf` allocates available ports for the disposable stack. The rerun passed; no hosted database reset was performed.
- Full reset applies all eight migrations and the credential-free seed, verifies seven empty application tables and a private bucket, creates a first admin, rejects self-assigned signup privileges, approves a pending member, creates twelve sample scenarios, then runs real Auth/REST/Storage permission and file-lifecycle checks. Random test passwords exist only on the runner. Private temporary settings and local containers/volumes are removed afterward; no hosted secrets are configured in CI.
- All eight hosted migration source hashes match local SQL files, including assignment migration `20261108114909`. No schema change was needed for this review.

## Live access and registration

The owner approved disabling email confirmation for this capstone because the default Supabase mail service only delivers to project-team addresses. Registration now gives an immediate session; it does **not** grant workspace access. Email ownership is not verified. Configure custom SMTP and re-enable confirmation before a rollout that requires verified email.

A disposable account registered through the deployed project's public Auth API. Its forged `role=admin` and `approved=true` metadata did not change its server-side member/pending status. It could not read projects, issues, comments or attachment metadata, list workspace users or approve itself. Admin approval immediately enabled workspace reads, and suspension immediately removed access. The test identity was permanently removed through trusted cleanup, and its temporary privileged local configuration was deleted.

Exactly two private evaluation accounts remain: one approved member and one approved administrator, with distinct random passwords stored only in ignored owner-readable settings. Hosted tests also passed role changes, last-admin safeguards, issue/comment ownership, shared assignment, file byte integrity and fixture cleanup. Guest file access was denied.

## Deployment and sample workspace

All eight HTML routes return HTTP 200 directly, and an unknown route returns a real 404. Git-linked Netlify production deployment was verified against the pushed November 10 source. The browser retained the private member session on reload, displayed Sign out, and showed the twelve sample issues with both active assignees.

The evaluation workspace contains two projects, twelve fictional issues, sixteen cross-user comments and one downloadable reproduction-notes file. Six issues belong to the member's assignment list, five to the admin's and one remains available for triage. Temporary API fixtures were removed. The November 9 browser review records responsive checks at actual widths of 320/375/768/1440, assignment/status/discussion flows and upload/download byte equality.

The current source, private-settings check and build output contain no configured private passwords. Historical obsolete credentials remain in Git history as previously documented and do not authenticate. No physical-device testing, email-delivery test or comprehensive offline-browser test is claimed. The clean Supabase stack ran in CI; Docker was not installed on this Mac.

## Submission checklist

1. Supply your author name and contact email in SoftUni's submission form.
2. Supply the public repository and live-app links above.
3. Supply the member and admin login details **privately** from the ignored `.env.evaluator.local` file. Use its `MEMBER_EMAIL` / `MEMBER_PASSWORD` and `ADMIN_EMAIL` / `ADMIN_PASSWORD` values. Do not add the file or its contents to Git, screenshots or public comments.
4. Link the [evaluator walkthrough](evaluator-guide.md), [architecture/ER diagram](architecture.md), [setup guide](deployment.md), [assessment evidence](assessment-evidence.md) and [commit ledger](progress.md).
5. Evaluators can use the private accounts immediately. A newly registered account must be approved in Administration before testing workspace features. Restore any temporary access/role changes after evaluation.

Evaluators need application credentials only. Do not share GitHub, Netlify or Supabase owner credentials or privileged API keys.
