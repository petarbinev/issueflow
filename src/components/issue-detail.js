import { escape,badge,date } from '../utils/dom.js';
import { deleteIssue } from '../services/issues.js';
import { notice } from './shell.js';
export function detail(current,{user,role}) {
 const canEdit=current.reporter_id===user.id || role==='admin';
 document.querySelector('#page').innerHTML=`<div class="row g-4"><div class="col-lg-8"><section class="panel"><div class="d-flex gap-2 mb-3">${badge(current.status)}${badge(current.priority)}<span class="issue-key ms-auto">${escape(current.projects?.key)}-${current.number}</span></div><h2 class="fs-4 mb-4">${escape(current.title)}</h2><p class="description">${escape(current.description || 'No description provided.')}</p>${canEdit?`<div class="d-flex gap-2 mt-4"><a class="btn btn-outline-primary" href="/issue-form.html?id=${current.id}">Edit issue</a><button class="btn btn-outline-danger" id="delete-issue">Delete issue</button></div>`:''}</section><div id="discussion"></div><div id="files"></div></div><div class="col-lg-4"><section class="panel"><h2 class="mb-4">Issue details</h2><dl><dt>Project</dt><dd class="text-secondary mb-3">${escape(current.projects?.name)}</dd><dt>Reported by</dt><dd class="text-secondary mb-3">${escape(current.reporter?.display_name)}</dd><dt>Assignee</dt><dd class="text-secondary mb-3">${escape(current.assignee?.display_name || 'Unassigned')}</dd><dt>Created</dt><dd class="text-secondary">${date(current.created_at)}</dd></dl><div id="status-control"></div></section><div id="history"></div></div></div>`;
 document.querySelector('#delete-issue')?.addEventListener('click',async event=>{
 if(!confirm('Delete this issue and its discussion permanently? Remove attachments first.'))return;
 event.target.disabled=true;
 try{await deleteIssue(current.id);location.assign('/issues.html');}catch(error){notice(error.message);event.target.disabled=false;}
 });
}
