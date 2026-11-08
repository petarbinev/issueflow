import { page } from '../lib/page.js';
import { issue } from '../services/data.js';
import { detail } from '../components/issue-detail.js';
import { discussion } from '../components/discussion.js';
page('Issue details','The full picture, in one place.',async context=>{
 const id=new URLSearchParams(location.search).get('id'); if(!id) throw new Error('No issue was selected. Open an issue from the issue list.');
 const current=await issue(id); detail(current,context); await discussion(current,context);
});
