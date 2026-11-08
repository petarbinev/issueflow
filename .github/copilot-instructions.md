# IssueFlow context

IssueFlow is a Vite multi-page issue tracker using HTML, CSS, vanilla JavaScript and Bootstrap. Supabase supplies Auth, a REST-backed database and private Storage. Approved members share the workspace; admins approve access and manage roles/projects. New accounts start pending.

Keep HTML pages separate, controllers focused, shared rendering in components and API operations in services. Enforce access and ownership through database policies/RPCs. Use migrations for every backend schema/policy change. Never commit working credentials or privileged keys.

Read AGENTS.md and docs/progress.md for verification requirements and the user-required commit pause schedule before changing the project.
