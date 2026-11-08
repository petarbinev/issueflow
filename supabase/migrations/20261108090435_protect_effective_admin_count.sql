-- Count only effective private administrators, excluding reserved demo identities.
create or replace function public.set_user_role(target_user uuid,new_role text) returns void language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(781213);
 if not public.is_admin() then raise exception 'Administrator access required.'; end if;
 if new_role is null or new_role not in ('member','admin') then raise exception 'Invalid role.'; end if;
 if new_role='admin' and exists(select 1 from issueflow_private.demo_accounts where user_id=target_user) then raise exception 'Public demo and retired accounts cannot become administrators.'; end if;
 if not exists(select 1 from public.user_roles where user_id=target_user) then raise exception 'User not found.'; end if;
 if new_role='member' and exists(select 1 from public.user_roles where user_id=target_user and role='admin') and (select count(*) from public.user_roles r where r.role='admin' and not exists(select 1 from issueflow_private.demo_accounts d where d.user_id=r.user_id))<=1 then raise exception 'The last administrator cannot be demoted.'; end if;
 update public.user_roles set role=new_role where user_id=target_user;
end $$;
revoke all on function public.set_user_role(uuid,text) from public,anon,authenticated;
grant execute on function public.set_user_role(uuid,text) to authenticated;

