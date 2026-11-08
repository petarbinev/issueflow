import { page } from '../lib/page.js';
import { projects } from '../services/data.js';
import { escape,badge } from '../utils/dom.js';
page('Projects','Every project. One clear view.',async()=>{
 const items=await projects();
 document.querySelector('#page').innerHTML=items.length?`<div class="row g-4">${items.map(p=>`<div class="col-md-6 col-xl-4"><article class="project-card"><span class="project-key">${escape(p.key)}</span><h2>${escape(p.name)}</h2><p>${escape(p.description)}</p><div class="d-flex justify-content-between align-items-center">${badge(p.archived?'Archived':'Active')}<a href="/issues.html?project_id=${p.id}">View issues <i class="bi bi-arrow-right ms-1"></i></a></div></article></div>`).join('')}</div>`:'<div class="empty-state">No projects yet. An administrator can create the first project.</div>';
});
