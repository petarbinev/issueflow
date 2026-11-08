-- Fictional business data only; no accounts or credentials are provisioned here.
-- Bootstrap a private approved administrator first. With no approved admin this is a no-op.
insert into public.projects(key,name,description,created_by)
select v.key,v.name,v.description,u.user_id from (values ('WEB','Website experience','Make every interaction feel effortless.'),('MOB','Mobile application','A reliable companion for teams on the move.')) v(key,name,description)
cross join public.user_roles u where u.user_id=(select user_id from public.user_roles where role='admin' and approved order by user_id limit 1) on conflict(key) do nothing;
select set_config('request.jwt.claim.sub',coalesce((select user_id::text from public.user_roles where role='admin' and approved order by user_id limit 1),''),true);
insert into public.issues(project_id,title,description,status,priority,reporter_id,assignee_id)
select p.id,v.title,'Steps to reproduce: open the relevant screen and follow the standard user journey. Expected: clear, consistent behavior. Actual: the reported behavior needs investigation.',v.status,v.priority,r.user_id,r.user_id
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
cross join public.user_roles r
where r.user_id=(select user_id from public.user_roles where role='admin' and approved order by user_id limit 1)
and not exists(select 1 from public.issues i where i.title=v.title);
insert into public.comments(issue_id,author_id,body)
select i.id,u.user_id,'Thanks for reporting this. I can reproduce it and will investigate the next step.' from public.issues i cross join public.user_roles u
where u.user_id=(select user_id from public.user_roles where role='admin' and approved order by user_id limit 1) and not exists(select 1 from public.comments c where c.issue_id=i.id);
