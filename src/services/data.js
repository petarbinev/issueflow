import { supabase } from '../lib/supabase.js';
export async function result(query) {const {data,error,count}=await query; if(error) throw error; return {data,count};}
export const projects = async()=> (await result(supabase.from('projects').select('*').order('created_at'))).data;
export const people = async()=> (await result(supabase.rpc('active_members'))).data;
export const issue = async id => (await result(supabase.from('issues').select('*,projects(key,name),reporter:profiles!reporter_id(display_name),assignee:profiles!assignee_id(display_name)').eq('id',id).single())).data;
export async function listIssues(filters = {}, page = 1) {
 const filtered=query=>{
  for(const key of ['project_id','status','priority','assignee_id']) if(filters[key]) query=query.eq(key,filters[key]);
  if(filters.q) query=query.ilike('title',`%${filters.q.replace(/[%_\\]/g,'\\$&')}%`);
  return query;
 };
 const response=await filtered(supabase.from('issues').select('*,projects(key,name),assignee:profiles!assignee_id(display_name)',{count:'exact'}).order('created_at',{ascending:false}).order('id').range((page-1)*10,page*10-1));
 if(response.error?.code==='PGRST103') {
  // A saved page can disappear after deletions. Recover its current total so
  // the page controller can redirect to the final available page.
  const totals=await result(filtered(supabase.from('issues').select('id',{count:'exact',head:true})));
  return {data:[],count:totals.count};
 }
 return result(response);
}
