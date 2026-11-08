-- Fictional business data only; no accounts or credentials are provisioned here.
-- Bootstrap a private approved administrator first. With no approved admin this is a no-op.
insert into public.projects(key,name,description,created_by)
select v.key,v.name,v.description,u.user_id from (values ('WEB','Website experience','Make every interaction feel effortless.'),('MOB','Mobile application','A reliable companion for teams on the move.')) v(key,name,description)
cross join public.user_roles u where u.user_id=(select user_id from public.user_roles where role='admin' and approved order by user_id limit 1) on conflict(key) do nothing;
-- After provisioning the two private accounts, run npm run seed:workspace.
-- That command creates realistic issues, assignments, cross-user comments and files
-- through authenticated API calls so activity records show the actual actor.
