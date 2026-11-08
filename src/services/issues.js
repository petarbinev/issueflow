import { supabase } from '../lib/supabase.js';
import { result } from './data.js';
export const createIssue=async fields=>(await result(supabase.from('issues').insert(fields).select('id').single())).data;
export const updateIssue=async(id,fields)=>(await result(supabase.from('issues').update(fields).eq('id',id).select('id').single())).data;
export const deleteIssue=async id=>{const {data}=await result(supabase.from('issues').delete().eq('id',id).select('id')); if(!data.length) throw new Error('You do not have permission to delete this issue.');};
