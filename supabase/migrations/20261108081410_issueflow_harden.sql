-- Supabase default privileges may grant EXECUTE directly to API roles.
revoke all on function public.is_admin() from public,anon,authenticated;
revoke all on function public.provision_user() from public,anon,authenticated;
revoke all on function public.guard_issue() from public,anon,authenticated;
revoke all on function public.record_activity() from public,anon,authenticated;
revoke all on function public.set_user_role(uuid,text) from public,anon,authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.set_user_role(uuid,text) to authenticated;
-- Cache identity and role checks once per statement rather than once per row.
do $$ declare p record; q text; c text; command text; begin
 for p in select * from pg_policies where schemaname='public' and tablename in ('profiles','user_roles','projects','issues','comments','attachments','issue_activity') loop
  q=replace(replace(p.qual,'auth.uid()','(select auth.uid())'),'public.is_admin()','(select public.is_admin())');
  c=replace(replace(p.with_check,'auth.uid()','(select auth.uid())'),'public.is_admin()','(select public.is_admin())');
  command=format('alter policy %I on public.%I',p.policyname,p.tablename);
  if q is not null then command=command || ' using (' || q || ')'; end if;
  if c is not null then command=command || ' with check (' || c || ')'; end if;
  execute command;
 end loop;
end $$;
