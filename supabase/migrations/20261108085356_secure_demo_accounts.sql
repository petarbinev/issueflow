-- Public demonstration accounts never receive privileged or recoverable access.
create schema if not exists issueflow_private;
revoke all on schema issueflow_private from public,anon,authenticated;
create table issueflow_private.demo_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  access_mode text not null check(access_mode in ('member','blocked'))
);
alter table issueflow_private.demo_accounts enable row level security;
revoke all on issueflow_private.demo_accounts from public,anon,authenticated;
insert into issueflow_private.demo_accounts(user_id,access_mode)
select id,case when email='member@issueflow.example' then 'member' else 'blocked' end
from auth.users where email in ('member@issueflow.example','admin@issueflow.example','reviewer@issueflow.example','seed-owner@issueflow.example');

create function public.demo_access_allowed() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and not exists(select 1 from issueflow_private.demo_accounts where user_id=auth.uid() and access_mode='blocked');
$$;
revoke all on function public.demo_access_allowed() from public,anon,authenticated;
grant execute on function public.demo_access_allowed() to authenticated;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select public.demo_access_allowed() and exists(select 1 from public.user_roles where user_id=auth.uid() and role='admin')
 and not exists(select 1 from issueflow_private.demo_accounts where user_id=auth.uid());
$$;
revoke all on function public.is_admin() from public,anon,authenticated;
grant execute on function public.is_admin() to authenticated;

-- A restrictive policy also rejects still-valid JWTs for the retired accounts.
do $$ declare t text; begin
 foreach t in array array['profiles','user_roles','projects','issues','comments','attachments','issue_activity'] loop
 execute format('create policy demo_account_access on public.%I as restrictive for all to authenticated using ((select public.demo_access_allowed())) with check ((select public.demo_access_allowed()))',t);
 end loop;
end $$;
create policy demo_account_storage_access on storage.objects as restrictive for all to authenticated
using(bucket_id<>'issue-attachments' or (select public.demo_access_allowed()))
with check(bucket_id<>'issue-attachments' or (select public.demo_access_allowed()));

create or replace function public.provision_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,display_name) values(new.id,left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'Team member'),80));
 insert into public.user_roles(user_id,role) values(new.id,'member');
 if new.email in ('member@issueflow.example','admin@issueflow.example','reviewer@issueflow.example','seed-owner@issueflow.example') then
  insert into issueflow_private.demo_accounts(user_id,access_mode) values(new.id,case when new.email='member@issueflow.example' then 'member' else 'blocked' end);
 end if;
 return new;
end $$;
revoke all on function public.provision_user() from public,anon,authenticated;

create or replace function public.set_user_role(target_user uuid,new_role text) returns void language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(781213);
 if not public.is_admin() then raise exception 'Administrator access required.'; end if;
 if new_role is null or new_role not in ('member','admin') then raise exception 'Invalid role.'; end if;
 if new_role='admin' and exists(select 1 from issueflow_private.demo_accounts where user_id=target_user) then raise exception 'Public demo and retired accounts cannot become administrators.'; end if;
 if not exists(select 1 from public.user_roles where user_id=target_user) then raise exception 'User not found.'; end if;
 if new_role='member' and exists(select 1 from public.user_roles where user_id=target_user and role='admin') and (select count(*) from public.user_roles where role='admin')<=1 then raise exception 'The last administrator cannot be demoted.'; end if;
 update public.user_roles set role=new_role where user_id=target_user;
end $$;
revoke all on function public.set_user_role(uuid,text) from public,anon,authenticated;
grant execute on function public.set_user_role(uuid,text) to authenticated;

-- GoTrue updates auth.users, not public tables. Prevent password/email/phone
-- replacement for fixed demo identities, while permitting normal sign-in updates.
create function issueflow_private.lock_demo_credentials() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from issueflow_private.demo_accounts where user_id=old.id)
 and row(new.email,new.email_change,new.encrypted_password,new.phone,new.phone_change)
 is distinct from row(old.email,old.email_change,old.encrypted_password,old.phone,old.phone_change)
 then raise exception 'Public demonstration account credentials are fixed.'; end if;
 return new;
end $$;
revoke all on function issueflow_private.lock_demo_credentials() from public,anon,authenticated;
create trigger lock_demo_credentials before update on auth.users for each row execute function issueflow_private.lock_demo_credentials();

-- Existing seeded issues were owned by the public demo login. Transfer only
-- the known fixtures to a blocked maintainer; demo-created issues stay editable.
update public.issues set reporter_id=(select id from auth.users where email='admin@issueflow.example'),assignee_id=null
where reporter_id=(select id from auth.users where email='member@issueflow.example')
and exists(select 1 from auth.users where email='admin@issueflow.example')
and title in (
 'Login button stays disabled after a failed attempt',
 'Improve keyboard focus in the navigation',
 'Exported report is missing the project name',
 'Add a helpful empty state to search results',
 'Status labels overlap on narrow screens',
 'Dashboard counts do not refresh after returning',
 'Document browser support in the help page',
 'Attachment preview opens at the wrong size',
 'Reduce the spacing in project cards',
 'Show clear feedback while a file uploads',
 'Remember selected filters when navigating back',
 'Update the welcome message for new teammates'
);
