import { supabase } from '../lib/supabase.js';
import { result } from './data.js';
import { validateFile } from '../utils/validation.js';
import { saveFile,deleteFile } from './file-transactions.js';
const bucket=()=>supabase.storage.from('issue-attachments');
export const attachments=async id=>(await result(supabase.from('attachments').select('*').eq('issue_id',id).order('created_at'))).data;
export async function upload(issueId,userId,file) {
 validateFile(file);
 const path=`${issueId}/${userId}/${crypto.randomUUID()}`;
 await saveFile({
  uploadObject:()=>result(bucket().upload(path,file,{contentType:file.type,upsert:false})),
  saveRecord:()=>result(supabase.from('attachments').insert({issue_id:issueId,uploader_id:userId,storage_path:path,original_name:file.name,mime_type:file.type,size_bytes:file.size})),
  findRecord:async()=>(await result(supabase.from('attachments').select('id').eq('storage_path',path).maybeSingle())).data,
  removeObject:()=>result(bucket().remove([path])),
 });
}
export async function download(file) {
 const {data,error}=await bucket().download(file.storage_path);if(error)throw error;
 const url=URL.createObjectURL(data),a=document.createElement('a');a.href=url;a.download=file.original_name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function remove(file) {
 await deleteFile({
  removeObject:()=>result(bucket().remove([file.storage_path])),
  removeRecord:async()=>(await result(supabase.from('attachments').delete().eq('id',file.id).select('id'))).data,
  recordExists:async()=>Boolean((await result(supabase.from('attachments').select('id').eq('id',file.id).maybeSingle())).data),
 });
}
