import { page,submit } from '../lib/page.js';
import { issue,projects,people } from '../services/data.js';
import { createIssue,updateIssue } from '../services/issues.js';
import { options,escape } from '../utils/dom.js';
import { issueTitle,priorities,statuses } from '../utils/validation.js';
const id=new URLSearchParams(location.search).get('id');
page(id?'Edit issue':'New issue','Turn a problem into a clear next step.',async({user,role})=>{
 const [allProjects,members,current]=await Promise.all([projects(),people(),id?issue(id):null]);
 if(current && current.reporter_id!==user.id && role!=='admin') throw new Error('Only the reporter or an administrator can edit this issue.');
 document.querySelector('.page-heading .btn').hidden=true;
 document.querySelector('#page').innerHTML=`<section class="panel" style="max-width:850px"><form id="issue-form"><div class="row g-4"><div class="col-md-7"><label class="form-label" for="project">Project</label><select class="form-select" id="project" name="project_id" required ${id?'disabled':''}>${options(allProjects.filter(p=>!p.archived||p.id===current?.project_id),current?.project_id,'Select a project')}</select></div><div class="col-md-5"><label class="form-label" for="priority">Priority</label><select class="form-select" id="priority" name="priority" required>${options(priorities,current?.priority || 'Medium','Select priority')}</select></div><div class="col-12"><label class="form-label" for="title">Title</label><input class="form-control" id="title" name="title" required minlength="3" maxlength="160" placeholder="A short, specific summary" value="${escape(current?.title)}"></div><div class="col-12"><label class="form-label" for="description">Description</label><textarea class="form-control" id="description" name="description" rows="8" maxlength="20000" placeholder="What happened? What did you expect? How can we reproduce it?">${escape(current?.description)}</textarea></div><div class="col-md-6"><label class="form-label" for="assignee">Assign to</label><select class="form-select" id="assignee" name="assignee_id">${options(members,current?.assignee_id,'Unassigned')}</select></div><div class="col-md-6"><label class="form-label" for="status">Status</label><select class="form-select" id="status" name="status" required>${options(statuses,current?.status || 'Open','Select status')}</select></div></div><div class="mt-4 d-flex gap-3"><button class="btn btn-primary" type="submit">${id?'Save changes':'Create issue'}</button><a class="btn btn-outline-secondary" href="${id?`/issue.html?id=${id}`:'/issues.html'}">Cancel</a></div></form></section>`;
 let dirty=false; const warn=event=>{if(dirty){event.preventDefault();event.returnValue='';}};
 addEventListener('beforeunload',warn); document.querySelector('form').addEventListener('input',()=>{dirty=true;});
 submit(document.querySelector('form'),async data=>{
 const fields={title:issueTitle(data.get('title')),description:data.get('description'),priority:data.get('priority'),status:data.get('status'),assignee_id:data.get('assignee_id') || null};
 const saved=id?await updateIssue(id,fields):await createIssue({...fields,project_id:data.get('project_id'),reporter_id:user.id});
 dirty=false; location.assign(`/issue.html?id=${saved.id}`);
 });
});
