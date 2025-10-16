"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { Timer } from "lucide-react"

interface PomodoroModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PomodoroModal({ open, onOpenChange }: PomodoroModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-background/95 to-background/90 backdrop-blur-xl border-amber-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
            <Timer className="h-5 w-5 text-amber-400" />
            Pomodoro Focus Session
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <PomodoroTimer />
        </div>
      </DialogContent>
    </Dialog>
  )
}