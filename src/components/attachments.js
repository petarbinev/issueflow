import { attachments,upload,download,remove } from '../services/attachments.js';
import { escape } from '../utils/dom.js';
import { submit } from '../lib/page.js';
import { notice } from './shell.js';
export async function files(current,context) {
 const entries=await attachments(current.id);
 document.querySelector('#files').innerHTML=`<section class="panel"><h2 class="mb-3">Attachments</h2>${entries.map(f=>`<div class="attachment"><i class="bi bi-file-earmark-text fs-5 text-secondary"></i><span>${escape(f.original_name)}<small class="d-block text-secondary">${Math.ceil(f.size_bytes/1024)} KB</small></span><button class="btn btn-sm btn-outline-primary" data-download="${f.id}">Download</button>${f.uploader_id===context.user.id||context.role==='admin'?`<button class="btn btn-sm btn-outline-danger" data-delete-file="${f.id}">Delete</button>`:''}</div>`).join('')}<form id="upload-form" class="mt-4"><label class="form-label" for="upload">Attach evidence</label><input class="form-control" type="file" id="upload" name="file" required accept="image/png,image/jpeg,application/pdf,text/plain"><p class="text-secondary small mt-2">PNG, JPEG, PDF or plain text · Up to 5 MB</p><button class="btn btn-outline-primary" type="submit"><i class="bi bi-upload me-2"></i>Upload file</button></form></section>`;
 submit(document.querySelector('#upload-form'),async data=>{await upload(current.id,context.user.id,data.get('file'));await files(current,context);notice('Attachment uploaded.','success');});
 document.querySelectorAll('[data-download]').forEach(button=>button.onclick=async()=>{try{await download(entries.find(f=>f.id===button.dataset.download));}catch(error){notice(error.message);}});
 document.querySelectorAll('[data-delete-file]').forEach(button=>button.onclick=async()=>{if(!confirm('Delete this attachment?'))return;button.disabled=true;try{await remove(entries.find(f=>f.id===button.dataset.deleteFile));await files(current,context);notice('Attachment removed.','success');}catch(error){notice(error.message);button.disabled=false;}});
}
