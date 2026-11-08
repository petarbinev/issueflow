// Provision one fictional example file in the dedicated demo project.
import {createClient} from '@supabase/supabase-js';
import {readFile} from 'node:fs/promises';
import { settings } from './settings.mjs';
const { backend: env, member } = await settings({ accountsRequired: true });
const api=createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const check=async query=>{const r=await query;if(r.error)throw new Error(r.error.message);return r.data;};
const {user}=await check(api.auth.signInWithPassword(member));
const issue=await check(api.from('issues').select('id').eq('title','Login button stays disabled after a failed attempt').single());
const existing=await check(api.from('attachments').select('id').eq('issue_id',issue.id).eq('original_name','sample-evidence.txt'));
if(!existing.length){
 const contents=await readFile('public/sample-evidence.txt');const path=`${issue.id}/${user.id}/${crypto.randomUUID()}`;
 await check(api.storage.from('issue-attachments').upload(path,contents,{contentType:'text/plain'}));
 try{await check(api.from('attachments').insert({issue_id:issue.id,uploader_id:user.id,storage_path:path,original_name:'sample-evidence.txt',mime_type:'text/plain',size_bytes:contents.byteLength}));}
 catch(error){await api.storage.from('issue-attachments').remove([path]);throw error;}
 console.log('Created sample issue attachment.');
}else console.log('Sample attachment already exists.');
await api.auth.signOut();
