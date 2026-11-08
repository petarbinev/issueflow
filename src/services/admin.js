import { supabase } from '../lib/supabase.js';
import { result } from './data.js';
export const createProject=fields=>result(supabase.from('projects').insert(fields).select().single());
export const updateProject=(id,fields)=>result(supabase.from('projects').update(fields).eq('id',id).select().single());
export const setRole=(target_user,new_role)=>result(supabase.rpc('set_user_role',{target_user,new_role}));

export const workspaceUsers = async () => (await result(supabase.rpc('workspace_users'))).data;
export const setAccess = (target_user, allow_access) => result(supabase.rpc('set_workspace_access', { target_user, allow_access }));
