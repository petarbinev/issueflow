// Run only after a fresh LOCAL Supabase reset. Never accepts a hosted API URL.
import { createClient } from '@supabase/supabase-js';
import { readFile,writeFile,mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,dirname,resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes,randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import assert from 'node:assert/strict';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const input=process.argv[2];
assert.ok(input,'Pass the private JSON output of supabase status -o json.');
const status=JSON.parse(await readFile(input,'utf8'));
function strings(value) {
  if(typeof value==='string') return [value];
  if(value && typeof value==='object') return Object.values(value).flatMap(strings);
  return [];
}
const values=strings(status);
const apiUrl=values.find(value=>{try{const url=new URL(value);return url.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(url.hostname)&&Number(url.port)>=1024&&['','/'].includes(url.pathname);}catch{return false;}});
assert.ok(apiUrl,'Only a local loopback HTTP Supabase API on an unprivileged port is accepted.');
const role=token=>{try{return JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString()).role;}catch{return null;}};
const serviceKey=values.find(value=>role(value)==='service_role') || values.find(value=>value.startsWith('sb_secret_'));
const publicKey=values.find(value=>role(value)==='anon') || values.find(value=>value.startsWith('sb_publishable_'));
assert.ok(serviceKey && publicKey,'Local CLI status must include service-role and public keys.');
const mask=value=>{if(process.env.GITHUB_ACTIONS==='true') console.log(`::add-mask::${value}`);};
for(const value of values.filter(value=>/^(eyJ|sb_secret_|sb_publishable_)/.test(value))) mask(value);
const accounts=Object.fromEntries(['admin','member'].map(name=>[name,{email:`${name}-${randomUUID()}@example.com`,password:randomBytes(32).toString('hex')}]));
Object.values(accounts).forEach(account=>mask(account.password));
const options={auth:{persistSession:false,autoRefreshToken:false}};
const service=createClient(apiUrl,serviceKey,options);
const admin=createClient(apiUrl,publicKey,options), member=createClient(apiUrl,publicKey,options);
const checked=async query=>{const result=await query;if(result.error)throw new Error(result.error.message);return result.data;};
const privateDir=await mkdtemp(join(tmpdir(),'issueflow-local-smoke-'));
const run=promisify(execFile);
try {
  for(const table of ['profiles','user_roles','projects','issues','comments','attachments','issue_activity']) {
    const rows=await checked(service.from(table).select('*').limit(1));
    assert.equal(rows.length,0,`Fresh reset must leave ${table} empty before account bootstrap.`);
  }
  const bucket=await checked(service.storage.getBucket('issue-attachments'));
  assert.equal(bucket.public,false);
  const owner=(await checked(service.auth.admin.createUser({...accounts.admin,email_confirm:true,user_metadata:{display_name:'Fresh admin'}}))).user;
  await checked(service.from('user_roles').update({role:'admin',approved:true}).eq('user_id',owner.id).select().single());
  const signup=await checked(member.auth.signUp({...accounts.member,options:{data:{display_name:'Fresh member',role:'admin',approved:true}}}));
  assert.ok(signup.session,'Local config should permit registration without external SMTP.');
  const pending=await checked(member.rpc('workspace_status').single());
  assert.equal(pending.role,'member');assert.equal(pending.approved,false);
  assert.equal((await checked(member.from('projects').select('id'))).length,0);
  await checked(admin.auth.signInWithPassword(accounts.admin));
  await checked(admin.rpc('set_workspace_access',{target_user:signup.user.id,allow_access:true}));
  assert.equal((await checked(member.rpc('workspace_status').single())).approved,true);
  console.log('PASS: fresh migrations, private bucket, first-admin bootstrap, registration and pending approval.');
  await writeFile(join(privateDir,'.env.local'),`VITE_SUPABASE_URL=${JSON.stringify(apiUrl)}\nVITE_SUPABASE_PUBLISHABLE_KEY=${JSON.stringify(publicKey)}\n`,{mode:0o600});
  await writeFile(join(privateDir,'.env.evaluator.local'),Object.entries(accounts).flatMap(([name,account])=>[`${name.toUpperCase()}_EMAIL=${JSON.stringify(account.email)}`,`${name.toUpperCase()}_PASSWORD=${JSON.stringify(account.password)}`]).join('\n')+'\n',{mode:0o600});
  for(const script of ['seed-workspace.mjs','verify-hosted.mjs']) {
    const output=await run(process.execPath,[join(root,'scripts',script)],{cwd:privateDir,maxBuffer:1024*1024,timeout:120000});
    process.stdout.write(output.stdout);
  }
  assert.equal((await checked(admin.from('issues').select('id'))).length,12);
  assert.equal((await checked(admin.from('comments').select('id'))).length,16);
  assert.equal((await checked(admin.from('attachments').select('id'))).length,1);
  console.log('PASS: clean-stack sample workflows and real Auth/database/Storage permissions; no production backend contacted.');
} finally {
  await Promise.all([admin.auth.signOut({scope:'local'}),member.auth.signOut({scope:'local'})]);
  await rm(privateDir,{recursive:true,force:true});
}
