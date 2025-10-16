import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

// Types matching our database schema
export interface Task {
  id: string
  user_id: string
  title: string
  notes?: string
  done: boolean
  category?: string
  priority?: 'Low' | 'Medium' | 'High'
  estimate?: number
  progress: number
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface UserStats {
  id: string
  user_id: string
  xp: number
  level: number
  streak: number
  last_active_day?: string
  created_at: string
  updated_at: string
}

export interface PomodoroSession {
  id: string
  user_id: string
  task_id?: string
  duration: number
  completed: boolean
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  bot_name: string
  tone: string
  theme_color: string
  reminders: boolean
  notifications: boolean
  reminder_times: string[]
  created_at: string
  updated_at: string
}

// Database functions
export class DatabaseService {
  // Tasks
  static async getTasks(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createTask(userId: string, task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: userId })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) throw error
  }

  // User Stats
  static async getUserStats(userId: string): Promise<UserStats | null> {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async updateUserStats(userId: string, stats: Partial<UserStats>): Promise<UserStats> {
    const { data, error } = await supabase
      .from('user_stats')
      .upsert({ ...stats, user_id: userId })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Pomodoro Sessions
  static async getPomodoroSessions(userId: string): Promise<PomodoroSession[]> {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createPomodoroSession(userId: string, session: Omit<PomodoroSession, 'id' | 'user_id' | 'created_at'>): Promise<PomodoroSession> {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .insert({ ...session, user_id: userId })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // User Settings
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({ ...settings, user_id: userId })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Migration helpers - sync localStorage data to Supabase
  static async migrateLocalStorageData(userId: string) {
    try {
      // Migrate tasks from localStorage
      const localTasks = localStorage.getItem('tasks')
      if (localTasks) {
        const tasks = JSON.parse(localTasks)
        for (const task of tasks) {
          await this.createTask(userId, {
            title: task.title,
            notes: task.notes,
            done: task.done,
            category: task.category,
            priority: task.priority,
            estimate: task.estimate,
            progress: task.progress || 0,
            due_date: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
            completed_at: task.completedAt ? new Date(task.completedAt).toISOString() : undefined,
          })
        }
      }

      // Migrate stats from localStorage
      const localStats = localStorage.getItem('stats')
      if (localStats) {
        const stats = JSON.parse(localStats)
        await this.updateUserStats(userId, {
          xp: stats.xp || 0,
          level: stats.level || 1,
          streak: stats.streak || 0,
          last_active_day: stats.lastActiveDay ? new Date(stats.lastActiveDay).toISOString().split('T')[0] : undefined,
        })
      }

      // Migrate sessions from localStorage
      const localSessions = localStorage.getItem('sessions')
      if (localSessions) {
        const sessions = JSON.parse(localSessions)
        for (const session of sessions) {
          await this.createPomodoroSession(userId, {
            duration: session.duration || 25,
            completed: session.completed || false,
            task_id: undefined, // We don't have task mapping from old data
          })
        }
      }

      // Migrate settings from localStorage
      const localSettings = localStorage.getItem('settings')
      if (localSettings) {
        const settings = JSON.parse(localSettings)
        await this.updateUserSettings(userId, {
          bot_name: settings.botName || 'Sara',
          tone: settings.tone || 'Friendly',
          theme_color: settings.themeColor || 'amber',
          reminders: settings.reminders || true,
          notifications: settings.notifications || false,
          reminder_times: settings.reminderTimes || ['09:00', '13:00', '18:00'],
        })
      }

      console.log('Local data migrated successfully')
    } catch (error) {
      console.error('Error migrating local data:', error)
    }
  }
}