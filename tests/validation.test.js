import test from 'node:test';
import assert from 'node:assert/strict';
import { issueTitle, validateFile } from '../src/utils/validation.js';
test('titles reject blank and overlong input and trim valid input', () => {
  assert.throws(() => issueTitle('  '));
  assert.throws(() => issueTitle('x'.repeat(161)));
  assert.equal(issueTitle('  Broken login  '), 'Broken login');
});
test('uploads reject unsafe types, empty files, and oversized files', () => {
  assert.throws(() => validateFile({type:'text/html', size:1}));
  assert.throws(() => validateFile({type:'text/plain', size:0}));
  assert.throws(() => validateFile({type:'text/plain', size:5242881}));
  assert.doesNotThrow(() => validateFile({type:'application/pdf', size:5242880}));
});
