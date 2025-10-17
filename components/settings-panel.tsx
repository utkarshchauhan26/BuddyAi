"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Check } from "lucide-react"
import { useEffect, useState } from "react"
import { getSettings, setSettings, type Settings } from "@/lib/storage"
import { resetXP, applyThemeColor } from "@/lib/storage"
import { useAuth } from "@/lib/auth-supabase"

const tones = ["Friendly", "Mentor", "Strict Coach", "Chill Buddy"] as const
const themeColors = ["amber", "teal", "blue"] as const

export function SettingsPanel() {
  const [settings, setLocal] = useState<Settings>(getSettings())
  const [times, setTimes] = useState<string[]>(settings.reminderTimes ?? ["09:00", "13:00", "18:00"])
  const [profileName, setProfileName] = useState("")
  const [updating, setUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState("")
  
  const { user, updateProfile } = useAuth()

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setProfileName(user.user_metadata.full_name)
    }
  }, [user])

  useEffect(() => {
    setSettings({ ...settings, reminderTimes: times })
    if (settings.themeColor) applyThemeColor(settings.themeColor)
  }, [settings, times])

  // simple in-page reminder checker (runs while tab open)
  useEffect(() => {
    let interval: number | null = null
    if (settings.reminders && settings.notifications) {
      interval = window.setInterval(() => {
        const now = new Date()
        const hh = String(now.getHours()).padStart(2, "0")
        const mm = String(now.getMinutes()).padStart(2, "0")
        const current = `${hh}:${mm}`
        if ((settings.reminderTimes ?? times).includes(current)) {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Time to refocus!", { body: "Pick a task or start a Pomodoro." })
          }
        }
      }, 60 * 1000)
    }
    return () => {
      if (interval) window.clearInterval(interval)
    }
  }, [settings.reminders, settings.notifications, settings.reminderTimes, times])

  const enableNotifs = async () => {
    if (!("Notification" in window)) return
    const perm = await Notification.requestPermission()
    setLocal({ ...settings, notifications: perm === "granted" })
  }

  const handleUpdateProfile = async () => {
    setUpdating(true)
    setUpdateMessage("")
    
    const { error } = await updateProfile(profileName)
    if (error) {
      setUpdateMessage(error)
    } else {
      setUpdateMessage("Profile updated successfully!")
    }
    setUpdating(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Section */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="h-4 w-4 sm:h-5 sm:w-5" />
          Profile
        </h3>
        
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar className="h-14 w-14 sm:h-16 sm:w-16 mx-auto sm:mx-0">
            <AvatarFallback className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-lg sm:text-xl">
              {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4 w-full">
            <div className="space-y-2">
              <Label htmlFor="profile-name" className="text-sm sm:text-base">Full Name</Label>
              <Input
                id="profile-name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter your full name"
                className="text-sm sm:text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Email</Label>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="break-all">{user?.email}</span>
              </div>
            </div>
            
            <Button 
              onClick={handleUpdateProfile}
              disabled={updating || !profileName.trim()}
              className="bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-black w-full sm:w-auto text-sm sm:text-base"
            >
              {updating ? "Updating..." : "Update Profile"}
            </Button>
            
            {updateMessage && (
              <Alert className={updateMessage.includes("success") ? "border-green-500/20 bg-green-500/10" : "border-red-500/20 bg-red-500/10"}>
                <Check className="h-4 w-4" />
                <AlertDescription className={updateMessage.includes("success") ? "text-green-400" : "text-red-400"}>
                  {updateMessage}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </Card>

      {/* App Settings */}
      <Card className="space-y-4 p-4 sm:p-6 rounded-2xl">
        <h3 className="text-base sm:text-lg font-semibold">App Settings</h3>

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm sm:text-base">Bot Name</Label>
          <Input
            value={settings.botName ?? "Mentor"}
            onChange={(e) => setLocal({ ...settings, botName: e.target.value })}
            aria-label="Bot name"
            className="text-sm sm:text-base"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm sm:text-base">AI Tone</Label>
          <Select value={settings.tone} onValueChange={(v) => setLocal({ ...settings, tone: v as Settings["tone"] })}>
            <SelectTrigger className="text-sm sm:text-base">
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              {tones.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm sm:text-base">Theme Color</Label>
          <Select
            value={settings.themeColor ?? "amber"}
            onValueChange={(v) => setLocal({ ...settings, themeColor: v as Settings["themeColor"] })}
          >
            <SelectTrigger className="text-sm sm:text-base">
              <SelectValue placeholder="Select theme color" />
            </SelectTrigger>
            <SelectContent>
              {themeColors.map((c) => (
                <SelectItem key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div className="flex-1 pr-3">
            <Label className="mb-1 block text-sm sm:text-base">Gamification</Label>
            <p className="text-xs text-muted-foreground">Toggle XP, levels, achievements.</p>
          </div>
          <Switch
            checked={settings.gamification}
            onCheckedChange={(v) => setLocal({ ...settings, gamification: !!v })}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div className="flex-1 pr-3">
            <Label className="mb-1 block text-sm sm:text-base">Reminders</Label>
            <p className="text-xs text-muted-foreground">Enable focus reminders at set times.</p>
          </div>
          <Switch checked={settings.reminders} onCheckedChange={(v) => setLocal({ ...settings, reminders: !!v })} />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <Label className="mb-1 block">Browser Notifications</Label>
            <p className="text-xs text-muted-foreground">Allow notifications for reminders.</p>
          </div>
          <Button variant="outline" onClick={enableNotifs}>
            Enable
          </Button>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Reminder Times</Label>
          <div className="grid grid-cols-3 gap-2">
            {times.map((t, idx) => (
              <Input
                key={idx}
                type="time"
                value={t}
                onChange={(e) => {
                  const copy = [...times]
                  copy[idx] = e.target.value
                  setTimes(copy)
                }}
                aria-label={`Reminder time ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            localStorage.clear()
            location.reload()
          }}
        >
          Clear Data
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            resetXP()
            location.reload()
          }}
        >
          Reset XP
        </Button>
        <Button
          onClick={() => {
            const blob = new Blob(
              [
                JSON.stringify(
                  {
                    tasks: JSON.parse(localStorage.getItem("tasks") || "[]"),
                    stats: JSON.parse(localStorage.getItem("stats") || "{}"),
                    settings: JSON.parse(localStorage.getItem("settings") || "{}"),
                  },
                  null,
                  2,
                ),
              ],
              { type: "application/json" },
            )
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "ai-mentor-export.json"
            a.click()
            URL.revokeObjectURL(url)
          }}
        >
          Export Stats
        </Button>
      </div>
    </Card>
    </div>
  )
}
