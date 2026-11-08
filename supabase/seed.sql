-- Dedicated fictional evaluation accounts only. Never run against unrelated data.
-- All three accounts use the public demo password: IssueFlowDemo!2026
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,email_change_token_new,email_change)
select '00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated',v.email,extensions.crypt('IssueFlowDemo!2026',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}'::jsonb,jsonb_build_object('display_name',v.name),now(),now(),'','','',''
from (values ('admin@issueflow.example','Alex Morgan'),('member@issueflow.example','Jamie Rivera'),('reviewer@issueflow.example','Sam Chen')) as v(email,name)
where not exists(select 1 from auth.users u where u.email=v.email);
insert into auth.identities(id,provider_id,user_id,identity_data,provider,created_at,updated_at)
select gen_random_uuid(),id::text,id,jsonb_build_object('sub',id::text,'email',email,'email_verified',true),'email',now(),now() from auth.users
where email in ('admin@issueflow.example','member@issueflow.example','reviewer@issueflow.example')
on conflict(provider_id,provider) do nothing;
update public.user_roles set role='admin' where user_id=(select id from auth.users where email='admin@issueflow.example');
insert into public.projects(key,name,description,created_by)
select v.key,v.name,v.description,u.id from (values ('WEB','Website experience','Make every interaction feel effortless.'),('MOB','Mobile application','A reliable companion for teams on the move.')) v(key,name,description)
cross join auth.users u where u.email='admin@issueflow.example' on conflict(key) do nothing;
select set_config('request.jwt.claim.sub',(select id::text from auth.users where email='member@issueflow.example'),true);
insert into public.issues(project_id,title,description,status,priority,reporter_id,assignee_id)
select p.id,v.title,'Steps to reproduce: open the relevant screen and follow the standard user journey. Expected: clear, consistent behavior. Actual: the reported behavior needs investigation.',v.status,v.priority,r.id,a.id
from (values
('WEB','Login button stays disabled after a failed attempt','Open','High'),
('WEB','Improve keyboard focus in the navigation','In Progress','Medium'),
('WEB','Exported report is missing the project name','Open','Critical'),
('WEB','Add a helpful empty state to search results','Resolved','Low'),
('WEB','Status labels overlap on narrow screens','In Progress','High'),
('WEB','Dashboard counts do not refresh after returning','Open','Medium'),
('WEB','Document browser support in the help page','Closed','Low'),
('MOB','Attachment preview opens at the wrong size','Open','High'),
('MOB','Reduce the spacing in project cards','In Progress','Low'),
('MOB','Show clear feedback while a file uploads','Resolved','Medium'),
('MOB','Remember selected filters when navigating back','Open','Medium'),
('MOB','Update the welcome message for new teammates','Closed','Low')
) v(key,title,status,priority)
join public.projects p on p.key=v.key
cross join auth.users r cross join auth.users a
where r.email='member@issueflow.example' and a.email='reviewer@issueflow.example'
and not exists(select 1 from public.issues i where i.title=v.title);
insert into public.comments(issue_id,author_id,body)
select i.id,u.id,'Thanks for reporting this. I can reproduce it and will investigate the next step.' from public.issues i cross join auth.users u
where u.email='reviewer@issueflow.example' and not exists(select 1 from public.comments c where c.issue_id=i.id);
