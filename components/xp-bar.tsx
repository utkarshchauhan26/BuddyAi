"use client"

import { useXP } from "@/lib/storage"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import confetti from "canvas-confetti"

export function XPBar() {
  const { xp, level, nextLevelXP, progress } = useXP()
  const prevLevel = useRef(level)
  const [flash, setFlash] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (level > prevLevel.current) {
      // try confetti; fallback to glow
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.3 } })
      prevLevel.current = level
    } else {
      prevLevel.current = level
    }
  }, [level])

  // Prevent hydration mismatch by showing loading state until mounted
  if (!mounted) {
    return (
      <div className="w-full">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>Lv 1</span>
          <span>0/100 XP</span>
        </div>
        <div className="h-2 bg-secondary rounded-full">
          <div className="h-2 bg-primary/20 rounded-full" style={{ width: '0%' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>Lv {level}</span>
        <span>
          {xp}/{nextLevelXP} XP
        </span>
      </div>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 20 }}
        className="origin-left"
      >
        <div className={flash ? "ring-2 ring-primary/50 rounded-md p-[2px]" : ""}>
          <Progress value={progress} className="h-2 bg-secondary" />
        </div>
      </motion.div>
    </div>
  )
}
