import { shell, notice } from '../components/shell.js';
import { supabase, configured } from './supabase.js';
import { escape } from '../utils/dom.js';
export async function page(title, subtitle, render, { publicPage = false, adminOnly = false } = {}) {
 shell(title,subtitle);
 try {
  if (!configured) throw new Error('Workspace configuration is missing. Add the Supabase settings to .env.local and restart the app.');
  const {data:{session},error} = await supabase.auth.getSession(); if(error) throw error;
  if (!session && !publicPage) { location.replace('/login.html'); return; }
  let role='member', approved=false;
  if(session) {
   document.querySelector('#account').innerHTML=`<span>${escape(session.user.user_metadata.display_name || 'Team member')}</span><button class="btn btn-sm btn-outline-secondary" id="logout">Sign out</button>`;
   document.querySelector('#account').setAttribute('aria-busy','false');
   document.querySelector('#logout').onclick=async()=>{const {error}=await supabase.auth.signOut(); if(error) notice(error.message); else location.assign('/login.html');};
   const result=await supabase.rpc('workspace_status').single(); if(result.error) throw result.error; role=result.data.role; approved=result.data.approved;
   document.querySelector('#admin-link').hidden=role!=='admin' || !approved;
  } else {
   document.querySelector('#account').innerHTML='<a href="/login.html">Sign in</a>';
   document.querySelector('#account').setAttribute('aria-busy','false');
  }
  if (session && !publicPage) {
   if (!approved) {
    document.querySelector('.page-heading .btn').hidden = true;
    document.querySelector('nav').hidden = true;
    document.querySelector('#page').innerHTML = '<section class="panel"><h2>Workspace approval required</h2><p>Your account is signed in. An administrator must approve workspace access before you can view projects, issues, or files.</p><p class="text-secondary mb-0">If your access was recently changed, sign out and sign in again.</p></section>';
    return;
   }
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
