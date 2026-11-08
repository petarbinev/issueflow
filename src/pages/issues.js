import { page } from '../lib/page.js';
import { projects,people,listIssues } from '../services/data.js';
import { options,escape } from '../utils/dom.js';
import { priorities,statuses } from '../utils/validation.js';
import { issueRows } from '../components/issues.js';
page('Issues','Capture the details. Focus on what matters.',async()=>{
 const params=new URLSearchParams(location.search), current=Math.max(1,Number.parseInt(params.get('page'),10)||1);
 const filters=Object.fromEntries(params), [allProjects,members,issues]=await Promise.all([projects(),people(),listIssues(filters,current)]);
 document.querySelector('#page').innerHTML=`<section class="panel"><form class="filters mb-4" aria-label="Filter issues"><input class="form-control" name="q" aria-label="Search issue titles" placeholder="Search issues…" maxlength="160" value="${escape(params.get('q'))}"><select class="form-select" name="project_id" aria-label="Project">${options(allProjects,params.get('project_id'))}</select><select class="form-select" name="status" aria-label="Status">${options(statuses,params.get('status'))}</select><select class="form-select" name="priority" aria-label="Priority">${options(priorities,params.get('priority'))}</select><select class="form-select" name="assignee_id" aria-label="Assignee">${options(members,params.get('assignee_id'))}</select><button class="btn btn-outline-primary" type="submit">Filter</button></form><div class="d-flex justify-content-between mb-3"><span class="text-secondary small">${issues.count} issues</span><a class="small" href="/issues.html">Clear filters</a></div>${issueRows(issues.data)}<div class="d-flex justify-content-between align-items-center mt-4" id="pagination"><span class="small text-secondary">Page ${current} of ${Math.max(1,Math.ceil(issues.count/10))}</span><div class="d-flex gap-2">${current>1?`<a class="btn btn-outline-secondary" href="${link(current-1)}">Previous</a>`:''}${current*10<issues.count?`<a class="btn btn-outline-secondary" href="${link(current+1)}">Next</a>`:''}</div></div></section>`;
 function link(next){const query=new URLSearchParams(params);query.set('page',next);return `?${escape(query.toString())}`;}
});
