"use client"

import useSWRMutation from "swr/mutation"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useXP } from "@/lib/storage"
import { Send, Sparkles, Mic, Plus, BarChart3, Timer, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SaraAvatar } from "@/components/sara-avatar"

type Message = { role: "user" | "assistant"; content: string }

async function sendMessage(url: string, { arg }: { arg: { messages: Message[] } }) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(arg),
  })
  if (!res.ok) throw new Error("Failed to send")
  return (await res.json()) as { reply: string }
}

interface ChatPanelProps {
  onNavigateToTab?: (tab: string) => void
  onOpenTaskDialog?: () => void
  onStartPomodoro?: () => void
}

export function ChatPanel({ onNavigateToTab, onOpenTaskDialog, onStartPomodoro }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Sara, your productivity assistant. 👋\n\nI can help you create learning roadmaps, track your progress, and stay motivated. What would you like to work on today?",
    },
  ])
  const [input, setInput] = useState("")
  const { trigger, isMutating } = useSWRMutation("/api/chat", sendMessage)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const { addXP } = useXP()
  const { toast } = useToast()

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const onSend = async (text: string) => {
    if (!text.trim()) return
    const next: Message[] = [...messages, { role: "user", content: text.trim() }]
    setMessages(next)
    setInput("")

    try {
      const { reply } = await trigger({ messages: next })
      
      // Check if the reply contains roadmap data
      const roadmapDataMatch = reply.match(/\*\*ROADMAP_DATA_START\*\*[\s\S]*?\*\*ROADMAP_DATA_END\*\*/)
      if (roadmapDataMatch) {
        try {
          // Extract JSON data between markers
          const dataStart = reply.indexOf('**ROADMAP_DATA_START**') + '**ROADMAP_DATA_START**'.length
          const dataEnd = reply.indexOf('**ROADMAP_DATA_END**')
          const jsonData = reply.substring(dataStart, dataEnd).trim()
          
          // Parse and save roadmap data
          const roadmapData = JSON.parse(jsonData)
          const { createRoadmap } = await import('@/lib/storage')
          createRoadmap(roadmapData)
          
          // Show success toast
          toast({ 
            title: "🎯 Roadmap Created!", 
            description: "Your personalized learning path has been saved. Check the Roadmaps tab!" 
          })
          
          // Remove roadmap data from display message
          const cleanReply = reply.replace(/\*\*ROADMAP_DATA_START\*\*[\s\S]*?\*\*ROADMAP_DATA_END\*\*/, '')
          setMessages((m) => [...m, { role: "assistant", content: cleanReply }])
        } catch (error) {
          console.error('Failed to parse roadmap data:', error)
          setMessages((m) => [...m, { role: "assistant", content: reply }])
        }
      } else {
        setMessages((m) => [...m, { role: "assistant", content: reply }])
      }
      
      // small XP for engaging
      addXP(5)
    } catch {
      toast({ title: "Chat error", description: "Please try again.", variant: "destructive" })
    }
  }

  const quickActions = [
    { 
      label: "Add Task", 
      icon: Plus,
      action: () => {
        if (onOpenTaskDialog) {
          onOpenTaskDialog()
        } else if (onNavigateToTab) {
          onNavigateToTab("Tasks")
        }
      }
    },
    { 
      label: "Analytics", 
      icon: BarChart3,
      action: () => {
        if (onNavigateToTab) {
          onNavigateToTab("Analytics")
        }
      }
    },
    { 
      label: "Pomodoro", 
      icon: Timer,
      action: () => {
        if (onStartPomodoro) {
          onStartPomodoro()
        }
      }
    },
    { 
      label: "Roadmap", 
      icon: Target,
      text: "Create a roadmap to learn JavaScript in 3 months, beginner level, 2 hours daily"
    },
    { 
      label: "Motivation", 
      icon: Sparkles,
      text: "Give me some motivation and encouragement!"
    }
  ]

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/50 bg-background/95 backdrop-blur-sm shadow-lg h-[calc(100vh-200px)]">
      <div ref={scrollerRef} className="flex-1 space-y-4 overflow-y-auto p-6 h-[calc(100vh-350px)]" aria-live="polite">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={m.role === "assistant" ? "flex items-start gap-3" : "flex justify-end"}
            >
              {m.role === "assistant" && (
                <div className="mt-1">
                  <SaraAvatar size="md" />
                </div>
              )}
              <div
                className={
                  m.role === "assistant"
                    ? "max-w-[85%] rounded-2xl bg-muted/50 p-4 border border-border/30"
                    : "max-w-[85%] rounded-2xl bg-primary/10 p-4 border border-primary/20"
                }
              >
                <p className="text-pretty leading-relaxed text-foreground/90">{m.content}</p>
              </div>
            </motion.div>
          ))}
          {isMutating && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="flex items-start gap-3"
              aria-live="polite"
              aria-label="Sara is typing"
            >
              <div className="mt-1">
                <SaraAvatar isTyping size="md" />
              </div>
              <div className="max-w-[85%] rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 p-4 shadow-lg shadow-amber-500/10">
                <div className="flex gap-1.5">
                  <motion.span 
                    className="inline-block h-2 w-2 rounded-full bg-amber-400"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.span 
                    className="inline-block h-2 w-2 rounded-full bg-amber-400"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.span 
                    className="inline-block h-2 w-2 rounded-full bg-amber-400"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-2 px-6 pb-4">
        {quickActions.map((q) => (
          <motion.div
            key={q.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                if (q.action) {
                  q.action()
                } else if (q.text) {
                  setInput(q.text)
                }
              }}
            >
              {q.icon && <q.icon className="h-3 w-3 mr-1" />}
              {q.label}
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-3 border-t border-border/50 p-4">
        <div className="flex-1 relative">
          <Input
            placeholder="Ask Sara anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSend(input)
            }}
            className="rounded-xl pl-4 pr-12"
            aria-label="Chat input"
          />
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={() => onSend(input)} 
            disabled={isMutating || !input.trim()}
            className="rounded-xl"
          >
            <Send className="mr-2 h-4 w-4" /> 
            Send
          </Button>
        </motion.div>
      </div>
    </Card>
  )
}