import { createBrowserClient } from '@supabase/ssr'

// Environment configuration with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rakasbppvvwmjqtytnkg.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJha2FzYnBwdnZ3bWpxdHl0bmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzE0NDcsImV4cCI6MjA3NTYwNzQ0N30.lsEwja6Vs3v-Be_Z1yeNOQtj4X-zmvp0wQ9_dgATC6s'

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createClient()