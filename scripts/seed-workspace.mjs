// Uses real member/admin API flows; never provisions Auth accounts or fabricates history.
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { settings } from './settings.mjs';
import { legacyTitles, projects, scenarios } from './workspace-fixtures.mjs';

const { backend, admin: adminAccount, member: memberAccount } = await settings({ accountsRequired: true });
const api = () => createClient(backend.VITE_SUPABASE_URL, backend.VITE_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const actors = { admin: api(), member: api() }, ids = {};
const checked = async query => { const result = await query; if (result.error) throw new Error(result.error.message); return result.data; };
async function removeIssue(id) {
  const files = await checked(actors.admin.from('attachments').select('*').eq('issue_id', id));
  for (const file of files) {
    await checked(actors.admin.storage.from('issue-attachments').remove([file.storage_path]));
    await checked(actors.admin.from('attachments').delete().eq('id', file.id).select().single());
  }
  await checked(actors.admin.from('issues').delete().eq('id', id).select().single());
}
try {
  for (const [role, account] of Object.entries({ admin: adminAccount, member: memberAccount })) {
    ids[role] = (await checked(actors[role].auth.signInWithPassword(account))).user.id;
    const status = await checked(actors[role].rpc('workspace_status').single());
    assert.equal(status.role, role); assert.equal(status.approved, true);
  }
  if (process.argv.includes('--replace-legacy')) {
    const old = await checked(actors.admin.from('issues').select('id').in('title', legacyTitles));
    for (const issue of old) await removeIssue(issue.id);
    console.log(`Removed ${old.length} known legacy sample issues, including their sample discussion and files.`);
  }
  const projectIds = {};
  for (const project of projects) {
    let found = await checked(actors.admin.from('projects').select('id').eq('key', project.key).maybeSingle());
    if (!found) found = await checked(actors.admin.from('projects').insert({ ...project, created_by: ids.admin }).select('id').single());
    projectIds[project.key] = found.id;
  }
  const created = [];
  for (const scenario of scenarios) {
    const existing = await checked(actors.admin.from('issues').select('id').eq('project_id', projectIds[scenario.project]).eq('title', scenario.title).maybeSingle());
    if (existing) continue;
    const reporter = actors[scenario.reporter];
    const description = `Fictional product scenario for evaluation.\n\nSteps to reproduce\n${scenario.steps}\n\nExpected\n${scenario.expected}\n\nActual\n${scenario.actual}`;
    const issue = await checked(reporter.from('issues').insert({
      project_id: projectIds[scenario.project], title: scenario.title, description,
      priority: scenario.priority, reporter_id: ids[scenario.reporter],
    }).select('id').single());
    try {
      if (scenario.assignee) await checked(reporter.from('issues').update({ assignee_id: ids[scenario.assignee] }).eq('id', issue.id).select().single());
      const worker = actors[scenario.assignee || scenario.reporter];
      const transitions = scenario.status === 'Open' ? [] : ['In Progress', ...(scenario.status === 'In Progress' ? [] : ['Resolved']), ...(scenario.status === 'Closed' ? ['Closed'] : [])];
      for (const status of transitions) await checked(worker.from('issues').update({ status }).eq('id', issue.id).select().single());
      const responder = scenario.reporter === 'member' ? 'admin' : 'member';
      await checked(actors[responder].from('comments').insert({ issue_id: issue.id, author_id: ids[responder], body: scenario.reply }));
      if (scenario.followup) await checked(reporter.from('comments').insert({ issue_id: issue.id, author_id: ids[scenario.reporter], body: scenario.followup }));
      if (scenario.evidence) {
        const body = `Fictional reproduction notes\n\n${scenario.steps}\nExpected: ${scenario.expected}\nObserved: ${scenario.actual}\n`;
        const path = `${issue.id}/${ids[scenario.reporter]}/${randomUUID()}`;
        await checked(reporter.storage.from('issue-attachments').upload(path, new Blob([body], { type: 'text/plain' }), { contentType: 'text/plain' }));
        try {
          await checked(reporter.from('attachments').insert({ issue_id: issue.id, uploader_id: ids[scenario.reporter], storage_path: path, original_name: 'reproduction-notes.txt', mime_type: 'text/plain', size_bytes: new TextEncoder().encode(body).length }));
        } catch (error) { await reporter.storage.from('issue-attachments').remove([path]); throw error; }
      }
      created.push(issue.id);
    } catch (error) {
      try { await removeIssue(issue.id); }
      catch (cleanupError) { throw new Error(`${error.message}; cleanup failed for issue ${issue.id}: ${cleanupError.message}`); }
      throw error;
    }
  }
  const rows = await checked(actors.admin.from('issues').select('id,title,reporter_id,assignee_id,status').in('title', scenarios.map(item => item.title)));
  assert.equal(rows.length, scenarios.length);
  for (const scenario of scenarios) {
    const row = rows.find(item => item.title === scenario.title);
    if (!created.includes(row.id)) continue; // Preserve edits to existing evaluation scenarios.
    assert.equal(row.reporter_id, ids[scenario.reporter]); assert.equal(row.assignee_id, scenario.assignee ? ids[scenario.assignee] : null); assert.equal(row.status, scenario.status);
  }
  if (created.length) {
    const history = await checked(actors.admin.from('issue_activity').select('actor_id').in('issue_id', created));
    assert.ok(history.length >= created.length && history.every(item => Object.values(ids).includes(item.actor_id)));
  }
  console.log(`PASS: ${created.length} scenarios created through authenticated workflows; ${rows.length} scenarios available. Existing scenario edits were preserved.`);
} finally { await Promise.all(Object.values(actors).map(actor => actor.auth.signOut({ scope: 'local' }))); }
