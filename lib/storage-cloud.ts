"use client"

import { useEffect, useState } from "react"
import { DatabaseService } from './database'

// Keep the existing types but adapt them for both local and cloud storage
export type Task = {
  id: string
  title: string
  done: boolean
  createdAt: number
  completedAt?: number
  category?: string
  estimate?: number
  priority?: "Low" | "Medium" | "High"
  notes?: string
  tags?: string[]
  dueDate?: number
  progress?: number // 0-100 for partial completion
}

type Session = { endedAt: number; duration: number }

type Stats = {
  xp: number
  level: number
  lastActiveDay: number | null
  streak: number
}

export type Settings = {
  tone: "Friendly" | "Mentor" | "Strict Coach" | "Chill Buddy"
  gamification: boolean
  reminders: boolean
  notifications: boolean
  botName?: string
  themeColor?: "amber" | "teal" | "blue"
  reminderTimes?: string[] // "HH:MM" 24h
}

// Storage adapter that works with both localStorage and Supabase
class StorageAdapter {
  private userId: string | null = null
  private useSupabase = false

  setUser(userId: string | null) {
    this.userId = userId
    this.useSupabase = !!userId
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    if (this.useSupabase && this.userId) {
      try {
        const cloudTasks = await DatabaseService.getTasks(this.userId)
        return cloudTasks.map(task => ({
          id: task.id,
          title: task.title,
          done: task.done,
          createdAt: new Date(task.created_at).getTime(),
          completedAt: task.completed_at ? new Date(task.completed_at).getTime() : undefined,
          category: task.category,
          estimate: task.estimate,
          priority: task.priority,
          notes: task.notes,
          dueDate: task.due_date ? new Date(task.due_date).getTime() : undefined,
          progress: task.progress
        }))
      } catch (error) {
        console.error('Error fetching tasks from Supabase:', error)
        return this.getLocalTasks()
      }
    }
    return this.getLocalTasks()
  }

  private getLocalTasks(): Task[] {
    if (typeof window === "undefined") return []
    try {
      return JSON.parse(localStorage.getItem("tasks") || "[]")
    } catch {
      return []
    }
  }

  async setTasks(tasks: Task[]): Promise<void> {
    // Always save to localStorage as backup
    if (typeof window !== "undefined") {
      localStorage.setItem("tasks", JSON.stringify(tasks))
    }

    // If user is logged in, sync to Supabase
    if (this.useSupabase && this.userId) {
      // Note: For simplicity, we're not doing a full sync here
      // In a production app, you'd implement proper sync logic
      console.log('Cloud sync not implemented in this version')
    }
  }

  // Stats
  async getStats(): Promise<Stats> {
    if (this.useSupabase && this.userId) {
      try {
        const cloudStats = await DatabaseService.getUserStats(this.userId)
        if (cloudStats) {
          return {
            xp: cloudStats.xp,
            level: cloudStats.level,
            streak: cloudStats.streak,
            lastActiveDay: cloudStats.last_active_day ? new Date(cloudStats.last_active_day).getTime() : null
          }
        }
      } catch (error) {
        console.error('Error fetching stats from Supabase:', error)
      }
    }
    return this.getLocalStats()
  }

  private getLocalStats(): Stats {
    if (typeof window === "undefined") return { xp: 0, level: 1, lastActiveDay: null, streak: 0 }
    try {
      return JSON.parse(localStorage.getItem("stats") || "null") ?? { xp: 0, level: 1, lastActiveDay: null, streak: 0 }
    } catch {
      return { xp: 0, level: 1, lastActiveDay: null, streak: 0 }
    }
  }

  async setStats(stats: Stats): Promise<void> {
    // Always save to localStorage as backup
    if (typeof window !== "undefined") {
      localStorage.setItem("stats", JSON.stringify(stats))
    }

    // If user is logged in, sync to Supabase
    if (this.useSupabase && this.userId) {
      try {
        await DatabaseService.updateUserStats(this.userId, {
          xp: stats.xp,
          level: stats.level,
          streak: stats.streak,
          last_active_day: stats.lastActiveDay ? new Date(stats.lastActiveDay).toISOString().split('T')[0] : undefined
        })
      } catch (error) {
        console.error('Error syncing stats to Supabase:', error)
      }
    }
  }

  // Settings
  async getSettings(): Promise<Settings> {
    if (this.useSupabase && this.userId) {
      try {
        const cloudSettings = await DatabaseService.getUserSettings(this.userId)
        if (cloudSettings) {
          return {
            tone: cloudSettings.tone as Settings['tone'],
            gamification: true, // Default since not in cloud settings
            reminders: cloudSettings.reminders,
            notifications: cloudSettings.notifications,
            botName: cloudSettings.bot_name,
            themeColor: cloudSettings.theme_color as Settings['themeColor'],
            reminderTimes: cloudSettings.reminder_times
          }
        }
      } catch (error) {
        console.error('Error fetching settings from Supabase:', error)
      }
    }
    return this.getLocalSettings()
  }

  private getLocalSettings(): Settings {
    if (typeof window === "undefined") return { tone: "Friendly", gamification: true, reminders: false, notifications: false }
    try {
      return JSON.parse(localStorage.getItem("settings") || "null") ?? { tone: "Friendly", gamification: true, reminders: false, notifications: false }
    } catch {
      return { tone: "Friendly", gamification: true, reminders: false, notifications: false }
    }
  }

  async setSettings(settings: Settings): Promise<void> {
    // Always save to localStorage as backup
    if (typeof window !== "undefined") {
      localStorage.setItem("settings", JSON.stringify(settings))
    }

    // If user is logged in, sync to Supabase
    if (this.useSupabase && this.userId) {
      try {
        await DatabaseService.updateUserSettings(this.userId, {
          bot_name: settings.botName || 'Sara',
          tone: settings.tone,
          theme_color: settings.themeColor || 'amber',
          reminders: settings.reminders,
          notifications: settings.notifications,
          reminder_times: settings.reminderTimes || ['09:00', '13:00', '18:00']
        })
      } catch (error) {
        console.error('Error syncing settings to Supabase:', error)
      }
    }
  }
}

// Create singleton instance
const storage = new StorageAdapter()

// Export the storage functions that components will use
export function initializeStorage(userId: string | null) {
  storage.setUser(userId)
}

export function getTasks(): Task[] {
  // For backward compatibility, return empty array for sync version
  return []
}

export function setTasks(tasks: Task[]) {
  storage.setTasks(tasks)
}

export function getSettings(): Settings {
  // For backward compatibility, return default settings for sync version
  return { tone: "Friendly", gamification: true, reminders: false, notifications: false }
}

export function setSettings(settings: Settings) {
  storage.setSettings(settings)
}

// Async versions for new code
export const AsyncStorage = {
  getTasks: () => storage.getTasks(),
  setTasks: (tasks: Task[]) => storage.setTasks(tasks),
  getStats: () => storage.getStats(),
  setStats: (stats: Stats) => storage.setStats(stats),
  getSettings: () => storage.getSettings(),
  setSettings: (settings: Settings) => storage.setSettings(settings)
}

// Keep existing hooks and functions for compatibility
const dayFloor = (ts: number) =>
  new Date(new Date(ts).getFullYear(), new Date(ts).getMonth(), new Date(ts).getDate()).getTime()

export function getSessions(): Session[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem("sessions") || "[]")
  } catch {
    return []
  }
}

export function addSession(s: Session) {
  if (typeof window === "undefined") return
  const all = getSessions()
  all.push(s)
  localStorage.setItem("sessions", JSON.stringify(all))
}

function getStats(): Stats {
  if (typeof window === "undefined") return { xp: 0, level: 1, lastActiveDay: null, streak: 0 }
  try {
    return (
      JSON.parse(localStorage.getItem("stats") || "null") ?? {
        xp: 0,
        level: 1,
        lastActiveDay: null,
        streak: 0,
      }
    )
  } catch {
    return { xp: 0, level: 1, lastActiveDay: null, streak: 0 }
  }
}

function setStatsLocal(s: Stats) {
  if (typeof window === "undefined") return
  localStorage.setItem("stats", JSON.stringify(s))
}

export function resetXP() {
  if (typeof window === "undefined") return
  setStatsLocal({ xp: 0, level: 1, lastActiveDay: null, streak: 0 })
}

export function useXP() {
  const [stats, set] = useState<Stats>({ xp: 0, level: 1, lastActiveDay: null, streak: 0 })

  useEffect(() => {
    set(getStats())
  }, [])

  useEffect(() => {
    setStatsLocal(stats)
    // Also sync to cloud if user is logged in
    storage.setStats(stats)
  }, [stats])

  // streak updates when any XP added
  const addXP = (amount: number) => {
    const nextXP = stats.xp + amount
    let level = stats.level
    let xp = nextXP
    let nextLevelXP = 100 + (level - 1) * 25
    while (xp >= nextLevelXP) {
      xp -= nextLevelXP
      level += 1
      nextLevelXP = 100 + (level - 1) * 25
    }
    const today = dayFloor(Date.now())
    let streak = stats.streak
    if (stats.lastActiveDay === null) {
      streak = 1
    } else {
      const diff = (today - stats.lastActiveDay) / (24 * 3600 * 1000)
      if (diff === 0) {
        // no change
      } else if (diff === 1) {
        streak += 1
      } else if (diff > 1) {
        streak = 1
      }
    }
    set({ xp, level, lastActiveDay: today, streak })
  }

  const nextLevelXP = 100 + (stats.level - 1) * 25
  const progress = Math.min(100, Math.round((stats.xp / nextLevelXP) * 100))

  return {
    xp: stats.xp,
    level: stats.level,
    streak: stats.streak,
    nextLevelXP,
    progress,
    addXP,
  }
}

export function getStreak() {
  const s = getStats()
  const today = dayFloor(Date.now())
  let currentStreak = s.streak
  if (s.lastActiveDay) {
    const diff = (today - s.lastActiveDay) / (24 * 3600 * 1000)
    if (diff > 1) currentStreak = 0
  }
  return { currentStreak }
}

export function applyThemeColor(color: "amber" | "teal" | "blue") {
  if (typeof document === "undefined") return
  document.documentElement.classList.remove("theme-amber", "theme-teal", "theme-blue")
  document.documentElement.classList.add(`theme-${color}`)
}