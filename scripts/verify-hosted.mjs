// Only run against the dedicated fictional IssueFlow evaluation project.
// Uses public demo accounts; never logs sessions or access tokens.
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const env=Object.fromEntries((await readFile('.env.local','utf8')).trim().split('\n').map(line=>line.split('=')));
const client=()=>createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const member=client(),reviewer=client(),admin=client(),guest=client();
const checked=async query=>{const r=await query;if(r.error)throw new Error(r.error.message);return r.data;};
const denied=async query=>{const r=await query;assert.ok(r.error || r.data?.length===0,'Expected operation to be denied');};
for(const [api,email] of [[member,'member'],[reviewer,'reviewer'],[admin,'admin']])await checked(api.auth.signInWithPassword({email:`${email}@issueflow.example`,password:'IssueFlowDemo!2026'}));
console.log('PASS: three demo accounts authenticate');
const uid=(await member.auth.getUser()).data.user.id,other=(await reviewer.auth.getUser()).data.user.id,aid=(await admin.auth.getUser()).data.user.id;
await denied(guest.from('issues').select('*'));
await denied(member.rpc('set_user_role',{target_user:uid,new_role:'admin'}));
await denied(admin.rpc('set_user_role',{target_user:aid,new_role:'member'}));
await denied(member.from('projects').insert({key:'BAD',name:'Forbidden',created_by:uid}));
console.log('PASS: guest access, self-promotion, project management and last-admin checks');
const project=(await checked(member.from('projects').select('id').eq('key','WEB').single())).id;
const issue=await checked(member.from('issues').insert({project_id:project,title:`Verification ${Date.now()}`,reporter_id:uid,assignee_id:other}).select().single());
try {
 await denied(reviewer.from('issues').update({title:'Tampered'}).eq('id',issue.id).select());
 await checked(reviewer.from('issues').update({status:'Resolved'}).eq('id',issue.id).select().single());
 await denied(member.from('issues').update({reporter_id:other}).eq('id',issue.id).select());
 const comment=await checked(member.from('comments').insert({issue_id:issue.id,author_id:uid,body:'Verified discussion'}).select().single());
 await denied(reviewer.from('comments').update({body:'Tampered'}).eq('id',comment.id).select());
 const path=`${issue.id}/${uid}/${crypto.randomUUID()}`,body='IssueFlow file integrity check';
 await checked(member.storage.from('issue-attachments').upload(path,new Blob([body],{type:'text/plain'}),{contentType:'text/plain'}));
 try {
 const metadata=await checked(member.from('attachments').insert({issue_id:issue.id,uploader_id:uid,storage_path:path,original_name:'verification.txt',mime_type:'text/plain',size_bytes:body.length}).select().single());
 const downloaded=await checked(reviewer.storage.from('issue-attachments').download(path));assert.equal(await downloaded.text(),body);
 await denied(guest.storage.from('issue-attachments').download(path));
 // A forbidden Storage delete can return success with zero removed objects.
 await reviewer.storage.from('issue-attachments').remove([path]);
 assert.equal(await (await checked(member.storage.from('issue-attachments').download(path))).text(),body);
 await denied(member.from('issues').delete().eq('id',issue.id).select());
 await checked(member.storage.from('issue-attachments').remove([path]));
 await checked(member.from('attachments').delete().eq('id',metadata.id).select().single());
 } finally {await member.storage.from('issue-attachments').remove([path]);}
 console.log('PASS: issue ownership/status, comments and private file lifecycle');
} finally {await checked(admin.from('issues').delete().eq('id',issue.id));}
for(const api of [member,reviewer,admin])await api.auth.signOut();
console.log('PASS: hosted verification complete; temporary issue removed');
