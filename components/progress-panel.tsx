"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { useXP, getTasks, getSessions, getStreak } from "@/lib/storage"
import useSWR from "swr"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

function fetchWeekly() {
  if (typeof window === "undefined") return []
  const tasks = getTasks()
  // Build simple daily completion counts for last 7 days
  const now = new Date()
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - (6 - i))
    const dayKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const count = tasks.filter((t) => t.done && dayBucket(t.createdAt) === dayKey).length
    return { name: d.toLocaleDateString(undefined, { weekday: "narrow" }), count }
  })
  return days
}
const dayBucket = (ts: number) =>
  new Date(new Date(ts).getFullYear(), new Date(ts).getMonth(), new Date(ts).getDate()).getTime()

export function ProgressPanel({ compact = false }: { compact?: boolean }) {
  const [mounted, setMounted] = useState(false)
  const { level, xp, nextLevelXP, streak } = useXP()
  const { data: weekly } = useSWR("weekly", async () => fetchWeekly(), { fallbackData: [] })
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return skeleton/placeholder during SSR to prevent hydration mismatch
    return (
      <Card className="p-6 rounded-3xl border border-amber-500/20 bg-gradient-to-b from-background/80 to-background/60 backdrop-blur-xl shadow-2xl shadow-amber-500/5">
        <div className="mb-3">
          <h3 className="text-lg font-semibold">Progress</h3>
          <p className="text-sm text-muted-foreground">
            Loading...
          </p>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <div className="text-xl font-semibold">-</div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <div className="text-xl font-semibold">-</div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </div>
          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <div className="text-xl font-semibold">-</div>
            <div className="text-xs text-muted-foreground">Tasks/Wk</div>
          </div>
        </div>
      </Card>
    )
  }

  const sessions = getSessions()
  const { currentStreak } = getStreak()

  const totalThisWeek = weekly?.reduce((a, b) => a + b.count, 0) ?? 0
  const achievements: Array<{ key: string; label: string; desc: string; earned: boolean }> = [
    {
      key: "streak5",
      label: "5-Day Streak",
      desc: "Logged activity 5 days in a row.",
      earned: streak >= 5 || currentStreak >= 5,
    },
    {
      key: "focusHero",
      label: "Focus Hero",
      desc: "Completed 5 Pomodoros this week.",
      earned: (sessions?.length ?? 0) >= 5,
    },
    { key: "taskSprinter", label: "Task Sprinter", desc: "Finished 10+ tasks this week.", earned: totalThisWeek >= 10 },
  ]

  return (
    <Card className="p-6 rounded-3xl border border-amber-500/20 bg-gradient-to-b from-background/80 to-background/60 backdrop-blur-xl shadow-2xl shadow-amber-500/5">
      <div className="mb-3">
        <h3 className="text-lg font-semibold">Progress</h3>
        <p className="text-sm text-muted-foreground">
          Level {level} • {xp}/{nextLevelXP} XP • Streak {streak}🔥
        </p>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Sessions" value={String(sessions.length)} />
        <Stat label="Streak" value={`${currentStreak}d`} />
        <Stat label="Tasks/Wk" value={String(totalThisWeek)} />
      </div>

      {!compact && (
        <>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis hide />
                <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-3 text-sm text-muted-foreground">
              You were{" "}
              {weekly && weekly.length
                ? Math.round((weekly.filter((d) => d.count > 0).length / weekly.length) * 100)
                : 0}
              % consistent this week 🎯
            </p>
          </div>
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-medium">Achievements</h4>
            <TooltipProvider>
              <div className="flex flex-wrap gap-2">
                {achievements.map((a) => (
                  <Tooltip key={a.key}>
                    <TooltipTrigger asChild>
                      <span
                        className={
                          a.earned
                            ? "cursor-default rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-300"
                            : "cursor-default rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground"
                        }
                        aria-label={`${a.label}${a.earned ? " earned" : " locked"}`}
                      >
                        {a.label}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">{a.desc}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
        </>
      )}
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-3">
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
