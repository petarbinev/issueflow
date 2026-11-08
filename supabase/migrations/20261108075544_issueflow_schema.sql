-- IssueFlow application schema. Apply through Supabase migrations.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now()
);
create table public.user_roles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('member','admin'))
);
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[A-Z][A-Z0-9]{1,9}$'),
  name text not null check (char_length(name) between 2 and 100),
  description text not null default '' check (char_length(description) <= 2000),
  archived boolean not null default false,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
create table public.issues (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity unique,
  project_id uuid not null references public.projects(id),
  title text not null check (char_length(trim(title)) between 3 and 160),
  description text not null default '' check (char_length(description) <= 20000),
  status text not null default 'Open' check (status in ('Open','In Progress','Resolved','Closed')),
  priority text not null default 'Medium' check (priority in ('Low','Medium','High','Critical')),
  reporter_id uuid not null references public.profiles(id),
  assignee_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text not null check (char_length(trim(body)) between 1 and 5000),
  created_at timestamptz not null default now()
);
create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  uploader_id uuid not null references public.profiles(id),
  storage_path text not null unique,
  original_name text not null check (char_length(original_name) between 1 and 255),
  mime_type text not null check (mime_type in ('image/png','image/jpeg','application/pdf','text/plain')),
  size_bytes bigint not null check (size_bytes between 1 and 5242880),
  created_at timestamptz not null default now()
);
create table public.issue_activity (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index issues_project_status_idx on public.issues(project_id, status, created_at desc);
create index issues_assignee_status_idx on public.issues(assignee_id, status);
create index issues_reporter_idx on public.issues(reporter_id);
create index issues_created_idx on public.issues(created_at desc, id);
create index projects_creator_idx on public.projects(created_by);
create index comments_issue_idx on public.comments(issue_id, created_at);
create index comments_author_idx on public.comments(author_id);
create index attachments_issue_idx on public.attachments(issue_id);
create index attachments_uploader_idx on public.attachments(uploader_id);
create index activity_issue_idx on public.issue_activity(issue_id, created_at desc);
create index activity_actor_idx on public.issue_activity(actor_id);
-- Fail closed from the initial schema migration, before access policies exist.
do $$ declare t text; begin
 foreach t in array array['profiles','user_roles','projects','issues','comments','attachments','issue_activity'] loop
 execute format('alter table public.%I enable row level security', t);
 end loop;
end $$;
