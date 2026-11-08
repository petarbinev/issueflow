-- Assignment is shared workspace triage. Other issue edits retain ownership checks.
alter policy issues_edit on public.issues
using ((select public.has_workspace_access()))
with check ((select public.has_workspace_access()));

create or replace function public.guard_issue() returns trigger
language plpgsql set search_path='' as $$
begin
 if tg_op='DELETE' then
  if exists(select 1 from storage.objects where bucket_id='issue-attachments' and split_part(name,'/',1)=old.id::text) then
   raise exception 'Remove all attachments before deleting this issue.';
  end if;
  return old;
 end if;
 if new.assignee_id is not null and auth.uid() is not null then
  if tg_op='INSERT' or new.assignee_id is distinct from old.assignee_id then
   if not exists(select 1 from public.active_members() m where m.id=new.assignee_id) then
    raise exception 'Choose an approved workspace member as the assignee.';
   end if;
  end if;
 end if;
 if tg_op='UPDATE' then
  if old.reporter_id<>auth.uid() and not public.is_admin() then
   if new.title is distinct from old.title or new.description is distinct from old.description or new.priority is distinct from old.priority then
    raise exception 'Only the reporter or an administrator can edit issue content.';
   end if;
   if new.status is distinct from old.status and old.assignee_id is distinct from auth.uid() then
    raise exception 'Only the reporter, assignee or an administrator can update status.';
   end if;
  end if;
  new.updated_at=now();
 end if;
 return new;
end $$;
revoke all on function public.guard_issue() from public,anon,authenticated;
drop trigger guard_issue on public.issues;
create trigger guard_issue before insert or update or delete on public.issues
for each row execute function public.guard_issue();
