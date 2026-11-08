import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';

export async function settings({ accountsRequired = false } = {}) {
  const backend = parseEnv(await readFile('.env.local', 'utf8'));
  let local = {};
  try {
    local = parseEnv(await readFile('.env.evaluator.local', 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const account = prefix => ({
    email: process.env[`${prefix}_EMAIL`] || local[`${prefix}_EMAIL`],
    password: process.env[`${prefix}_PASSWORD`] || local[`${prefix}_PASSWORD`],
  });
  const evaluator = account('EVALUATOR');
  const member = account('MEMBER');
  if (accountsRequired && [evaluator, member].some(item => !item.email || !item.password)) {
    throw new Error('Set private administrator and member credentials in .env.evaluator.local.');
  }
  if (accountsRequired && (member.email === evaluator.email || member.password === evaluator.password)) {
    throw new Error('The evaluator accounts must have separate identities and passwords.');
  }
  return { backend, evaluator, member };
}
