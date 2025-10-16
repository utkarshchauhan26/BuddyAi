"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, TrendingUp, Target, Award, Clock, 
  BarChart3, PieChart, Activity, Flame,
  ChevronUp, ChevronDown, Trophy, Star
} from "lucide-react"
import { getTasks, getSessions, getStreak, useXP, type Task } from "@/lib/storage"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, Area, AreaChart } from "recharts"

interface AnalyticsData {
  dailyTasks: Array<{ date: string; completed: number; created: number; dayName: string }>
  weeklyTasks: Array<{ week: string; completed: number; created: number; productivity: number }>
  monthlyTasks: Array<{ month: string; completed: number; created: number; productivity: number }>
  categoryBreakdown: Array<{ name: string; value: number; color: string }>
  priorityBreakdown: Array<{ name: string; value: number; color: string }>
  streakHistory: Array<{ date: string; streak: number }>
  productivityTrends: {
    weekOverWeek: number
    monthOverMonth: number
    averageTasksPerDay: number
    completionRate: number
    bestDay: string
    bestWeek: string
    currentStreak: number
    longestStreak: number
  }
}

const CATEGORY_COLORS = {
  Work: "#3b82f6",
  Personal: "#10b981", 
  Learning: "#8b5cf6",
  Health: "#f59e0b",
  Finance: "#ef4444",
  General: "#6b7280"
}

const PRIORITY_COLORS = {
  High: "#ef4444",
  Medium: "#f59e0b", 
  Low: "#10b981"
}

function generateAnalyticsData(): AnalyticsData {
  if (typeof window === "undefined") {
    return {
      dailyTasks: [],
      weeklyTasks: [],
      monthlyTasks: [],
      categoryBreakdown: [],
      priorityBreakdown: [],
      streakHistory: [],
      productivityTrends: {
        weekOverWeek: 0,
        monthOverMonth: 0,
        averageTasksPerDay: 0,
        completionRate: 0,
        bestDay: "Monday",
        bestWeek: "This week",
        currentStreak: 0,
        longestStreak: 0
      }
    }
  }

  const tasks = getTasks()
  const now = new Date()
  
  // Daily data for last 30 days
  const dailyTasks = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now)
    date.setDate(now.getDate() - (29 - i))
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    const dayEnd = dayStart + 24 * 60 * 60 * 1000
    
    const completed = tasks.filter(t => 
      t.done && t.completedAt && t.completedAt >= dayStart && t.completedAt < dayEnd
    ).length
    
    const created = tasks.filter(t => 
      t.createdAt >= dayStart && t.createdAt < dayEnd
    ).length

    return {
      date: date.toISOString().split('T')[0],
      completed,
      created,
      dayName: date.toLocaleDateString(undefined, { weekday: 'short' })
    }
  })

  // Weekly data for last 12 weeks
  const weeklyTasks = Array.from({ length: 12 }, (_, i) => {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() - (11 - i) * 7)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    
    const completed = tasks.filter(t => 
      t.done && t.completedAt && t.completedAt >= weekStart.getTime() && t.completedAt < weekEnd.getTime()
    ).length
    
    const created = tasks.filter(t => 
      t.createdAt >= weekStart.getTime() && t.createdAt < weekEnd.getTime()
    ).length

    const productivity = created > 0 ? Math.round((completed / created) * 100) : 0

    return {
      week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
      completed,
      created,
      productivity
    }
  })

  // Monthly data for last 6 months
  const monthlyTasks = Array.from({ length: 6 }, (_, i) => {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1)
    
    const completed = tasks.filter(t => 
      t.done && t.completedAt && t.completedAt >= monthStart.getTime() && t.completedAt < monthEnd.getTime()
    ).length
    
    const created = tasks.filter(t => 
      t.createdAt >= monthStart.getTime() && t.createdAt < monthEnd.getTime()
    ).length

    const productivity = created > 0 ? Math.round((completed / created) * 100) : 0

    return {
      month: monthStart.toLocaleDateString(undefined, { month: 'short' }),
      completed,
      created,
      productivity
    }
  })

  // Category breakdown
  const categoryCount: Record<string, number> = {}
  tasks.filter(t => t.done).forEach(t => {
    const category = t.category || 'General'
    categoryCount[category] = (categoryCount[category] || 0) + 1
  })
  
  const categoryBreakdown = Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.General
  }))

  // Priority breakdown
  const priorityCount: Record<string, number> = {}
  tasks.filter(t => t.done).forEach(t => {
    const priority = t.priority || 'Medium'
    priorityCount[priority] = (priorityCount[priority] || 0) + 1
  })
  
  const priorityBreakdown = Object.entries(priorityCount).map(([name, value]) => ({
    name,
    value,
    color: PRIORITY_COLORS[name as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.Medium
  }))

  // Calculate productivity trends
  const completedTasks = tasks.filter(t => t.done)
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0
  
  const recentWeek = weeklyTasks[weeklyTasks.length - 1]
  const previousWeek = weeklyTasks[weeklyTasks.length - 2]
  const weekOverWeek = previousWeek?.completed > 0 
    ? Math.round(((recentWeek?.completed || 0) - previousWeek.completed) / previousWeek.completed * 100)
    : 0

  const recentMonth = monthlyTasks[monthlyTasks.length - 1]
  const previousMonth = monthlyTasks[monthlyTasks.length - 2]
  const monthOverMonth = previousMonth?.completed > 0
    ? Math.round(((recentMonth?.completed || 0) - previousMonth.completed) / previousMonth.completed * 100)
    : 0

  const averageTasksPerDay = dailyTasks.length > 0 
    ? Math.round(dailyTasks.reduce((sum, day) => sum + day.completed, 0) / dailyTasks.length * 10) / 10
    : 0

  // Find best performing day and week
  const bestDayData = dailyTasks.reduce((best, day) => 
    day.completed > best.completed ? day : best, dailyTasks[0] || { dayName: 'Monday', completed: 0 }
  )
  const bestWeekData = weeklyTasks.reduce((best, week) => 
    week.completed > best.completed ? week : best, weeklyTasks[0] || { week: 'This week', completed: 0 }
  )

  const { currentStreak } = getStreak()

  return {
    dailyTasks,
    weeklyTasks,
    monthlyTasks,
    categoryBreakdown,
    priorityBreakdown,
    streakHistory: [], // Could be implemented with historical data
    productivityTrends: {
      weekOverWeek,
      monthOverMonth,
      averageTasksPerDay,
      completionRate,
      bestDay: bestDayData.dayName,
      bestWeek: bestWeekData.week,
      currentStreak,
      longestStreak: currentStreak // Simplified
    }
  }
}

export function AnalyticsPanel() {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<AnalyticsData>()
  const { level, xp } = useXP()

  useEffect(() => {
    setMounted(true)
    setData(generateAnalyticsData())
  }, [])

  if (!mounted || !data) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center text-muted-foreground">Loading analytics...</div>
        </Card>
      </div>
    )
  }

  const { productivityTrends } = data

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-400">{productivityTrends.completionRate}%</div>
                <div className="text-xs text-muted-foreground">Completion Rate</div>
              </div>
              <Target className="h-8 w-8 text-blue-400 opacity-60" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-400">{productivityTrends.averageTasksPerDay}</div>
                <div className="text-xs text-muted-foreground">Avg Tasks/Day</div>
              </div>
              <Activity className="h-8 w-8 text-green-400 opacity-60" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-amber-400">{productivityTrends.currentStreak}</div>
                <div className="text-xs text-muted-foreground">Current Streak</div>
              </div>
              <Flame className="h-8 w-8 text-amber-400 opacity-60" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-purple-400">{productivityTrends.weekOverWeek}%</span>
                  {productivityTrends.weekOverWeek >= 0 ? 
                    <ChevronUp className="h-4 w-4 text-green-400" /> : 
                    <ChevronDown className="h-4 w-4 text-red-400" />
                  }
                </div>
                <div className="text-xs text-muted-foreground">Week over Week</div>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400 opacity-60" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Daily Task Activity (Last 30 Days)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyTasks}>
                  <XAxis 
                    dataKey="dayName" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Bar 
                    dataKey="completed" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="Completed"
                  />
                  <Bar 
                    dataKey="created" 
                    fill="hsl(var(--muted))" 
                    radius={[4, 4, 0, 0]}
                    name="Created"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Weekly Productivity Trends (Last 12 Weeks)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weeklyTasks}>
                  <XAxis 
                    dataKey="week" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Area 
                    type="monotone"
                    dataKey="productivity" 
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.3}
                    name="Productivity %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Overview (Last 6 Months)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyTasks}>
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Line 
                    type="monotone"
                    dataKey="completed" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                    name="Completed Tasks"
                  />
                  <Line 
                    type="monotone"
                    dataKey="created" 
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--muted-foreground))", strokeWidth: 2, r: 4 }}
                    name="Created Tasks"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Tasks by Category
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.categoryBreakdown.map((entry, index) => (
                        <Cell key={`category-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Tasks by Priority
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={data.priorityBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.priorityBreakdown.map((entry, index) => (
                        <Cell key={`priority-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-green-500/5 to-green-600/5 border-green-500/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500/20 rounded-full">
              <Trophy className="h-6 w-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-400">Best Performance</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Your most productive day is <strong>{productivityTrends.bestDay}</strong> and 
                your best week was <strong>{productivityTrends.bestWeek}</strong>.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-500/5 to-amber-600/5 border-amber-500/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 rounded-full">
              <Star className="h-6 w-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-400">Productivity Insight</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {productivityTrends.completionRate >= 80 ? 
                  "Excellent! You're completing most of your tasks consistently." :
                  productivityTrends.completionRate >= 60 ?
                  "Good progress! Try to focus on completing existing tasks." :
                  "Consider creating fewer tasks and focusing on completion quality."
                }
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}