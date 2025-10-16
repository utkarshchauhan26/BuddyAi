"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Clock, 
  Lightbulb, 
  Star,
  AlertTriangle,
  CheckCircle,
  Zap,
  Calendar,
  BarChart3,
  Users,
  Sparkles
} from 'lucide-react'
import { getTasks, getSessions, getStreak, useXP } from "@/lib/storage"
import { motion, AnimatePresence } from 'framer-motion'

interface AnalysisInsight {
  id: string
  type: 'success' | 'warning' | 'tip' | 'achievement'
  title: string
  message: string
  icon: React.ComponentType<any>
  priority: number
  actionable?: boolean
  suggestion?: string
}

interface ProductivityPattern {
  name: string
  score: number
  trend: 'up' | 'down' | 'stable'
  description: string
  color: string
}

export function AIAnalysisPanel() {
  const [insights, setInsights] = useState<AnalysisInsight[]>([])
  const [patterns, setPatterns] = useState<ProductivityPattern[]>([])
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null)
  const { level, xp, nextLevelXP } = useXP()

  const analyzeProductivityPatterns = () => {
    const tasks = getTasks()
    const sessions = getSessions()
    const { currentStreak } = getStreak()
    
    const completedTasks = tasks.filter(t => t.done)
    const pendingTasks = tasks.filter(t => !t.done)
    const overdueTasks = pendingTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date()
    )
    
    // Calculate patterns
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0
    const avgSessionDuration = sessions.length > 0 ? 
      sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length : 0
    
    // Recent activity (last 7 days)
    const recentTasks = completedTasks.filter(t => 
      t.completedAt && Date.now() - t.completedAt < 7 * 24 * 60 * 60 * 1000
    )
    
    const newPatterns: ProductivityPattern[] = [
      {
        name: "Task Completion",
        score: Math.round(completionRate),
        trend: completionRate > 70 ? 'up' : completionRate > 50 ? 'stable' : 'down',
        description: `${completionRate.toFixed(1)}% completion rate`,
        color: completionRate > 70 ? 'text-green-400' : completionRate > 50 ? 'text-yellow-400' : 'text-red-400'
      },
      {
        name: "Focus Sessions",
        score: Math.min(100, Math.round(avgSessionDuration / 25 * 100)),
        trend: avgSessionDuration > 20 ? 'up' : avgSessionDuration > 15 ? 'stable' : 'down',
        description: `${Math.round(avgSessionDuration)}min average focus`,
        color: avgSessionDuration > 20 ? 'text-green-400' : avgSessionDuration > 15 ? 'text-yellow-400' : 'text-red-400'
      },
      {
        name: "Consistency",
        score: Math.min(100, currentStreak * 10),
        trend: currentStreak > 5 ? 'up' : currentStreak > 2 ? 'stable' : 'down',
        description: `${currentStreak} day streak`,
        color: currentStreak > 5 ? 'text-green-400' : currentStreak > 2 ? 'text-yellow-400' : 'text-red-400'
      },
      {
        name: "Recent Activity",
        score: Math.min(100, recentTasks.length * 20),
        trend: recentTasks.length > 3 ? 'up' : recentTasks.length > 1 ? 'stable' : 'down',
        description: `${recentTasks.length} tasks this week`,
        color: recentTasks.length > 3 ? 'text-green-400' : recentTasks.length > 1 ? 'text-yellow-400' : 'text-red-400'
      }
    ]

    setPatterns(newPatterns)

    // Generate AI insights
    const newInsights: AnalysisInsight[] = []

    // Achievement insights
    if (completionRate > 80) {
      newInsights.push({
        id: 'high-completion',
        type: 'achievement',
        title: 'Completion Champion! 🏆',
        message: `Amazing! You've completed ${completionRate.toFixed(1)}% of your tasks. You're in the productivity zone!`,
        icon: Star,
        priority: 1,
        actionable: false
      })
    }

    if (currentStreak > 7) {
      newInsights.push({
        id: 'streak-master',
        type: 'achievement',
        title: 'Streak Master! 🔥',
        message: `${currentStreak} days in a row! Your consistency is building incredible momentum.`,
        icon: Zap,
        priority: 1,
        actionable: false
      })
    }

    // Warning insights
    if (overdueTasks.length > 0) {
      newInsights.push({
        id: 'overdue-tasks',
        type: 'warning',
        title: 'Overdue Alert! ⚠️',
        message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Let's tackle them today!`,
        icon: AlertTriangle,
        priority: 3,
        actionable: true,
        suggestion: 'Consider breaking large overdue tasks into smaller, manageable pieces.'
      })
    }

    if (completionRate < 30 && tasks.length > 3) {
      newInsights.push({
        id: 'low-completion',
        type: 'warning',
        title: 'Let\'s Boost Your Progress! 💪',
        message: 'Your completion rate could use some improvement. Small steps lead to big wins!',
        icon: TrendingUp,
        priority: 2,
        actionable: true,
        suggestion: 'Try focusing on 1-2 high-priority tasks each day instead of spreading thin.'
      })
    }

    // Tip insights
    if (avgSessionDuration < 15 && sessions.length > 2) {
      newInsights.push({
        id: 'short-sessions',
        type: 'tip',
        title: 'Extend Your Focus! 🎯',
        message: `Your average focus session is ${Math.round(avgSessionDuration)} minutes. Let's aim for 25!`,
        icon: Target,
        priority: 2,
        actionable: true,
        suggestion: 'Try the Pomodoro technique: 25min focused work + 5min break.'
      })
    }

    if (recentTasks.length === 0 && tasks.length > 0) {
      newInsights.push({
        id: 'inactive-week',
        type: 'tip',
        title: 'Time to Get Moving! 🚀',
        message: 'No completed tasks this week. Your future self will thank you for starting today!',
        icon: Sparkles,
        priority: 3,
        actionable: true,
        suggestion: 'Pick the easiest task on your list and complete it now for a quick win!'
      })
    }

    // Success insights
    if (level > 3) {
      newInsights.push({
        id: 'level-progress',
        type: 'success',
        title: `Level ${level} Achiever! ⭐`,
        message: `You've reached level ${level}! Your dedication is paying off beautifully.`,
        icon: CheckCircle,
        priority: 1,
        actionable: false
      })
    }

    // Personalized tips based on data
    const highPriorityTasks = tasks.filter(t => t.priority === 'High' && !t.done)
    if (highPriorityTasks.length > 3) {
      newInsights.push({
        id: 'priority-overload',
        type: 'tip',
        title: 'Priority Focus Needed! 🎯',
        message: `You have ${highPriorityTasks.length} high-priority tasks. Let's be more selective!`,
        icon: Lightbulb,
        priority: 2,
        actionable: true,
        suggestion: 'Limit yourself to 1-2 high-priority tasks per day for better focus.'
      })
    }

    // Sort by priority and limit
    setInsights(newInsights.sort((a, b) => a.priority - b.priority).slice(0, 6))
    setLastAnalysis(new Date())
  }

  const runAnalysis = async () => {
    setAnalysisLoading(true)
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    analyzeProductivityPatterns()
    setAnalysisLoading(false)
  }

  useEffect(() => {
    // Run initial analysis
    analyzeProductivityPatterns()
  }, [])

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'border-yellow-500/30 bg-yellow-500/10'
      case 'success': return 'border-green-500/30 bg-green-500/10'
      case 'warning': return 'border-red-500/30 bg-red-500/10'
      case 'tip': return 'border-blue-500/30 bg-blue-500/10'
      default: return 'border-gray-500/30 bg-gray-500/10'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-400" />
      case 'down': return <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />
      default: return <BarChart3 className="h-4 w-4 text-yellow-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Sara's AI Analysis
          </h2>
          <p className="text-muted-foreground">
            Personalized insights and productivity recommendations
          </p>
        </div>
        <Button 
          onClick={runAnalysis}
          disabled={analysisLoading}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {analysisLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Analyzing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Run Analysis
            </div>
          )}
        </Button>
      </div>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="insights">Smart Insights</TabsTrigger>
          <TabsTrigger value="patterns">Productivity Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {insights.length > 0 ? (
            <div className="grid gap-4">
              <AnimatePresence>
                {insights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`${getInsightColor(insight.type)} border backdrop-blur-sm`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-white/10">
                            <insight.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{insight.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {insight.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {insight.message}
                            </p>
                            {insight.suggestion && (
                              <Alert className="mt-2 border-amber-500/20 bg-amber-500/10">
                                <Lightbulb className="h-4 w-4" />
                                <AlertDescription className="text-amber-400">
                                  <strong>Suggestion:</strong> {insight.suggestion}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Card className="border-dashed border-muted">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Ready for Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  Complete some tasks and focus sessions to get personalized insights from Sara!
                </p>
                <Button onClick={runAnalysis} variant="outline">
                  Generate Insights
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid gap-4">
            {patterns.map((pattern, index) => (
              <motion.div
                key={pattern.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-muted/50 bg-background/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{pattern.name}</h3>
                        {getTrendIcon(pattern.trend)}
                      </div>
                      <Badge variant="outline" className={pattern.color}>
                        {pattern.score}%
                      </Badge>
                    </div>
                    <Progress value={pattern.score} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {pattern.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {lastAnalysis && (
            <Card className="border-muted/30 bg-muted/20">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Last analyzed: {lastAnalysis.toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}