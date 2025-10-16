"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { ChatPanel } from "@/components/chat-panel"
import { TasksPanel } from "@/components/tasks-panel"
import { NotesPanel } from "@/components/notes-panel"
import { AnalyticsPanel } from "@/components/analytics-panel"
import { AIAnalysisPanel } from "@/components/ai-analysis-panel"
import { SettingsPanel } from "@/components/settings-panel"
import { PomodoroModal } from "@/components/pomodoro-modal"
import RoadmapPanel from "@/components/roadmap-panel"
import { MotivationSection } from "@/components/motivation-section"
import { AuthForm } from "@/components/auth-form"
import { useAuth } from "@/lib/auth-supabase"
import { motion, AnimatePresence } from "framer-motion"

type Tab = "Chat" | "Tasks" | "Roadmaps" | "Analytics" | "AI Analysis" | "Notes" | "Settings"

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("Chat")
  const [pomodoroOpen, setPomodoroOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering auth-dependent content until mounted
  if (!mounted) {
    return (
      <main className="min-h-dvh bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading BuddyAI...</p>
          </div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-dvh bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading BuddyAI...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <main className="min-h-dvh bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10 animate-pulse" />
      
      <Header currentTab={tab} onTabChange={setTab} />
      
      {/* Main Content Area */}
      <div className="mx-2 sm:mx-6 my-4 flex flex-col lg:flex-row gap-4 lg:gap-6 relative z-10">
        
        {/* Left Main Content - 65% width on desktop, full width on mobile */}
        <div className="flex-1 lg:max-w-4xl w-full">
          <AnimatePresence mode="wait">
            {tab === "Chat" && (
              <motion.section
                key="chat"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full"
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent mb-2">
                    Chat with Sara
                  </h1>
                  <p className="text-sm text-muted-foreground">Your AI productivity companion is here to help you achieve your goals ✨</p>
                </div>
                <ChatPanel 
                  onNavigateToTab={(tabName: string) => setTab(tabName as Tab)}
                  onOpenTaskDialog={() => {
                    setTab("Tasks")
                    // Could trigger a task creation dialog here in the future
                  }}
                  onStartPomodoro={() => setPomodoroOpen(true)}
                />
              </motion.section>
            )}
            {tab === "Tasks" && (
              <motion.section
                key="tasks"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full"
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent mb-2">
                    Task Management
                  </h1>
                  <p className="text-sm text-muted-foreground">Organize, prioritize, and conquer your daily goals 🎯</p>
                </div>
                <TasksPanel />
              </motion.section>
            )}
            {tab === "Roadmaps" && (
              <motion.section
                key="roadmaps"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full"
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
                    Learning Roadmaps
                  </h1>
                  <p className="text-sm text-muted-foreground">Personalized learning paths and progress tracking 🗺️</p>
                </div>
                <RoadmapPanel />
              </motion.section>
            )}
            {tab === "Analytics" && (
              <motion.section
                key="analytics"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="h-full"
              >
                <div className="mb-4">
                  <h1 className="text-xl font-bold text-foreground mb-1">Analytics</h1>
                  <p className="text-sm text-muted-foreground">Insights into your productivity patterns</p>
                </div>
                <AnalyticsPanel />
              </motion.section>
            )}
            {tab === "AI Analysis" && (
              <motion.section
                key="ai-analysis"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full"
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    AI Insights & Analysis
                  </h1>
                  <p className="text-sm text-muted-foreground">Sara's intelligent insights and personalized productivity recommendations 🤖</p>
                </div>
                <AIAnalysisPanel />
              </motion.section>
            )}
            {tab === "Notes" && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold text-foreground mb-1">Daily Notes</h1>
                  <p className="text-sm text-muted-foreground">Journal your thoughts and track daily outcomes 📔</p>
                </div>
                <NotesPanel />
              </motion.div>
            )}
            {tab === "Settings" && (
              <motion.section
                key="settings"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="h-full"
              >
                <div className="mb-4">
                  <h1 className="text-xl font-bold text-foreground mb-1">Settings</h1>
                  <p className="text-sm text-muted-foreground">Customize your BuddyAI experience</p>
                </div>
                <SettingsPanel />
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Right Progress Panel - 35% width on desktop, hidden on mobile */}
                {/* Right Notes Panel - 35% width on desktop, hidden on mobile */}
        <div className="w-[35%] hidden lg:block">
          <div className="sticky top-4 space-y-4">
            <h2 className="text-lg font-semibold text-foreground mb-1">Quick Notes</h2>
            <p className="text-sm text-muted-foreground mb-4">Capture thoughts quickly 📝</p>
          <NotesPanel compact />
          </div>
        </div>
      </div>
      
      {/* Pomodoro Modal */}
      <PomodoroModal open={pomodoroOpen} onOpenChange={setPomodoroOpen} />
    </main>
  )
}
