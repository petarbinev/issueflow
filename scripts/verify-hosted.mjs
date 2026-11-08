// Run only against the dedicated evaluation backend. Credentials stay in local config.
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import { settings } from './settings.mjs';
const { backend, evaluator, member: memberAccount } = await settings({ accountsRequired: true });
const client = () => createClient(backend.VITE_SUPABASE_URL, backend.VITE_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const member = client(), admin = client(), guest = client();
const checked = async query => {
  const result = await query;
  if (result.error) throw new Error(result.error.message);
  return result.data;
};
const denied = async query => {
  const result = await query;
  assert.ok(result.error || result.data?.length === 0, 'Expected operation to be denied');
};
let fixture, ownIssue, memberId;
try {
  await checked(member.auth.signInWithPassword(memberAccount));
  await checked(admin.auth.signInWithPassword(evaluator));
  const uid = (await member.auth.getUser()).data.user.id;
  memberId = uid;
  const aid = (await admin.auth.getUser()).data.user.id;
  assert.notEqual(uid, aid);
  const status = await checked(member.rpc('workspace_status').single());
  assert.equal(status.approved, true);
  assert.equal(status.role, 'member');
  await denied(guest.from('issues').select('*'));
  await denied(member.rpc('set_user_role', { target_user: uid, new_role: 'admin' }));
  await denied(member.rpc('set_workspace_access', { target_user: uid, allow_access: true }));
  await denied(admin.rpc('set_user_role', { target_user: aid, new_role: 'member' }));
  await denied(admin.rpc('set_workspace_access', { target_user: aid, allow_access: false }));
  await denied(member.from('projects').insert({ key: 'BAD', name: 'Forbidden', created_by: uid }));
  const active = await checked(member.rpc('active_members'));
  const inventory = await checked(admin.rpc('workspace_users'));
  const retired = inventory.filter(item => item.retired).map(item => item.user_id);
  assert.ok(active.every(item => !retired.includes(item.id)));
  // Exercise approval through an existing private fixture and restore access in finally.
  await checked(admin.rpc('set_workspace_access', { target_user: uid, allow_access: false }));
  assert.equal((await checked(member.rpc('workspace_status').single())).approved, false);
  await denied(member.from('projects').select('*'));
  await denied(member.from('comments').select('*'));
  await denied(member.rpc('workspace_users'));
  await checked(admin.rpc('set_workspace_access', { target_user: uid, allow_access: true }));
  await checked(admin.rpc('set_user_role', { target_user: uid, new_role: 'admin' }));
  await checked(member.rpc('workspace_users'));
  await checked(admin.rpc('set_user_role', { target_user: uid, new_role: 'member' }));
  console.log('PASS: private logins, approval/suspension, role changes, active assignees and admin safeguards');
  const project = (await checked(member.from('projects').select('id').eq('key', 'WEB').single())).id;
  fixture = await checked(admin.from('issues').insert({
    project_id: project, title: `Verification ${Date.now()}`, reporter_id: aid, assignee_id: uid,
  }).select().single());
  await denied(member.from('issues').update({ title: 'Tampered' }).eq('id', fixture.id).select());
  await checked(member.from('issues').update({ status: 'Resolved' }).eq('id', fixture.id).select().single());
  await denied(member.from('issues').update({ reporter_id: uid }).eq('id', fixture.id).select());
  const comment = await checked(admin.from('comments').insert({
    issue_id: fixture.id, author_id: aid, body: 'Verified discussion',
  }).select().single());
  await denied(member.from('comments').update({ body: 'Tampered' }).eq('id', comment.id).select());
  ownIssue = await checked(member.from('issues').insert({
    project_id: project, title: `Ownership ${Date.now()}`, reporter_id: uid,
  }).select().single());
  await checked(member.from('issues').update({ title: 'Member can edit own issue' }).eq('id', ownIssue.id).select().single());
  const path = `${fixture.id}/${uid}/${crypto.randomUUID()}`, body = 'IssueFlow file integrity check';
  await checked(member.storage.from('issue-attachments').upload(path, new Blob([body], { type: 'text/plain' }), { contentType: 'text/plain' }));
  try {
    const metadata = await checked(member.from('attachments').insert({
      issue_id: fixture.id, uploader_id: uid, storage_path: path,
      original_name: 'verification.txt', mime_type: 'text/plain', size_bytes: body.length,
    }).select().single());
    const downloaded = await checked(admin.storage.from('issue-attachments').download(path));
    assert.equal(await downloaded.text(), body);
    await denied(guest.storage.from('issue-attachments').download(path));
    await denied(admin.from('issues').delete().eq('id', fixture.id).select());
    await checked(member.storage.from('issue-attachments').remove([path]));
    await checked(member.from('attachments').delete().eq('id', metadata.id).select().single());
  } finally { await admin.storage.from('issue-attachments').remove([path]); }
  console.log('PASS: member ownership/status, comments and file lifecycle');
} finally {
  const adminSession = await admin.auth.getSession();
  if (memberId && adminSession.data.session) {
    await checked(admin.rpc('set_workspace_access', { target_user: memberId, allow_access: true }));
    await checked(admin.rpc('set_user_role', { target_user: memberId, new_role: 'member' }));
  }
  if (ownIssue) await checked(admin.from('issues').delete().eq('id', ownIssue.id));
  if (fixture) await checked(admin.from('issues').delete().eq('id', fixture.id));
  await Promise.all([member.auth.signOut(), admin.auth.signOut()]);
}
console.log('PASS: hosted verification complete; private fixture state restored');
