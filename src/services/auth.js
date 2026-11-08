import { supabase } from '../lib/supabase.js';
export async function login(email,password) {const {data,error}=await supabase.auth.signInWithPassword({email,password}); if(error) throw error; return data;}
export async function register(email,password,display_name) {const {data,error}=await supabase.auth.signUp({email,password,options:{data:{display_name},emailRedirectTo:`${location.origin}/index.html`}}); if(error) throw error; return data;}
