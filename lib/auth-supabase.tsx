"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { User, AuthError } from '@supabase/supabase-js'
import { toast } from '@/hooks/use-toast'

// Check if we're in development mode
const isDev = process.env.NEXT_PUBLIC_DEV_MODE !== 'false'

// Mock user for development
const DEV_USER = {
  id: 'dev-user-123',
  email: 'dev@buddyai.com',
  user_metadata: {
    full_name: 'Dev User'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (fullName: string) => Promise<{ error?: string }>
  resetPassword: (email: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (isDev) {
      // Auto-login in development mode
      setTimeout(() => {
        setUser(DEV_USER as any)
        setLoading(false)
        console.log('🚀 Development mode: Auto-logged in as Dev User')
      }, 500)
      return
    }

    // Production mode - Initialize Supabase auth
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle email confirmation success
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          toast({
            title: "Welcome to BuddyAI! 🎉",
            description: "Your account is now active and ready to use.",
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    if (isDev) {
      setUser(DEV_USER as any)
      return {}
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        let errorMessage = 'Sign in failed'
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many attempts. Please wait a moment and try again'
        }
        
        return { error: errorMessage }
      }

      if (data.user) {
        toast({
          title: "Welcome back! 👋",
          description: "You've successfully signed in to BuddyAI.",
        })
      }

      return {}
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: 'An unexpected error occurred during sign in' }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (isDev) {
      setUser(DEV_USER as any)
      return {}
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      })

      if (error) {
        let errorMessage = 'Sign up failed'
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Try signing in instead.'
        } else if (error.message.includes('Password should be')) {
          errorMessage = 'Password must be at least 6 characters long'
        } else if (error.message.includes('Unable to validate email')) {
          errorMessage = 'Please enter a valid email address'
        }
        
        return { error: errorMessage }
      }

      if (data.user && !data.session) {
        // User needs to confirm email
        toast({
          title: "Check your email! 📧",
          description: "We've sent you a confirmation link. Click it to activate your account.",
        })
      }

      return {}
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: 'An unexpected error occurred during sign up' }
    }
  }

  const signOut = async () => {
    if (isDev) {
      setUser(null)
      return
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      } else {
        toast({
          title: "Signed out successfully",
          description: "Come back soon! 👋",
        })
      }
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const updateProfile = async (fullName: string) => {
    if (isDev) {
      return {}
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      if (error) {
        return { error: 'Failed to update profile' }
      }

      toast({
        title: "Profile updated! ✅",
        description: "Your changes have been saved successfully.",
      })

      return {}
    } catch (error) {
      console.error('Profile update error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  const resetPassword = async (email: string) => {
    if (isDev) {
      return {}
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        let errorMessage = 'Password reset failed'
        
        if (error.message.includes('Unable to validate email')) {
          errorMessage = 'Please enter a valid email address'
        }
        
        return { error: errorMessage }
      }

      toast({
        title: "Reset email sent! 📧",
        description: "Check your email for password reset instructions.",
      })

      return {}
    } catch (error) {
      console.error('Password reset error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
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