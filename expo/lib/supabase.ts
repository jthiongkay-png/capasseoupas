import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

console.log('[Supabase] URL present:', !!supabaseUrl, 'Key present:', !!supabaseAnonKey);
console.log('[Supabase] URL value:', supabaseUrl ? supabaseUrl.substring(0, 40) + '...' : 'EMPTY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] WARNING: Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Network requests will fail.');
}

export const supabase = createClient(
  supabaseUrl || 'https://ygxlsbychpvvftfzfkeh.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlneGxzYnljaHB2dmZ0Znpma2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNTIxMTAsImV4cCI6MjA5MDcyODExMH0.sAHifri5AekciFmhJmG916EjWlbGgCS__F0-v0WOnOg',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  }
);

console.log('[Supabase] Client initialized successfully');
