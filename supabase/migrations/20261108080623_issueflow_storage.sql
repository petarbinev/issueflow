insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('issue-attachments','issue-attachments',false,5242880,array['image/png','image/jpeg','application/pdf','text/plain']);
create policy issue_files_read on storage.objects for select to authenticated using(bucket_id='issue-attachments' and exists(select 1 from public.issues where id::text=split_part(name,'/',1)));
create policy issue_files_upload on storage.objects for insert to authenticated with check(bucket_id='issue-attachments' and split_part(name,'/',2)=auth.uid()::text and exists(select 1 from public.issues where id::text=split_part(name,'/',1)));
create policy issue_files_delete on storage.objects for delete to authenticated using(bucket_id='issue-attachments' and (owner_id=auth.uid()::text or public.is_admin()));
