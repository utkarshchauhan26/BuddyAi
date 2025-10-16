"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Heart, Target, Zap, Trophy, Rocket, Star, Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const motivationalQuotes = [
  { text: "You're making amazing progress! Every small step counts! 🌟", icon: Star, color: "text-yellow-500" },
  { text: "Your consistency is inspiring! Keep building those habits! 💪", icon: Zap, color: "text-blue-500" },
  { text: "Remember: Progress over perfection. You've got this! ✨", icon: Sparkles, color: "text-purple-500" },
  { text: "Each task completed is a victory worth celebrating! 🏆", icon: Trophy, color: "text-amber-500" },
  { text: "Your future self will thank you for the work you're doing today! 🚀", icon: Rocket, color: "text-green-500" },
  { text: "Believe in yourself - you're stronger than you think! 💖", icon: Heart, color: "text-pink-500" },
  { text: "Focus on your goals, one step at a time! You're unstoppable! 🎯", icon: Target, color: "text-red-500" },
  { text: "Every expert was once a beginner. You're learning and growing! 🌱", icon: Sun, color: "text-orange-500" },
  { text: "Your dedication is your superpower! Keep shining! ⭐", icon: Star, color: "text-indigo-500" },
  { text: "Success is built one productive day at a time! 🔥", icon: Zap, color: "text-cyan-500" },
  { text: "You're not just completing tasks - you're building your dreams! 🌈", icon: Sparkles, color: "text-violet-500" },
  { text: "Your growth mindset is your greatest asset! Keep learning! 📚", icon: Target, color: "text-teal-500" }
]

export function MotivationSection() {
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0])
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setQuoteIndex((prev) => {
        const nextIndex = (prev + 1) % motivationalQuotes.length
        setCurrentQuote(motivationalQuotes[nextIndex])
        return nextIndex
      })
    }, 20000) // Change every 20 seconds

    return () => clearInterval(interval)
  }, [])

  const IconComponent = currentQuote.icon

  return (
    <Card className="border-cyan-200/30 bg-gradient-to-br from-slate-50/50 to-cyan-50/50 dark:from-slate-900/50 dark:to-cyan-950/50 dark:border-cyan-800/30 overflow-hidden relative">
      {/* Subtle circuit pattern background */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" viewBox="0 0 60 60" className="text-cyan-500">
          <path d="M0 30h60M30 0v60" stroke="currentColor" strokeWidth="0.5" fill="none"/>
          <circle cx="15" cy="15" r="1" fill="currentColor"/>
          <circle cx="45" cy="15" r="1" fill="currentColor"/>
          <circle cx="15" cy="45" r="1" fill="currentColor"/>
          <circle cx="45" cy="45" r="1" fill="currentColor"/>
        </svg>
      </div>
      
      <CardContent className="pt-4 relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-muted-foreground">Sara</span>
          </div>
          <div className="flex-1" />
          <IconComponent className={`h-4 w-4 ${currentQuote.color}`} />
        </div>
        
        {mounted && (
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
            <p className="text-sm leading-relaxed text-foreground/90 mb-2">
              {currentQuote.text}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {motivationalQuotes.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      idx === quoteIndex ? 'bg-cyan-400' : 'bg-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">💫</span>
            </div>
          </motion.div>
        </AnimatePresence>
        )}
        
        {!mounted && (
          <div>
            <p className="text-sm leading-relaxed text-foreground/90 mb-2">
              {currentQuote.text}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {motivationalQuotes.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      idx === quoteIndex ? 'bg-cyan-400' : 'bg-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">💫</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}