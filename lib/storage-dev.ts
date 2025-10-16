// Development storage - localStorage only, no cloud sync
import { DatabaseService } from './database-dev'

class DevStorage {
  private userId: string | null = null

  initialize(userId: string | null) {
    this.userId = userId
    console.log('🚀 Dev Storage initialized for user:', userId || 'guest')
  }

  // Tasks
  async getTasks() {
    if (!this.userId) return []
    return await DatabaseService.getTasks(this.userId)
  }

  async saveTasks(tasks: any[]) {
    if (!this.userId) return
    await DatabaseService.saveTasks(this.userId, tasks)
  }

  async addTask(task: any) {
    const tasks = await this.getTasks()
    const newTask = {
      ...task,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      user_id: this.userId
    }
    tasks.push(newTask)
    await this.saveTasks(tasks)
    return newTask
  }

  async updateTask(taskId: string, updates: any) {
    const tasks = await this.getTasks()
    const index = tasks.findIndex(t => t.id === taskId)
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates, updated_at: new Date().toISOString() }
      await this.saveTasks(tasks)
      return tasks[index]
    }
    return null
  }

  async deleteTask(taskId: string) {
    const tasks = await this.getTasks()
    const filtered = tasks.filter(t => t.id !== taskId)
    await this.saveTasks(filtered)
  }

  // Stats
  async getStats() {
    if (!this.userId) return null
    return await DatabaseService.getUserStats(this.userId)
  }

  async saveStats(stats: any) {
    if (!this.userId) return
    await DatabaseService.saveUserStats(this.userId, stats)
  }

  async updateStats(updates: any) {
    const current = await this.getStats() || {}
    const updated = { ...current, ...updates }
    await this.saveStats(updated)
    return updated
  }

  // Settings
  async getSettings() {
    if (!this.userId) return null
    return await DatabaseService.getUserSettings(this.userId)
  }

  async saveSettings(settings: any) {
    if (!this.userId) return
    await DatabaseService.saveUserSettings(this.userId, settings)
  }

  async updateSettings(updates: any) {
    const current = await this.getSettings() || {}
    const updated = { ...current, ...updates }
    await this.saveSettings(updated)
    return updated
  }

  // Pomodoro sessions
  async getPomodoroSessions() {
    if (!this.userId) return []
    return await DatabaseService.getPomodoroSessions(this.userId)
  }

  async addPomodoroSession(session: any) {
    if (!this.userId) return null
    await DatabaseService.savePomodoroSession(this.userId, session)
    return { ...session, id: Date.now().toString() }
  }
}

// Create singleton instance
const devStorage = new DevStorage()

// Initialize function
export function initializeStorage(userId: string | null) {
  devStorage.initialize(userId)
}

// Export the storage instance
export { devStorage as storage }

// For backward compatibility
export default devStorage