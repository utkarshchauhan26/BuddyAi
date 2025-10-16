"use client"

import { useEffect, useState } from "react"

export type TaskStatus = "active" | "paused" | "completed"

export type Task = {
  id: string
  title: string
  done: boolean
  status: TaskStatus
  createdAt: number
  completedAt?: number
  pausedAt?: number
  category?: string
  estimate?: number
  priority?: "Low" | "Medium" | "High"
  notes?: string
  tags?: string[]
  dueDate?: number
  progress?: number // 0-100 for partial completion
  roadmapId?: string // Link to roadmap
  roadmapStepId?: string // Link to specific roadmap step
}

export interface RoadmapStep {
  id: string
  title: string
  description: string
  duration: string
  completed: boolean
  completedAt?: number
}

export interface Roadmap {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  steps: RoadmapStep[]
  progress: number
  completed: boolean
  completedAt?: number
  createdAt: number
  updatedAt: number
}

export type Session = { endedAt: number; duration: number }

export type Stats = {
  xp: number
  level: number
  lastActiveDay: number | null
  streak: number
}

export type Note = {
  id: string
  title: string
  content: string
  date: string // YYYY-MM-DD format
  createdAt: number
  updatedAt: number
  mood?: "great" | "good" | "okay" | "bad" | "terrible"
  tags?: string[]
  outcomes?: string[] // Key achievements/learnings for the day
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

const dayFloor = (ts: number) =>
  new Date(new Date(ts).getFullYear(), new Date(ts).getMonth(), new Date(ts).getDate()).getTime()

// Tasks
export function getTasks(): Task[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem("tasks") || "[]")
  } catch {
    return []
  }
}
export function setTasks(tasks: Task[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("tasks", JSON.stringify(tasks))
}

export function addTask(task: Omit<Task, 'id' | 'createdAt'>) {
  const newTask: Task = {
    ...task,
    status: task.status || 'active', // Default to active if not specified
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  }
  const tasks = getTasks()
  tasks.push(newTask)
  setTasks(tasks)
  return newTask
}

export function toggleTask(id: string): void {
  const tasks = getTasks()
  const task = tasks.find(t => t.id === id)
  
  const updatedTasks = tasks.map((task) => {
    if (task.id === id) {
      return {
        ...task,
        done: !task.done,
        completedAt: !task.done ? Date.now() : undefined,
      }
    }
    return task
  })
  setTasks(updatedTasks)
  
  // If this task is linked to a roadmap step, check if step should be marked complete
  if (task?.roadmapId && task?.roadmapStepId) {
    checkAndUpdateRoadmapStepProgress(task.roadmapId, task.roadmapStepId)
  }
}

export function removeTask(id: string): void {
  const tasks = getTasks()
  const updatedTasks = tasks.filter(task => task.id !== id)
  setTasks(updatedTasks)
}

export function pauseTask(id: string): void {
  const tasks = getTasks()
  const updatedTasks = tasks.map((task) => {
    if (task.id === id) {
      return {
        ...task,
        status: 'paused' as TaskStatus,
        pausedAt: Date.now(),
      }
    }
    return task
  })
  setTasks(updatedTasks)
}

export function resumeTask(id: string): void {
  const tasks = getTasks()
  const updatedTasks = tasks.map((task) => {
    if (task.id === id) {
      return {
        ...task,
        status: 'active' as TaskStatus,
        pausedAt: undefined,
      }
    }
    return task
  })
  setTasks(updatedTasks)
}

export function updateTaskStatus(id: string, status: TaskStatus): void {
  const tasks = getTasks()
  const updatedTasks = tasks.map((task) => {
    if (task.id === id) {
      const updates: Partial<Task> = { status }
      
      if (status === 'completed') {
        updates.done = true
        updates.completedAt = Date.now()
        updates.pausedAt = undefined
      } else if (status === 'paused') {
        updates.pausedAt = Date.now()
      } else if (status === 'active') {
        updates.pausedAt = undefined
      }
      
      return { ...task, ...updates }
    }
    return task
  })
  setTasks(updatedTasks)
  
  // If task was completed, sync with roadmap
  const task = tasks.find(t => t.id === id)
  if (status === 'completed' && task?.roadmapId && task?.roadmapStepId) {
    checkAndUpdateRoadmapStepProgress(task.roadmapId, task.roadmapStepId)
  }
}

function checkAndUpdateRoadmapStepProgress(roadmapId: string, stepId: string) {
  const tasks = getTasks()
  const stepTasks = tasks.filter(t => t.roadmapId === roadmapId && t.roadmapStepId === stepId)
  
  if (stepTasks.length === 0) return
  
  // If all tasks for this step are completed, mark the roadmap step as complete
  const allCompleted = stepTasks.every(t => t.done)
  
  if (allCompleted) {
    const roadmaps = getRoadmaps()
    const roadmap = roadmaps.find(r => r.id === roadmapId)
    if (roadmap) {
      const step = roadmap.steps.find(s => s.id === stepId)
      if (step && !step.completed) {
        step.completed = true
        step.completedAt = Date.now()
        
        // Update overall roadmap progress
        const completedSteps = roadmap.steps.filter(s => s.completed).length
        const totalSteps = roadmap.steps.length
        const progress = Math.round((completedSteps / totalSteps) * 100)
        
        roadmap.progress = progress
        roadmap.completed = progress === 100
        roadmap.completedAt = progress === 100 ? Date.now() : undefined
        roadmap.updatedAt = Date.now()
        
        setRoadmaps(roadmaps)
      }
    }
  }
}

// Sessions
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

// Notes
export function getNotes(): Note[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem("notes") || "[]")
  } catch {
    return []
  }
}

export function setNotes(notes: Note[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("notes", JSON.stringify(notes))
}

export function addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) {
  const newNote: Note = {
    ...note,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  const notes = getNotes()
  notes.push(newNote)
  setNotes(notes)
  return newNote
}

export function updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) {
  const notes = getNotes()
  const updatedNotes = notes.map((note) => {
    if (note.id === id) {
      return {
        ...note,
        ...updates,
        updatedAt: Date.now(),
      }
    }
    return note
  })
  setNotes(updatedNotes)
}

export function deleteNote(id: string) {
  const notes = getNotes()
  const updatedNotes = notes.filter(note => note.id !== id)
  setNotes(updatedNotes)
}

export function getNotesByDate(date: string): Note[] {
  return getNotes().filter(note => note.date === date)
}

export function getNotesByDateRange(startDate: string, endDate: string): Note[] {
  return getNotes().filter(note => note.date >= startDate && note.date <= endDate)
}

// Stats
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
function setStats(s: Stats) {
  if (typeof window === "undefined") return
  localStorage.setItem("stats", JSON.stringify(s))
}
export function resetXP() {
  if (typeof window === "undefined") return
  setStats({ xp: 0, level: 1, lastActiveDay: null, streak: 0 })
}

export function useXP() {
  const [stats, set] = useState<Stats>({ xp: 0, level: 1, lastActiveDay: null, streak: 0 })

  useEffect(() => {
    set(getStats())
  }, [])

  useEffect(() => {
    setStats(stats)
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
  const diff = s.lastActiveDay ? (today - s.lastActiveDay) / (24 * 3600 * 1000) : Number.POSITIVE_INFINITY
  const currentStreak = diff <= 1 ? s.streak : 0
  return { currentStreak }
}

// Settings
export function getSettings(): Settings {
  if (typeof window === "undefined")
    return {
      tone: "Friendly",
      gamification: true,
      reminders: true,
      notifications: false,
      botName: "Mentor",
      themeColor: "amber",
      reminderTimes: ["09:00", "13:00", "18:00"],
    }
  try {
    return (
      JSON.parse(localStorage.getItem("settings") || "null") ?? {
        tone: "Friendly",
        gamification: true,
        reminders: true,
        notifications: false,
        botName: "Mentor",
        themeColor: "amber",
        reminderTimes: ["09:00", "13:00", "18:00"],
      }
    )
  } catch {
    return {
      tone: "Friendly",
      gamification: true,
      reminders: true,
      notifications: false,
      botName: "Mentor",
      themeColor: "amber",
      reminderTimes: ["09:00", "13:00", "18:00"],
    }
  }
}
export function setSettings(s: Settings) {
  if (typeof window === "undefined") return
  localStorage.setItem("settings", JSON.stringify(s))
}
// Optional helper to apply theme at runtime
export function applyThemeColor(theme: Settings["themeColor"]) {
  if (typeof window === "undefined") return
  const root = document.documentElement
  const map: Record<string, { primary: string; accent: string }> = {
    amber: { primary: "#f59e0b", accent: "#ea580c" },
    teal: { primary: "#14b8a6", accent: "#0ea5a5" },
    blue: { primary: "#3b82f6", accent: "#2563eb" },
  }
  const chosen = map[theme ?? "amber"]
  root.style.setProperty("--primary", chosen.primary)
  root.style.setProperty("--accent", chosen.accent)
  root.style.setProperty("--ring", `${chosen.primary}33`)
}

// Roadmap Management
export function getRoadmaps(): Roadmap[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem("roadmaps") || "[]")
  } catch {
    return []
  }
}

export function setRoadmaps(roadmaps: Roadmap[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("roadmaps", JSON.stringify(roadmaps))
}

export function createRoadmap(roadmap: Omit<Roadmap, 'id' | 'createdAt' | 'updatedAt'>): Roadmap {
  const newRoadmap: Roadmap = {
    ...roadmap,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  
  const roadmaps = getRoadmaps()
  roadmaps.push(newRoadmap)
  setRoadmaps(roadmaps)
  
  // Auto-generate daily tasks from roadmap steps
  generateTasksFromRoadmap(newRoadmap)
  
  return newRoadmap
}

function generateTasksFromRoadmap(roadmap: Roadmap) {
  const tasks = getTasks()
  const today = new Date()
  
  roadmap.steps.forEach((step, index) => {
    // Calculate start date for this step (spread over the timeline)
    const dayOffset = index * 7 // Start each step a week after the previous
    const stepDate = new Date(today)
    stepDate.setDate(today.getDate() + dayOffset)
    
    // Create main step task
    const mainTask: Task = {
      id: crypto.randomUUID(),
      title: step.title,
      done: false,
      status: 'active',
      createdAt: Date.now(),
      dueDate: stepDate.getTime(),
      priority: index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low',
      category: roadmap.category,
      notes: step.description,
      roadmapId: roadmap.id,
      roadmapStepId: step.id
    }
    
    tasks.push(mainTask)
    
    // Create weekly sub-tasks for longer steps
    const weekMatches = step.duration.match(/(\d+)\s*week/)
    const weeks = weekMatches ? parseInt(weekMatches[1]) : 1
    
    if (weeks > 1) {
      for (let week = 1; week <= Math.min(weeks, 4); week++) {
        const subTaskDate = new Date(stepDate)
        subTaskDate.setDate(stepDate.getDate() + (week - 1) * 7)
        
        const subTask: Task = {
          id: crypto.randomUUID(),
          title: `${step.title} - Week ${week}`,
          done: false,
          status: 'active',
          createdAt: Date.now(),
          dueDate: subTaskDate.getTime(),
          priority: 'Medium',
          category: roadmap.category,
          notes: `Week ${week} focus for: ${step.description}`,
          roadmapId: roadmap.id,
          roadmapStepId: step.id
        }
        
        tasks.push(subTask)
      }
    }
  })
  
  setTasks(tasks)
}

export function updateRoadmap(id: string, updates: Partial<Roadmap>) {
  const roadmaps = getRoadmaps()
  const index = roadmaps.findIndex(r => r.id === id)
  if (index === -1) return null
  
  roadmaps[index] = { ...roadmaps[index], ...updates, updatedAt: Date.now() }
  setRoadmaps(roadmaps)
  
  return roadmaps[index]
}

export function deleteRoadmap(id: string) {
  const roadmaps = getRoadmaps()
  const filtered = roadmaps.filter(r => r.id !== id)
  setRoadmaps(filtered)
}

export function completeRoadmapStep(roadmapId: string, stepId: string) {
  const roadmap = getRoadmaps().find(r => r.id === roadmapId)
  if (!roadmap) return
  
  const step = roadmap.steps.find(s => s.id === stepId)
  if (!step) return
  
  step.completed = true
  step.completedAt = Date.now()
  
  // Update related tasks
  syncTasksWithRoadmapStep(roadmapId, stepId, true)
  
  // Update roadmap progress
  const completedSteps = roadmap.steps.filter(s => s.completed).length
  const totalSteps = roadmap.steps.length
  const progress = Math.round((completedSteps / totalSteps) * 100)
  
  updateRoadmap(roadmapId, { 
    progress,
    completed: progress === 100,
    completedAt: progress === 100 ? Date.now() : undefined
  })
}

function syncTasksWithRoadmapStep(roadmapId: string, stepId: string, completed: boolean) {
  const tasks = getTasks()
  const updatedTasks = tasks.map(task => {
    if (task.roadmapId === roadmapId && task.roadmapStepId === stepId) {
      return {
        ...task,
        done: completed,
        completedAt: completed ? Date.now() : undefined
      }
    }
    return task
  })
  setTasks(updatedTasks)
}
