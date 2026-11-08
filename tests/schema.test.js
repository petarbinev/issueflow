import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
test('schema rebuilds with seven related tables and rejects invalid records', async () => {
 const db = new PGlite();
 try {
 await db.exec('create schema auth; create table auth.users (id uuid primary key);');
 await db.exec(await readFile(new URL('../supabase/migrations/20261108075544_issueflow_schema.sql',import.meta.url),'utf8'));
 const tables = await db.query("select tablename from pg_tables where schemaname='public'");
 assert.equal(tables.rows.length,7);
 await assert.rejects(db.exec("insert into public.profiles values ('00000000-0000-0000-0000-000000000001','Unknown',now())"), /foreign key/);
 await db.exec("insert into auth.users values ('00000000-0000-0000-0000-000000000001'); insert into public.profiles(id,display_name) values ('00000000-0000-0000-0000-000000000001','Member');");
 await assert.rejects(db.exec("insert into public.user_roles values ('00000000-0000-0000-0000-000000000001','owner')"), /check constraint/);
 } finally { await db.close(); }
});
