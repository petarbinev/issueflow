import { escape,badge,date,options } from '../utils/dom.js';
import { deleteIssue,updateIssue } from '../services/issues.js';
import { submit } from '../lib/page.js';
import { notice } from './shell.js';
export function detail(current,{user,role},members) {
 const canEdit=current.reporter_id===user.id || role==='admin';
 document.querySelector('#page').innerHTML=`<div class="row g-4"><div class="col-lg-8"><section class="panel"><div class="d-flex gap-2 mb-3">${badge(current.status)}${badge(current.priority)}<span class="issue-key ms-auto">${escape(current.projects?.key)}-${current.number}</span></div><h2 class="fs-4 mb-4">${escape(current.title)}</h2><p class="description">${escape(current.description || 'No description provided.')}</p>${canEdit?`<div class="d-flex gap-2 mt-4"><a class="btn btn-outline-primary" href="/issue-form.html?id=${current.id}">Edit issue</a><button class="btn btn-outline-danger" id="delete-issue">Delete issue</button></div>`:''}</section><div id="discussion"></div><div id="files"></div></div><div class="col-lg-4"><section class="panel"><h2 class="mb-4">Issue details</h2><dl><dt>Project</dt><dd class="text-secondary mb-3">${escape(current.projects?.name)}</dd><dt>Reported by</dt><dd class="text-secondary mb-3">${escape(current.reporter?.display_name)}</dd><dt>Assignee</dt><dd id="issue-assignee" class="text-secondary mb-3">${escape(current.assignee?.display_name || 'Unassigned')}</dd><dt>Created</dt><dd class="text-secondary">${date(current.created_at)}</dd></dl><div id="status-control"></div></section><div id="history"></div></div></div>`;
 document.querySelector('#delete-issue')?.addEventListener('click',async event=>{
 if(!confirm('Delete this issue and its discussion permanently? Remove attachments first.'))return;
 event.target.disabled=true;
 try{await deleteIssue(current.id);location.assign('/issues.html');}catch(error){notice(error.message);event.target.disabled=false;}
 });
 if(canEdit) {
  const assignee=document.querySelector('#issue-assignee');
  assignee.innerHTML=`<form id="assignee-form"><label class="visually-hidden" for="new-assignee">Assignee</label><select id="new-assignee" class="form-select mb-2" name="assignee_id">${options(members,current.assignee_id,'Unassigned')}</select><button class="btn btn-sm btn-outline-primary" type="submit">Save assignee</button></form>`;
  submit(document.querySelector('#assignee-form'),async fields=>{await updateIssue(current.id,{assignee_id:fields.get('assignee_id') || null});location.reload();});
 } else {
  document.querySelector('#issue-assignee').insertAdjacentHTML('beforeend','<small class="d-block mt-2">The reporter or an administrator can change this assignment.</small>');
 }
}
