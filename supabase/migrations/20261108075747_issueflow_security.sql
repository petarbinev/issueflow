create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.user_roles where user_id = auth.uid() and role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create function public.provision_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles(id,display_name) values(new.id, left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'Team member'),80));
 insert into public.user_roles(user_id,role) values(new.id,'member');
 return new;
end $$;
revoke all on function public.provision_user() from public;
create trigger provision_user after insert on auth.users for each row execute function public.provision_user();

-- Start with no implicit privileges, then expose only the required operations.
revoke all on public.profiles,public.user_roles,public.projects,public.issues,public.comments,public.attachments,public.issue_activity from anon,authenticated;
grant select on public.profiles,public.user_roles,public.projects,public.issues,public.comments,public.attachments,public.issue_activity to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant insert(key,name,description,created_by) on public.projects to authenticated;
grant update(name,description,archived) on public.projects to authenticated;
grant insert(project_id,title,description,status,priority,reporter_id,assignee_id) on public.issues to authenticated;
grant update(title,description,status,priority,assignee_id) on public.issues to authenticated;
grant delete on public.issues to authenticated;
grant usage,select on sequence public.issues_number_seq to authenticated;
grant insert(issue_id,author_id,body) on public.comments to authenticated;
grant update(body) on public.comments to authenticated;
grant delete on public.comments to authenticated;
grant insert(issue_id,uploader_id,storage_path,original_name,mime_type,size_bytes) on public.attachments to authenticated;
grant delete on public.attachments to authenticated;

create policy profiles_read on public.profiles for select to authenticated using(true);
create policy profiles_edit on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy roles_read on public.user_roles for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy projects_read on public.projects for select to authenticated using(true);
create policy projects_create on public.projects for insert to authenticated with check(public.is_admin() and created_by=auth.uid());
create policy projects_edit on public.projects for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy issues_read on public.issues for select to authenticated using(true);
create policy issues_create on public.issues for insert to authenticated with check(reporter_id=auth.uid() and exists(select 1 from public.projects where id=project_id and not archived));
create policy issues_edit on public.issues for update to authenticated using(reporter_id=auth.uid() or assignee_id=auth.uid() or public.is_admin()) with check(reporter_id=auth.uid() or assignee_id=auth.uid() or public.is_admin());
create policy issues_delete on public.issues for delete to authenticated using(reporter_id=auth.uid() or public.is_admin());
create policy comments_read on public.comments for select to authenticated using(true);
create policy comments_create on public.comments for insert to authenticated with check(author_id=auth.uid());
create policy comments_edit on public.comments for update to authenticated using(author_id=auth.uid() or public.is_admin()) with check(author_id=auth.uid() or public.is_admin());
create policy comments_delete on public.comments for delete to authenticated using(author_id=auth.uid() or public.is_admin());
create policy attachments_read on public.attachments for select to authenticated using(true);
create policy attachments_create on public.attachments for insert to authenticated with check(uploader_id=auth.uid() and storage_path like issue_id::text || '/' || auth.uid()::text || '/%' and exists(select 1 from storage.objects where bucket_id='issue-attachments' and name=storage_path and owner_id=auth.uid()::text));
create policy attachments_delete on public.attachments for delete to authenticated using((uploader_id=auth.uid() or public.is_admin()) and not exists(select 1 from storage.objects where bucket_id='issue-attachments' and name=storage_path));
create policy activity_read on public.issue_activity for select to authenticated using(true);

create function public.guard_issue() returns trigger language plpgsql set search_path = '' as $$
begin
 if tg_op='DELETE' then
  if exists(select 1 from storage.objects where bucket_id='issue-attachments' and split_part(name,'/',1)=old.id::text) then raise exception 'Remove all attachments before deleting this issue.'; end if;
  return old;
 end if;
 if tg_op='UPDATE' then
  if old.reporter_id<>auth.uid() and not public.is_admin() and
   (new.title is distinct from old.title or new.description is distinct from old.description or new.priority is distinct from old.priority or new.assignee_id is distinct from old.assignee_id) then raise exception 'Assignees may change status only.'; end if;
  new.updated_at=now();
 end if;
 return new;
end $$;
revoke all on function public.guard_issue() from public;
create trigger guard_issue before update or delete on public.issues for each row execute function public.guard_issue();

create function public.record_activity() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.issue_activity(issue_id,actor_id,action,details) values(new.id,auth.uid(),case when tg_op='INSERT' then 'Created issue' else 'Updated issue' end,jsonb_build_object('status',new.status,'priority',new.priority,'assignee_id',new.assignee_id));
 return new;
end $$;
revoke all on function public.record_activity() from public;
create trigger issue_activity after insert or update on public.issues for each row execute function public.record_activity();

create function public.set_user_role(target_user uuid, new_role text) returns void language plpgsql security definer set search_path = '' as $$
begin
 -- Serialize role management so concurrent demotions cannot remove all admins.
 perform pg_advisory_xact_lock(781213);
 if not public.is_admin() then raise exception 'Administrator access required.'; end if;
 if new_role not in ('member','admin') then raise exception 'Invalid role.'; end if;
 if not exists(select 1 from public.user_roles where user_id=target_user) then raise exception 'User not found.'; end if;
 if new_role='member' and exists(select 1 from public.user_roles where user_id=target_user and role='admin') and (select count(*) from public.user_roles where role='admin')<=1 then raise exception 'The last administrator cannot be demoted.'; end if;
 update public.user_roles set role=new_role where user_id=target_user;
end $$;
revoke all on function public.set_user_role(uuid,text) from public;
grant execute on function public.set_user_role(uuid,text) to authenticated;
