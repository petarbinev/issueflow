import { escape, badge } from '../utils/dom.js';
export function issueRows(issues) {
 if(!issues.length) return '<div class="empty-state">No issues here yet. Create an issue to get things moving.</div>';
 return issues.map(issue=>`<div class="issue-row"><span class="issue-key">${escape(issue.projects?.key)}-${issue.number}</span><div class="issue-title"><a href="/issue.html?id=${issue.id}">${escape(issue.title)}</a><small>${escape(issue.projects?.name)} <span class="mx-1">·</span> ${escape(issue.assignee?.display_name || 'Unassigned')}</small></div>${badge(issue.priority)}${badge(issue.status)}<a href="/issue.html?id=${issue.id}" aria-label="View ${escape(issue.title)}"><i class="bi bi-arrow-up-right"></i></a></div>`).join('');
}
