import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('workspace approval, sessions, roles and ownership are enforced by PostgreSQL', async () => {
  const db = new PGlite();
  const owner='00000000-0000-0000-0000-000000000001';
  const member='00000000-0000-0000-0000-000000000002';
  const pending='00000000-0000-0000-0000-000000000003';
  const retired='00000000-0000-0000-0000-000000000004';
  const project='10000000-0000-0000-0000-000000000001';
  try {
    await db.exec(`
      create role anon; create role authenticated;
      alter default privileges in schema public grant execute on functions to anon,authenticated;
      create schema auth; create schema storage;
      create table auth.users(id uuid primary key,email text,email_change text,encrypted_password text,
        phone text,phone_change text,banned_until timestamptz,raw_user_meta_data jsonb default '{}'::jsonb);
      create table auth.sessions(id uuid primary key,user_id uuid,not_after timestamptz);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      create function auth.jwt() returns jsonb language sql stable as $$select jsonb_build_object('session_id',auth.uid()::text)$$;
      grant usage on schema auth to authenticated;
      grant execute on function auth.uid(),auth.jwt() to authenticated;
      create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text,owner_id text);
      grant usage on schema storage to authenticated; grant select,insert on storage.objects to authenticated;
      alter table storage.objects enable row level security;
      create policy test_read on storage.objects for select to authenticated using(true);
      create policy test_insert on storage.objects for insert to authenticated with check(true);
    `);
    for (const file of (await readdir('supabase/migrations')).sort()) {
      if (!file.includes('storage')) await db.exec(await readFile(`supabase/migrations/${file}`,'utf8'));
    }
    await db.exec(`
      insert into auth.users(id,raw_user_meta_data) values ('${owner}','{}'),('${member}','{}'),('${pending}','{"role":"admin","approved":true}'),('${retired}','{}');
      insert into auth.sessions(id,user_id) select id,id from auth.users;
      update public.user_roles set role='admin',approved=true where user_id='${owner}';
      update public.user_roles set approved=true where user_id='${member}';
      insert into issueflow_private.demo_accounts values ('${retired}','blocked');
      insert into public.projects(id,key,name,created_by) values ('${project}','APP','Application','${owner}');
    `);
    const act = async (id,sql) => {
      await db.exec(`reset role; set request.jwt.claim.sub='${id}'; set role authenticated;`);
      return db.exec(sql);
    };
    await act(pending,'select public.workspace_status()');
    assert.equal((await db.query('select approved from public.workspace_status()')).rows[0].approved,false);
    assert.equal((await db.query('select count(*)::int as n from public.projects')).rows[0].n,0);
    await assert.rejects(db.exec(`insert into public.issues(project_id,title,reporter_id) values ('${project}','Forbidden request','${pending}')`),/row-level security/);
    await assert.rejects(db.exec(`select public.set_workspace_access('${pending}',true)`),/Administrator/);
    await assert.rejects(db.exec(`select public.set_user_role('${pending}','admin')`),/Administrator/);
    await assert.rejects(db.exec("insert into storage.objects(bucket_id,name) values ('issue-attachments','blocked')"),/row-level security/);
    await act(owner,`select public.set_workspace_access('${pending}',true)`);
    await act(pending,'select * from public.active_members()');
    assert.equal((await db.query('select count(*)::int as n from public.projects')).rows[0].n,1);
    const active=(await db.query('select id from public.active_members()')).rows.map(row=>row.id);
    assert.ok(active.includes(owner) && active.includes(member) && active.includes(pending));
    assert.ok(!active.includes(retired));
    await act(owner,`insert into public.issues(project_id,title,reporter_id,assignee_id) values ('${project}','Login failure','${owner}','${member}')`);
    await assert.rejects(act(member,"update public.issues set title='Tampered'"),/status only/);
    await act(member,"update public.issues set status='Resolved'");
    await assert.rejects(act(member,`update public.issues set reporter_id='${member}'`),/permission denied/);
    await assert.rejects(act(member,`update public.user_roles set approved=true`),/permission denied/);
    await assert.rejects(act(member,'select * from public.workspace_users()'),/Administrator/);
    await assert.rejects(act(owner,`select public.set_user_role('${owner}','member')`),/last administrator/);
    await assert.rejects(act(owner,`select public.set_workspace_access('${owner}',false)`),/last administrator/);
    await assert.rejects(act(owner,`select public.set_workspace_access('${retired}',true)`),/Retired/);
    await act(owner,`select public.set_user_role('${pending}','admin')`);
    await act(owner,`select public.set_user_role('${pending}','member')`);
    await act(owner,`select public.set_workspace_access('${pending}',false)`);
    await act(pending,'select public.has_workspace_access()');
    assert.equal((await db.query('select public.has_workspace_access() as allowed')).rows[0].allowed,false);
    await db.exec(`reset role; delete from auth.sessions where user_id='${member}';`);
    await act(member,'select public.has_workspace_access()');
    assert.equal((await db.query('select public.has_workspace_access() as allowed')).rows[0].allowed,false);
    assert.equal((await db.query('select count(*)::int as n from public.issues')).rows[0].n,0);
    await db.exec('reset role;');
    assert.equal((await db.query("select has_function_privilege('anon','public.has_workspace_access()','execute') as allowed")).rows[0].allowed,false);
    assert.equal((await db.query("select has_function_privilege('authenticated','public.record_activity()','execute') as allowed")).rows[0].allowed,false);
    await db.exec('set role anon;');
    await assert.rejects(db.query('select * from public.issues'),/permission denied/);
  } finally { await db.close(); }
});
