"use client"

import { createContext, useContext, useEffect, useState } from 'react'

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
  user: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (fullName: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDev) {
      // Auto-login in development mode
      setTimeout(() => {
        setUser(DEV_USER)
        setLoading(false)
        console.log('🚀 Development mode: Auto-logged in as Dev User')
      }, 500)
    } else {
      // Production mode - check for existing session
      const storedUser = localStorage.getItem('buddyai_user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          localStorage.removeItem('buddyai_user')
        }
      }
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    if (isDev) {
      // Development mode - always succeed
      setTimeout(() => {
        setUser(DEV_USER)
        setLoading(false)
      }, 1000)
      return { error: undefined }
    } else {
      // Production mode - simple email/password validation
      try {
        // Basic validation
        if (!email || !password) {
          setLoading(false)
          return { error: 'Email and password are required' }
        }
        
        // For demo purposes, accept any valid email with password "demo123"
        // In real production, this would connect to your actual auth service
        if (password === 'demo123') {
          const prodUser = {
            id: `user-${Date.now()}`,
            email,
            user_metadata: {
              full_name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'User'
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          localStorage.setItem('buddyai_user', JSON.stringify(prodUser))
          setUser(prodUser)
          setLoading(false)
          return {}
        } else {
          setLoading(false)
          return { error: 'Invalid credentials. Use password "demo123" for demo access.' }
        }
      } catch (error) {
        setLoading(false)
        return { error: 'Authentication failed' }
      }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true)
    
    if (isDev) {
      // Development mode
      const newUser = {
        ...DEV_USER,
        email,
        user_metadata: { full_name: fullName }
      }
      setTimeout(() => {
        setUser(newUser)
        setLoading(false)
      }, 1000)
      return { error: undefined }
    } else {
      // Production mode
      try {
        if (!email || !password || !fullName) {
          setLoading(false)
          return { error: 'All fields are required' }
        }

        const newUser = {
          id: `user-${Date.now()}`,
          email,
          user_metadata: { full_name: fullName },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        localStorage.setItem('buddyai_user', JSON.stringify(newUser))
        setUser(newUser)
        setLoading(false)
        return {}
      } catch (error) {
        setLoading(false)
        return { error: 'Sign up failed' }
      }
    }
  }

  const signOut = async () => {
    if (!isDev) {
      localStorage.removeItem('buddyai_user')
    }
    setUser(null)
  }

  const updateProfile = async (fullName: string) => {
    if (user) {
      setUser({
        ...user,
        user_metadata: { ...user.user_metadata, full_name: fullName }
      })
    }
    return { error: undefined }
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