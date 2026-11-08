import { supabase } from '../lib/supabase.js';
import { result } from './data.js';
export const comments=async id=>(await result(supabase.from('comments').select('*,profiles(display_name)').eq('issue_id',id).order('created_at'))).data;
export const activity=async id=>(await result(supabase.from('issue_activity').select('*,profiles(display_name)').eq('issue_id',id).order('created_at',{ascending:false}).limit(50))).data;
export const addComment=(issue_id,author_id,body)=>result(supabase.from('comments').insert({issue_id,author_id,body}));
export const editComment=(id,body)=>result(supabase.from('comments').update({body}).eq('id',id).select().single());
export const removeComment=async id=>{const {data}=await result(supabase.from('comments').delete().eq('id',id).select('id'));if(!data.length)throw new Error('Comment could not be removed.');};
