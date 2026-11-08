import { shell, notice } from '../components/shell.js';
import { supabase, configured } from './supabase.js';
import { escape } from '../utils/dom.js';
export async function page(title, subtitle, render, { publicPage = false, adminOnly = false } = {}) {
 shell(title,subtitle);
 try {
  if (!configured) throw new Error('Workspace configuration is missing. Add the Supabase settings to .env.local and restart the app.');
  const {data:{session},error} = await supabase.auth.getSession(); if(error) throw error;
  if (!session && !publicPage) { location.replace('/login.html'); return; }
  let role='member';
  if(session) {
   const result=await supabase.from('user_roles').select('role').eq('user_id',session.user.id).single(); if(result.error) throw result.error; role=result.data.role;
   document.querySelector('#admin-link').hidden=role!=='admin';
   document.querySelector('#account').innerHTML=`<span>${escape(session.user.user_metadata.display_name || 'Team member')}</span><button class="btn btn-sm btn-outline-secondary" id="logout">Sign out</button>`;
   document.querySelector('#logout').onclick=async()=>{const {error}=await supabase.auth.signOut(); if(error) notice(error.message); else location.assign('/login.html');};
  }
  if(adminOnly && role!=='admin') throw new Error('Administrator access is required to view this page.');
  await render({user:session?.user,role});
 } catch(error) { document.querySelector('#page').innerHTML='<div class="empty-state">This page could not load. Refresh to try again.</div>'; notice(error.message); }
}
export function submit(form, action) {
 form.addEventListener('submit',async event=>{
  event.preventDefault(); if(!form.reportValidity()) return;
  const button=form.querySelector('[type=submit]'); button.disabled=true;
  try {await action(new FormData(form));} catch(error){notice(error.message);} finally {button.disabled=false;}
 });
}
