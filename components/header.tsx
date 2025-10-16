"use client"

import { Bell, Sparkles, LogOut, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { XPBar } from "@/components/xp-bar"
import { cn } from "@/lib/utils"
import { getSettings } from "@/lib/storage"
import { useAuth } from "@/lib/auth-supabase"
import React from "react"

type Tab = "Chat" | "Tasks" | "Roadmaps" | "Analytics" | "AI Analysis" | "Notes" | "Settings"

export function Header({
  currentTab,
  onTabChange,
}: {
  currentTab: Tab
  onTabChange: (t: Tab) => void
}) {
  const tabs: Tab[] = ["Chat", "Tasks", "Roadmaps", "Analytics", "AI Analysis", "Notes", "Settings"]
  const [botName, setBotName] = React.useState("Sara")
  const { user, signOut } = useAuth()

  React.useEffect(() => {
    // read once on mount
    const s = getSettings()
    setBotName(s.botName ?? "Sara")
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <img 
              src="/BuddyAI.png" 
              alt="BuddyAI" 
              className="h-9 w-9 rounded-lg object-cover shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-background"></div>
          </div>
          <div className="flex flex-col">
            <div className="font-semibold text-lg text-foreground">BuddyAI</div>
            <div className="text-xs text-muted-foreground">with {botName}</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {tabs.map((t) => (
            <Button
              key={t}
              variant={currentTab === t ? "default" : "ghost"}
              size="sm"
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                currentTab === t 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              onClick={() => onTabChange(t)}
            >
              {t}
            </Button>
          ))}
        </nav>

        <div className="flex min-w-0 items-center gap-4">
          <div className="hidden sm:block w-36">
            <XPBar />
          </div>
          <Button variant="ghost" size="icon" aria-label="Notifications" className="hover:bg-muted/50">
            <Bell className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {user?.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onTabChange("Settings")} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="flex md:hidden items-center justify-between border-t border-border/60 px-2">
        {(["Chat", "Tasks", "Progress", "Settings"] as Tab[]).map((t) => (
          <Button
            key={t}
            variant="ghost"
            size="sm"
            className={cn("flex-1 rounded-none py-4", currentTab === t ? "text-amber-400" : "text-muted-foreground")}
            onClick={() => onTabChange(t)}
          >
            {t}
          </Button>
        ))}
      </div>
    </header>
  )
}
