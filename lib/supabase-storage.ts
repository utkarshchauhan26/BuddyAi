import { createClient } from '@/lib/supabase'
import type { Task, Roadmap, Session, Stats, Note } from './storage'

const supabase = createClient()

// Check if we're in development mode
const isDev = process.env.NEXT_PUBLIC_DEV_MODE !== 'false'

// Fallback to localStorage in development or if Supabase fails
const fallbackToLocalStorage = async (operation: () => Promise<any>, fallback: () => any) => {
  if (isDev) {
    return fallback()
  }
  
  try {
    return await operation()
  } catch (error) {
    console.warn('Supabase operation failed, falling back to localStorage:', error)
    return fallback()
  }
}

// Tasks
export async function getTasks(): Promise<Task[]> {
  return await fallbackToLocalStorage(
    async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    () => {
      if (typeof window === "undefined") return []
      try {
        return JSON.parse(localStorage.getItem("tasks") || "[]")
      } catch {
        return []
      }
    }
  )
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  return await fallbackToLocalStorage(
    async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Delete existing tasks and insert new ones
      await supabase.from('tasks').delete().eq('user_id', user.id)
      
      if (tasks.length > 0) {
        const tasksWithUserId = tasks.map(task => ({
          ...task,
          user_id: user.id,
          created_at: new Date(task.createdAt).toISOString(),
          completed_at: task.completedAt ? new Date(task.completedAt).toISOString() : null,
          due_date: task.dueDate ? new Date(task.dueDate).toISOString() : null
        }))

        const { error } = await supabase.from('tasks').insert(tasksWithUserId)
        if (error) throw error
      }
    },
    () => {
      if (typeof window !== "undefined") {
        localStorage.setItem("tasks", JSON.stringify(tasks))
      }
    }
  )
}

// Roadmaps
export async function getRoadmaps(): Promise<Roadmap[]> {
  return await fallbackToLocalStorage(
    async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    () => {
      if (typeof window === "undefined") return []
      try {
        return JSON.parse(localStorage.getItem("roadmaps") || "[]")
      } catch {
        return []
      }
    }
  )
}

export async function saveRoadmaps(roadmaps: Roadmap[]): Promise<void> {
  return await fallbackToLocalStorage(
    async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Delete existing roadmaps and insert new ones
      await supabase.from('roadmaps').delete().eq('user_id', user.id)
      
      if (roadmaps.length > 0) {
        const roadmapsWithUserId = roadmaps.map(roadmap => ({
          ...roadmap,
          user_id: user.id,
          created_at: new Date(roadmap.createdAt).toISOString(),
          updated_at: new Date(roadmap.updatedAt).toISOString(),
          completed_at: roadmap.completedAt ? new Date(roadmap.completedAt).toISOString() : null,
          steps: JSON.stringify(roadmap.steps)
        }))

        const { error } = await supabase.from('roadmaps').insert(roadmapsWithUserId)
        if (error) throw error
      }
    },
    () => {
      if (typeof window !== "undefined") {
        localStorage.setItem("roadmaps", JSON.stringify(roadmaps))
      }
    }
  )
}

// Sessions
export async function getSessions(): Promise<Session[]> {
  return await fallbackToLocalStorage(
    async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    () => {
      if (typeof window === "undefined") return []
      try {
        return JSON.parse(localStorage.getItem("sessions") || "[]")
      } catch {
        return []
      }
    }
  )
}

export async function addSession(session: Session): Promise<void> {
  return await fallbackToLocalStorage(
    async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const sessionWithUserId = {
        ...session,
        user_id: user.id,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase.from('sessions').insert([sessionWithUserId])
      if (error) throw error
    },
    () => {
      if (typeof window !== "undefined") {
        try {
          const sessions = JSON.parse(localStorage.getItem("sessions") || "[]")
          sessions.push(session)
          localStorage.setItem("sessions", JSON.stringify(sessions))
        } catch (error) {
          console.error('Error adding session to localStorage:', error)
        }
      }
    }
  )
}

// Stats
export async function getStats(): Promise<Stats> {
  const defaultStats = { xp: 0, level: 1, lastActiveDay: null, streak: 0 }
  
  return await fallbackToLocalStorage(
    async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return defaultStats

      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No stats found, create default
          const { error: insertError } = await supabase
            .from('user_stats')
            .insert([{ ...defaultStats, user_id: user.id }])
          
          if (insertError) throw insertError
          return defaultStats
        }
        throw error
      }

      return {
        xp: data.xp || 0,
        level: data.level || 1,
        lastActiveDay: data.last_active_day,
        streak: data.streak || 0
      }
    },
    () => {
      if (typeof window === "undefined") return defaultStats
      try {
        return JSON.parse(localStorage.getItem("stats") || "null") ?? defaultStats
      } catch {
        return defaultStats
      }
    }
  )
}

export async function saveStats(stats: Stats): Promise<void> {
  return await fallbackToLocalStorage(
    async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('user_stats').upsert([{
        user_id: user.id,
        xp: stats.xp,
        level: stats.level,
        last_active_day: stats.lastActiveDay,
        streak: stats.streak,
        updated_at: new Date().toISOString()
      }])

      if (error) throw error
    },
    () => {
      if (typeof window !== "undefined") {
        localStorage.setItem("stats", JSON.stringify(stats))
      }
    }
  )
}

// Notes
export async function getNotes(): Promise<Note[]> {
  return await fallbackToLocalStorage(
    async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      return data || []
    },
    () => {
      if (typeof window === "undefined") return []
      try {
        return JSON.parse(localStorage.getItem("notes") || "[]")
      } catch {
        return []
      }
    }
  )
}

export async function saveNotes(notes: Note[]): Promise<void> {
  return await fallbackToLocalStorage(
    async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Delete existing notes and insert new ones
      await supabase.from('notes').delete().eq('user_id', user.id)
      
      if (notes.length > 0) {
        const notesWithUserId = notes.map(note => ({
          ...note,
          user_id: user.id,
          created_at: new Date(note.createdAt).toISOString(),
          updated_at: new Date(note.updatedAt).toISOString(),
          tags: JSON.stringify(note.tags || []),
          outcomes: JSON.stringify(note.outcomes || [])
        }))

        const { error } = await supabase.from('notes').insert(notesWithUserId)
        if (error) throw error
      }
    },
    () => {
      if (typeof window !== "undefined") {
        localStorage.setItem("notes", JSON.stringify(notes))
      }
    }
  )
}