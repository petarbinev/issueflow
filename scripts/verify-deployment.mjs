import assert from 'node:assert/strict';
const base=process.argv[2] || 'https://issueflow-petarbinev.netlify.app';
const pages=['index','login','register','projects','issues','issue','issue-form','admin'];
await Promise.all(pages.map(async page=>{
 const response=await fetch(`${base}/${page}.html`);
 assert.equal(response.status,200,`${page} must be reachable directly`);
 const html=await response.text();assert.match(html,/IssueFlow/);assert.match(html,/type="module"/);
 console.log(`PASS: ${page}.html`);
}));
const missing=await fetch(`${base}/this-page-does-not-exist`);assert.equal(missing.status,404,'Missing routes must return 404');
console.log('PASS: real 404 response');
