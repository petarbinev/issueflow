import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { readdir } from 'node:fs/promises';
test('RLS and column guards prevent escalation, cross-user edits and last-admin removal', async () => {
 const db = new PGlite();
 const a='00000000-0000-0000-0000-000000000001', b='00000000-0000-0000-0000-000000000002', admin='00000000-0000-0000-0000-000000000003';
 try {
 await db.exec(`create role anon; create role authenticated; create schema auth; create schema storage;
 create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}'::jsonb);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text,owner_id text);
 grant usage on schema storage to authenticated; grant select on storage.objects to authenticated;`);
 for(const file of (await readdir('supabase/migrations')).sort()) if(!file.includes('storage')) await db.exec(await readFile(`supabase/migrations/${file}`,'utf8'));
 await db.exec(`insert into auth.users(id,raw_user_meta_data) values ('${a}','{"role":"admin"}'),('${b}','{}'),('${admin}','{}'); update public.user_roles set role='admin' where user_id='${admin}';
 insert into public.projects(id,key,name,created_by) values ('10000000-0000-0000-0000-000000000001','APP','Application','${admin}');`);
 const act=async(id,sql)=>{await db.exec(`reset role; set request.jwt.claim.sub='${id}'; set role authenticated;`);return db.exec(sql);};
 await act(a,`insert into public.issues(project_id,title,reporter_id,assignee_id) values ('10000000-0000-0000-0000-000000000001','Login failure','${a}','${b}')`);
 await assert.rejects(act(a,`update public.user_roles set role='admin' where user_id='${a}'`),/permission denied/);
 await assert.rejects(act(a,`select public.set_user_role('${a}','admin')`),/Administrator/);
 await assert.rejects(act(b,"update public.issues set title='Tampered'"),/status only/);
 await act(b,"update public.issues set status='Resolved'");
 await assert.rejects(act(a,`update public.issues set reporter_id='${b}'`),/permission denied/);
 await assert.rejects(act(a,"insert into public.issue_activity(issue_id,action) values ('20000000-0000-0000-0000-000000000001','Forged')"),/permission denied/);
 await assert.rejects(act(admin,`select public.set_user_role('${admin}','member')`),/last administrator/);
 await act(admin,`select public.set_user_role('${a}','admin')`);
 await act(admin,`select public.set_user_role('${admin}','member')`);
 await db.exec('reset role; set role anon;');
 await assert.rejects(db.query('select * from public.issues'),/permission denied/);
 } finally {await db.close();}
});
