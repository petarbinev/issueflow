import { comments,activity,addComment,editComment,removeComment } from '../services/discussion.js';
import { escape,date,options } from '../utils/dom.js';
import { submit } from '../lib/page.js';
import { notice } from './shell.js';
import { statuses } from '../utils/validation.js';
import { updateIssue } from '../services/issues.js';
export async function discussion(current,context) {
 const [entries,history]=await Promise.all([comments(current.id),activity(current.id)]);
 document.querySelector('#discussion').innerHTML=`<section class="panel"><h2 class="mb-4">Discussion <span class="text-secondary">${entries.length}</span></h2>${entries.map(c=>`<article class="comment"><div class="d-flex justify-content-between"><strong>${escape(c.profiles?.display_name)}</strong><small>${date(c.created_at)}</small></div><p>${escape(c.body)}</p>${c.author_id===context.user.id || context.role==='admin'?`<button class="btn btn-sm btn-outline-secondary" data-edit="${c.id}">Edit</button> <button class="btn btn-sm btn-outline-danger" data-remove="${c.id}">Delete</button>`:''}</article>`).join('')}<form id="comment-form" class="mt-4"><label class="form-label" for="comment">Add a comment</label><textarea class="form-control mb-3" rows="3" id="comment" name="body" required maxlength="5000" placeholder="Share an update or ask a question…"></textarea><button class="btn btn-primary" type="submit">Post comment</button></form></section>`;
 document.querySelector('#history').innerHTML=`<section class="panel"><h2 class="mb-3">Activity</h2>${history.map(a=>`<div class="comment"><strong class="small">${escape(a.action)}</strong><p class="small text-secondary mb-1">${escape(a.profiles?.display_name || 'Team member')} · ${escape(a.details.status)}</p><small>${date(a.created_at)}</small></div>`).join('')}</section>`;
 submit(document.querySelector('#comment-form'),async data=>{await addComment(current.id,context.user.id,data.get('body').trim());await discussion(current,context);});
 document.querySelectorAll('[data-edit]').forEach(button=>button.onclick=async()=>{
 const comment=entries.find(c=>c.id===button.dataset.edit), body=prompt('Edit comment',comment.body);if(body===null)return;
 try {await editComment(comment.id,body.trim());await discussion(current,context);}catch(error){notice(error.message);}
 });
 document.querySelectorAll('[data-remove]').forEach(button=>button.onclick=async()=>{
 if(!confirm('Delete this comment?'))return;
 try{await removeComment(button.dataset.remove);await discussion(current,context);}catch(error){notice(error.message);}
 });
 if(current.reporter_id===context.user.id||current.assignee_id===context.user.id||context.role==='admin') {
 document.querySelector('#status-control').innerHTML=`<form id="status-form"><label class="form-label" for="new-status">Update status</label><select id="new-status" class="form-select mb-3" name="status" required>${options(statuses,current.status,'Choose status')}</select><button class="btn btn-outline-primary" type="submit">Update status</button></form>`;
 submit(document.querySelector('#status-form'),async data=>{await updateIssue(current.id,{status:data.get('status')});location.reload();});
 }
}
