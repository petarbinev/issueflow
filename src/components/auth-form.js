import { page, submit } from '../lib/page.js';
import { notice } from './shell.js';
import { login,register } from '../services/auth.js';
export function authForm(signup) {
 page(signup?'Create account':'Welcome back', 'A clear path from reported to resolved.', async()=>{
 document.querySelector('.page-heading .btn').hidden=true;
 document.querySelector('#page').innerHTML=`<section class="panel auth-panel"><div class="eyebrow mb-3">LET’S GET TO WORK</div><h2>${signup?'Join your team':'Sign in to IssueFlow'}</h2><p class="text-secondary mb-4">${signup?'Create an account and request workspace access.':'Your projects, conversations, and next steps.'}</p><form id="auth-form">${signup?'<label class="form-label" for="name">Display name</label><input class="form-control mb-3" id="name" name="name" required maxlength="80" autocomplete="name">':''}<label class="form-label" for="email">Email address</label><input class="form-control mb-3" id="email" name="email" type="email" required autocomplete="email"><label class="form-label" for="password">Password</label><input class="form-control mb-3" id="password" name="password" type="password" required minlength="8" autocomplete="${signup?'new-password':'current-password'}">${signup?'<label class="form-label" for="confirm">Confirm password</label><input class="form-control mb-3" id="confirm" name="confirm" type="password" required autocomplete="new-password">':''}<button class="btn btn-primary mt-2" type="submit">${signup?'Create account':'Sign in'} <i class="bi bi-arrow-right ms-2"></i></button></form><p class="mt-4 mb-0 text-center text-secondary">${signup?'Already have an account? <a href="/login.html">Sign in</a>':'New to the team? <a href="/register.html">Create an account</a>'}</p></section>`;
 submit(document.querySelector('form'),async fields=>{
 if(signup) {if(fields.get('password')!==fields.get('confirm')) throw new Error('Passwords do not match.'); const result=await register(fields.get('email'),fields.get('password'),fields.get('name').trim()); if(!result.session){notice('Check your email to confirm your account, then sign in. An administrator must approve workspace access.','success');return;}}
 else await login(fields.get('email'),fields.get('password'));
 location.assign('/index.html');
 });
 },{publicPage:true});
}
