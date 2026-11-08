// Dedicated demo backend only. Never prints credentials, sessions, or access tokens.
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import { settings, publicDemo } from './demo-settings.mjs';
const { backend, evaluator } = await settings({ evaluatorRequired: true });
const client = () => createClient(backend.VITE_SUPABASE_URL, backend.VITE_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const demo = client(), admin = client(), guest = client();
const checked = async query => {
  const result = await query;
  if (result.error) throw new Error(result.error.message);
  return result.data;
};
const denied = async query => {
  const result = await query;
  assert.ok(result.error || result.data?.length === 0, 'Expected operation to be denied');
};
try {
  await checked(demo.auth.signInWithPassword(publicDemo));
  await checked(admin.auth.signInWithPassword(evaluator));
  const uid = (await demo.auth.getUser()).data.user.id;
  const aid = (await admin.auth.getUser()).data.user.id;
  assert.notEqual(uid, aid);
  for (const email of ['admin@issueflow.example', 'reviewer@issueflow.example']) {
    const retired = client();
    await denied(retired.auth.signInWithPassword({ email, password: publicDemo.password }));
  }
  await denied(guest.from('issues').select('*'));
  await denied(demo.rpc('set_user_role', { target_user: uid, new_role: 'admin' }));
  await denied(admin.rpc('set_user_role', { target_user: uid, new_role: 'admin' }));
  await denied(admin.rpc('set_user_role', { target_user: aid, new_role: 'member' }));
  await denied(demo.from('projects').insert({ key: 'BAD', name: 'Forbidden', created_by: uid }));
  // An Auth API call bypasses our UI, so verify the database credential lock.
  const mutation = await demo.auth.updateUser({ password: 'PublicDemoMutationProbe!2026' });
  if (!mutation.error) {
    await demo.auth.updateUser({ password: publicDemo.password });
    throw new Error('The public demo password was unexpectedly mutable.');
  }
  console.log('PASS: private admin login, retired-account bans, fixed demo credentials and role restrictions');
  const seeded = await checked(demo.from('issues').select('id,reporter_id,assignee_id,title').eq('title', 'Login button stays disabled after a failed attempt').single());
  assert.notEqual(seeded.reporter_id, uid);
  assert.notEqual(seeded.assignee_id, uid);
  await denied(demo.from('issues').update({ title: seeded.title }).eq('id', seeded.id).select());
  const project = (await checked(demo.from('projects').select('id').eq('key', 'WEB').single())).id;
  const fixture = await checked(admin.from('issues').insert({
    project_id: project, title: `Verification ${Date.now()}`, reporter_id: aid, assignee_id: uid,
  }).select().single());
  let demoIssue;
  try {
    await denied(demo.from('issues').update({ title: 'Tampered' }).eq('id', fixture.id).select());
    await checked(demo.from('issues').update({ status: 'Resolved' }).eq('id', fixture.id).select().single());
    await denied(demo.from('issues').update({ reporter_id: uid }).eq('id', fixture.id).select());
    const comment = await checked(admin.from('comments').insert({
      issue_id: fixture.id, author_id: aid, body: 'Verified discussion',
    }).select().single());
    await denied(demo.from('comments').update({ body: 'Tampered' }).eq('id', comment.id).select());
    demoIssue = await checked(demo.from('issues').insert({
      project_id: project, title: `Demo ownership ${Date.now()}`, reporter_id: uid,
    }).select().single());
    await checked(demo.from('issues').update({ title: 'Demo owner can edit own issue' }).eq('id', demoIssue.id).select().single());
    const path = `${fixture.id}/${uid}/${crypto.randomUUID()}`, body = 'IssueFlow file integrity check';
    await checked(demo.storage.from('issue-attachments').upload(path, new Blob([body], { type: 'text/plain' }), { contentType: 'text/plain' }));
    try {
      const metadata = await checked(demo.from('attachments').insert({
        issue_id: fixture.id, uploader_id: uid, storage_path: path,
        original_name: 'verification.txt', mime_type: 'text/plain', size_bytes: body.length,
      }).select().single());
      const downloaded = await checked(admin.storage.from('issue-attachments').download(path));
      assert.equal(await downloaded.text(), body);
      await denied(guest.storage.from('issue-attachments').download(path));
      await denied(admin.from('issues').delete().eq('id', fixture.id).select());
      await checked(demo.storage.from('issue-attachments').remove([path]));
      await checked(demo.from('attachments').delete().eq('id', metadata.id).select().single());
    } finally { await admin.storage.from('issue-attachments').remove([path]); }
    console.log('PASS: member ownership/status, comments and private file lifecycle');
  } finally {
    if (demoIssue) await checked(admin.from('issues').delete().eq('id', demoIssue.id));
    await checked(admin.from('issues').delete().eq('id', fixture.id));
  }
} finally {
  await Promise.all([demo.auth.signOut(), admin.auth.signOut()]);
}
console.log('PASS: hosted verification complete; temporary issues removed');
