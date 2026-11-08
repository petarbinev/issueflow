// Checks only paths eligible for Git; never prints the private values.
import { readFile, chmod } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { settings } from './settings.mjs';
const { evaluator, member } = await settings({ accountsRequired: true });
assert.ok(execFileSync('git', ['check-ignore', '.env.evaluator.local'], { encoding: 'utf8' }).trim());
await chmod('.env.evaluator.local', 0o600);
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
for (const file of new Set(files)) {
  let contents;
  try { contents = await readFile(file); }
  catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  for (const account of [evaluator, member]) {
    assert.ok(!contents.includes(Buffer.from(account.password)), `Private credential found in a Git-eligible file: ${file}`);
  }
}
console.log('PASS: private evaluator settings are ignored, owner-readable only, and absent from Git-eligible files');
