-- All new accounts require approval; no login credentials are part of this migration.
alter table public.user_roles add column approved boolean not null default false;
update public.user_roles r set approved=true where r.role='admin'
and not exists(select 1 from issueflow_private.demo_accounts d where d.user_id=r.user_id);
-- The former shared member will be rotated privately outside this migration.
-- Its default-false approval prevents access during that rotation.
delete from issueflow_private.demo_accounts where access_mode='member';

create function public.has_workspace_access() returns boolean language sql stable security definer set search_path='' as $$
 select exists(
  select 1 from public.user_roles r join auth.users u on u.id=r.user_id
  join auth.sessions s on s.user_id=u.id and s.id=nullif(auth.jwt()->>'session_id','')::uuid
  where r.user_id=auth.uid() and r.approved and (u.banned_until is null or u.banned_until<now())
  and (s.not_after is null or s.not_after>now())
  and not exists(select 1 from issueflow_private.demo_accounts d where d.user_id=r.user_id and d.access_mode='blocked')
 );
$$;
revoke all on function public.has_workspace_access() from public,anon,authenticated;
grant execute on function public.has_workspace_access() to authenticated;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select public.has_workspace_access() and exists(select 1 from public.user_roles where user_id=auth.uid() and role='admin');
$$;
revoke all on function public.is_admin() from public,anon,authenticated;
grant execute on function public.is_admin() to authenticated;

do $$ declare t text; begin
 foreach t in array array['profiles','user_roles','projects','issues','comments','attachments','issue_activity'] loop
 execute format('create policy workspace_approval on public.%I as restrictive for all to authenticated using ((select public.has_workspace_access())) with check ((select public.has_workspace_access()))',t);
 end loop;
end $$;
create policy workspace_approval on storage.objects as restrictive for all to authenticated
using(bucket_id<>'issue-attachments' or (select public.has_workspace_access()))
with check(bucket_id<>'issue-attachments' or (select public.has_workspace_access()));

create function public.workspace_status() returns table(role text,approved boolean) language sql stable security definer set search_path='' as $$
 select r.role,public.has_workspace_access() from public.user_roles r where r.user_id=auth.uid();
$$;
revoke all on function public.workspace_status() from public,anon,authenticated;
grant execute on function public.workspace_status() to authenticated;

create or replace function public.provision_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,display_name) values(new.id,left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'Team member'),80));
 insert into public.user_roles(user_id,role,approved) values(new.id,'member',false);
 return new;
end $$;
revoke all on function public.provision_user() from public,anon,authenticated;

create function public.active_members() returns table(id uuid,display_name text) language sql stable security definer set search_path='' as $$
 select p.id,p.display_name from public.profiles p join public.user_roles r on r.user_id=p.id join auth.users u on u.id=p.id
 where public.has_workspace_access() and r.approved and (u.banned_until is null or u.banned_until<now())
 and not exists(select 1 from issueflow_private.demo_accounts d where d.user_id=p.id and d.access_mode='blocked')
 order by p.display_name;
$$;
revoke all on function public.active_members() from public,anon,authenticated;
grant execute on function public.active_members() to authenticated;

create function public.workspace_users() returns table(user_id uuid,display_name text,email text,role text,approved boolean,retired boolean) language plpgsql stable security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'Administrator access required.'; end if;
 return query select p.id,p.display_name,u.email::text,r.role,r.approved,
 ((u.banned_until is not null and u.banned_until>now()) or exists(select 1 from issueflow_private.demo_accounts d where d.user_id=p.id and d.access_mode='blocked'))
 from public.profiles p join public.user_roles r on r.user_id=p.id join auth.users u on u.id=p.id order by p.created_at;
end $$;
revoke all on function public.workspace_users() from public,anon,authenticated;
grant execute on function public.workspace_users() to authenticated;

create function issueflow_private.effective_admin_count() returns bigint language sql stable security definer set search_path='' as $$
 select count(*) from public.user_roles r join auth.users u on u.id=r.user_id where r.role='admin' and r.approved
 and (u.banned_until is null or u.banned_until<now())
 and not exists(select 1 from issueflow_private.demo_accounts d where d.user_id=r.user_id and d.access_mode='blocked');
$$;
revoke all on function issueflow_private.effective_admin_count() from public,anon,authenticated;

create function public.set_workspace_access(target_user uuid,allow_access boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(781213);
 if not public.is_admin() then raise exception 'Administrator access required.'; end if;
 if allow_access is null then raise exception 'Approval choice is required.'; end if;
 if not exists(select 1 from public.user_roles where user_id=target_user) then raise exception 'User not found.'; end if;
 if exists(select 1 from issueflow_private.demo_accounts where user_id=target_user and access_mode='blocked') then raise exception 'Retired accounts cannot be approved.'; end if;
 if not allow_access and exists(select 1 from public.user_roles where user_id=target_user and role='admin' and approved)
 and issueflow_private.effective_admin_count()<=1 then raise exception 'The last administrator cannot be suspended.'; end if;
 update public.user_roles set approved=allow_access where user_id=target_user;
end $$;
revoke all on function public.set_workspace_access(uuid,boolean) from public,anon,authenticated;
grant execute on function public.set_workspace_access(uuid,boolean) to authenticated;

create or replace function public.set_user_role(target_user uuid,new_role text) returns void language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(781213);
 if not public.is_admin() then raise exception 'Administrator access required.'; end if;
 if new_role is null or new_role not in ('member','admin') then raise exception 'Invalid role.'; end if;
 if not exists(select 1 from public.user_roles where user_id=target_user and approved) then raise exception 'Approve the member before changing their role.'; end if;
 if exists(select 1 from issueflow_private.demo_accounts where user_id=target_user and access_mode='blocked') then raise exception 'Retired accounts cannot change roles.'; end if;
 if new_role='member' and exists(select 1 from public.user_roles where user_id=target_user and role='admin')
 and issueflow_private.effective_admin_count()<=1 then raise exception 'The last administrator cannot be demoted.'; end if;
 update public.user_roles set role=new_role where user_id=target_user;
end $$;
revoke all on function public.set_user_role(uuid,text) from public,anon,authenticated;
grant execute on function public.set_user_role(uuid,text) to authenticated;
