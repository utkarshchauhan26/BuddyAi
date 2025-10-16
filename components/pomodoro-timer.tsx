"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useXP, addSession, getSessions } from "@/lib/storage"
import useSWR from "swr"
import { motion } from "framer-motion"

const fetchSessions = async () => getSessions()

export function PomodoroTimer() {
  // 25 min default; for demo, allow quick start with 25s when holding Alt
  const [seconds, setSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const { addXP } = useXP()
  const intervalRef = useRef<number | null>(null)
  const { data: sessions, mutate } = useSWR("sessions", fetchSessions, { fallbackData: [] })

  useEffect(() => {
    if (!running) return
    intervalRef.current = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [running])

  useEffect(() => {
    if (seconds === 0 && running) {
      setRunning(false)
      addXP(20)
      addSession({ endedAt: Date.now(), duration: 25 * 60 })
      mutate(awaitSessions(), false)
      notify("Focus session complete! +20 XP")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, running])

  const awaitSessions = async () => fetchSessions()

  const start = (quick = false) => {
    setSeconds(quick ? 25 : 25 * 60)
    setRunning(true)
  }
  const reset = () => {
    setRunning(false)
    setSeconds(25 * 60)
  }

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0")
  const secs = String(seconds % 60).padStart(2, "0")

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pomodoro</h3>
        <span className="text-sm text-muted-foreground">{sessions?.length ?? 0} sessions</span>
      </div>

      <motion.div
        initial={{ scale: 0.98 }}
        animate={{ scale: running ? 1 : 0.98 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="mb-3 flex items-center justify-center rounded-xl border border-amber-500/20 bg-secondary/40 p-6"
      >
        <span className="text-4xl font-semibold tabular-nums">
          {mins}:{secs}
        </span>
      </motion.div>

      <div className="flex items-center gap-2">
        {!running ? (
          <>
            <Button onClick={() => start(false)}>Start 25:00</Button>
            <Button variant="outline" onClick={() => start(true)}>
              Quick 0:25
            </Button>
          </>
        ) : (
          <Button variant="destructive" onClick={reset}>
            Stop
          </Button>
        )}
      </div>
    </Card>
  )
}

function notify(message: string) {
  if (typeof window === "undefined") return
  if (!("Notification" in window)) return
  if (Notification.permission === "granted") {
    new Notification(message)
  }
}
