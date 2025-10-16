// Development storage - uses localStorage only
export class DevStorageService {
  private static getKey(userId: string, type: string): string {
    return `buddyai_${userId}_${type}`
  }

  static async getTasks(userId: string): Promise<any[]> {
    const key = this.getKey(userId, 'tasks')
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  static async saveTasks(userId: string, tasks: any[]): Promise<void> {
    const key = this.getKey(userId, 'tasks')
    localStorage.setItem(key, JSON.stringify(tasks))
  }

  static async getUserStats(userId: string): Promise<any> {
    const key = this.getKey(userId, 'stats')
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : {
      tasks_completed: 0,
      total_focus_time: 0,
      current_streak: 0,
      longest_streak: 0,
      level: 1,
      xp: 0
    }
  }

  static async saveUserStats(userId: string, stats: any): Promise<void> {
    const key = this.getKey(userId, 'stats')
    localStorage.setItem(key, JSON.stringify(stats))
  }

  static async getPomodoroSessions(userId: string): Promise<any[]> {
    const key = this.getKey(userId, 'pomodoro_sessions')
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  static async savePomodoroSession(userId: string, session: any): Promise<void> {
    const sessions = await this.getPomodoroSessions(userId)
    sessions.push({
      ...session,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    })
    const key = this.getKey(userId, 'pomodoro_sessions')
    localStorage.setItem(key, JSON.stringify(sessions))
  }

  static async getUserSettings(userId: string): Promise<any> {
    const key = this.getKey(userId, 'settings')
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : {
      pomodoro_duration: 25,
      short_break: 5,
      long_break: 15,
      notifications_enabled: true,
      ai_tips_enabled: true,
      theme: 'dark'
    }
  }

  static async saveUserSettings(userId: string, settings: any): Promise<void> {
    const key = this.getKey(userId, 'settings')
    localStorage.setItem(key, JSON.stringify(settings))
  }

  // Migration function - no-op in dev mode
  static async migrateLocalStorageData(userId: string): Promise<void> {
    console.log('📦 Development mode: Using localStorage only')
  }
}

// Export as DatabaseService for compatibility
export const DatabaseService = DevStorageService