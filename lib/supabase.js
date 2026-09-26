import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fnchqtrsjrluhhejamlj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuY2hxdHJzanJsdWhoZWphbWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MjIwNzIsImV4cCI6MjEwNTk5ODA3Mn0.o0ZjyusUHSoFif8lJ5Z9jrGJWozN03-bbFiQiiNESBs
';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);