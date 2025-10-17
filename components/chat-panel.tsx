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

function formatMessageContent(content: string): string {
  return content
    // Convert **bold** to <strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    // Convert *italic* to <em>
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Convert ### headers to h3
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-foreground">$1</h3>')
    // Convert ## headers to h2  
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-4 mb-3 text-foreground">$1</h2>')
    // Convert # headers to h1
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-3 text-foreground">$1</h1>')
    // Convert bullet points • to proper list items
    .replace(/^• (.*$)/gm, '<div class="flex items-start gap-2 my-1"><span class="text-amber-400 mt-1">•</span><span>$1</span></div>')
    // Convert numbered lists
    .replace(/^\d+\. (.*$)/gm, '<div class="flex items-start gap-2 my-1"><span class="text-primary font-medium">•</span><span>$1</span></div>')
    // Convert code blocks ```
    .replace(/```([\s\S]*?)```/g, '<div class="bg-muted/50 rounded-md p-3 my-2 border border-border/30"><code class="text-sm font-mono">$1</code></div>')
    // Convert inline code `
    .replace(/`([^`]+)`/g, '<code class="bg-muted/50 px-2 py-0.5 rounded text-sm font-mono border border-border/30">$1</code>')
    // Convert line breaks to proper spacing
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    // Add spacing for emojis
    .replace(/([\u{1F600}-\u{1F6FF}])/gu, ' $1 ')
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
    <Card className="overflow-hidden rounded-xl lg:rounded-2xl border border-border/50 bg-background/95 backdrop-blur-sm shadow-lg h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] lg:h-[calc(100vh-200px)]">
      <div ref={scrollerRef} className="flex-1 space-y-3 sm:space-y-4 overflow-y-auto p-3 sm:p-4 lg:p-6 h-[calc(100vh-220px)] sm:h-[calc(100vh-280px)] lg:h-[calc(100vh-350px)]" aria-live="polite">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={m.role === "assistant" ? "flex items-start gap-2 sm:gap-3" : "flex justify-end"}
            >
              {m.role === "assistant" && (
                <div className="mt-1 flex-shrink-0">
                  <SaraAvatar size="md" />
                </div>
              )}
              <div
                className={
                  m.role === "assistant"
                    ? "max-w-[90%] sm:max-w-[85%] rounded-xl lg:rounded-2xl bg-muted/50 p-3 sm:p-4 border border-border/30 min-w-0"
                    : "max-w-[90%] sm:max-w-[85%] rounded-xl lg:rounded-2xl bg-primary/10 p-3 sm:p-4 border border-primary/20 min-w-0"
                }
              >
                <div 
                  className="text-pretty leading-relaxed text-foreground/90 text-sm sm:text-base prose prose-sm sm:prose prose-zinc dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: formatMessageContent(m.content)
                  }}
                />
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

      {/* Quick Actions - Hide on mobile, show abbreviated on tablet, full on desktop */}
      <div className="hidden sm:flex flex-wrap gap-2 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4">
        {quickActions.map((q) => (
          <motion.div
            key={q.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 text-xs px-2 sm:px-3"
              onClick={() => {
                if (q.action) {
                  q.action()
                } else if (q.text) {
                  setInput(q.text)
                }
              }}
            >
              {q.icon && <q.icon className="h-3 w-3 mr-0 sm:mr-1" />}
              <span className="hidden sm:inline">{q.label}</span>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 border-t border-border/50 p-3 sm:p-4">
        <div className="flex-1 relative">
          <Input
            placeholder="Ask Sara anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                onSend(input)
              }
            }}
            className="rounded-lg sm:rounded-xl pl-3 sm:pl-4 pr-10 sm:pr-12 text-sm sm:text-base"
            aria-label="Chat input"
          />
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 p-0 hidden sm:flex"
          >
            <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-shrink-0"
        >
          <Button 
            onClick={() => onSend(input)} 
            disabled={isMutating || !input.trim()}
            className="rounded-lg sm:rounded-xl w-full sm:w-auto px-4 sm:px-6"
            size="sm"
          >
            <Send className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> 
            Send
          </Button>
        </motion.div>
      </div>
    </Card>
  )
}