import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
export const publicDemo = { email: 'member@issueflow.example', password: 'IssueFlowDemo!2026' };
export async function settings({ evaluatorRequired = false } = {}) {
  const backend = parseEnv(await readFile('.env.local', 'utf8'));
  let privateSettings = {};
  try { privateSettings = parseEnv(await readFile('.env.evaluator.local', 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const evaluator = {
    email: process.env.EVALUATOR_EMAIL || privateSettings.EVALUATOR_EMAIL,
    password: process.env.EVALUATOR_PASSWORD || privateSettings.EVALUATOR_PASSWORD,
  };
  if (evaluatorRequired && (!evaluator.email || !evaluator.password)) {
    throw new Error('Set private evaluator credentials in the ignored .env.evaluator.local file.');
  }
  if (evaluator.password === publicDemo.password) throw new Error('The evaluator must use a unique private password.');
  return { backend, evaluator };
}
