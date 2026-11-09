import { page } from '../lib/page.js';
import { supabase } from '../lib/supabase.js';
import { result,listIssues } from '../services/data.js';
import { issueRows } from '../components/issues.js';
import { statuses } from '../utils/validation.js';
import { escape,date } from '../utils/dom.js';
page('Overview', 'A little clarity. A lot of progress.',async({user})=>{
 const [counts,assigned,recent]=await Promise.all([
 Promise.all(statuses.map(status=>result(supabase.from('issues').select('id',{count:'exact',head:true}).eq('status',status)))),
 listIssues({assignee_id:user.id}),
 result(supabase.from('issue_activity').select('*,issues(title),profiles(display_name)').order('created_at',{ascending:false}).limit(5))]);
 document.querySelector('#page').innerHTML=`<div class="row g-3 mb-4">${statuses.map((status,i)=>`<div class="col-6 col-xl-3"><div class="stat"><span class="stat-icon"><i class="bi bi-${['record-circle','clock-history','check2-circle','archive'][i]}"></i></span><span class="stat-label">${status}</span><div class="stat-value">${counts[i].count}</div><small>Across all projects</small></div></div>`).join('')}</div><section class="panel"><div class="panel-head"><h2 class="mb-0">Assigned to you</h2><a href="/issues.html?assignee_id=${user.id}">View all <i class="bi bi-arrow-right ms-1"></i></a></div>${issueRows(assigned.data,'No issues are assigned to you. Open an issue and select yourself as its assignee.')}</section><section class="panel"><div class="panel-head"><h2>Recent activity</h2><span class="text-secondary small">The latest from your team</span></div>${recent.data.length?recent.data.map(a=>`<div class="issue-row"><span class="stat-icon"><i class="bi bi-activity"></i></span><div class="issue-title"><a href="/issue.html?id=${a.issue_id}">${escape(a.issues?.title)}</a><small>${escape(a.profiles?.display_name || 'Team member')} · ${escape(a.action)}</small></div><small class="text-secondary">${date(a.created_at)}</small></div>`).join(''):'<p class="text-secondary">Activity appears when your team creates or updates issues.</p>'}</section>`;
});
