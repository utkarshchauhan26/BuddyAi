"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { initializeStorage } from '@/lib/storage-cloud'
import { DatabaseService } from '@/lib/database'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (fullName: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    // Create Supabase client safely in the browser
    try {
      const supabaseClient = createClient()
      setSupabase(supabaseClient)
      
      // Get initial session
      const getInitialSession = async () => {
        const { data: { session } } = await supabaseClient.auth.getSession()
        setUser(session?.user ?? null)
        setLoading(false)
      }

      getInitialSession()

      // Listen for auth changes
      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
        (event, session) => {
          const user = session?.user ?? null
          setUser(user)
          setLoading(false)
          
          // Initialize storage with user ID
          initializeStorage(user?.id ?? null)
          
          // Migrate local data when user first logs in
          if (event === 'SIGNED_IN' && user) {
            setTimeout(() => {
              DatabaseService.migrateLocalStorageData(user.id)
            }, 1000) // Small delay to ensure user is fully set up
          }
        }
      )

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Error initializing Supabase:', error)
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not initialized' }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error: error?.message }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) return { error: 'Supabase not initialized' }
    
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          // For development - disable email confirmation
          emailRedirectTo: undefined
        }
      })
      
      if (error) {
        console.error('Signup error:', error)
        return { error: error.message }
      }
      
      // If signup successful but user needs to confirm email
      if (data.user && !data.session) {
        return { error: 'Please check your email to confirm your account. If you don\'t receive it, the email confirmation is disabled for this demo.' }
      }
      
      return { error: undefined }
    } catch (err: any) {
      console.error('Signup exception:', err)
      return { error: err.message || 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  const updateProfile = async (fullName: string) => {
    if (!supabase) return { error: 'Supabase not initialized' }
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    })
    return { error: error?.message }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}