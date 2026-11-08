// Checks only paths eligible for Git; never prints the private values.
import { readFile, chmod } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { settings } from './demo-settings.mjs';
const { evaluator } = await settings({ evaluatorRequired: true });
assert.ok(execFileSync('git', ['check-ignore', '.env.evaluator.local'], { encoding: 'utf8' }).trim());
await chmod('.env.evaluator.local', 0o600);
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
for (const file of new Set(files)) {
  const contents = await readFile(file);
  assert.ok(!contents.includes(Buffer.from(evaluator.password)), `Private credential found in a Git-eligible file: ${file}`);
}
console.log('PASS: private evaluator settings are ignored, owner-readable only, and absent from Git-eligible files');
