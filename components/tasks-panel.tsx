"use client"

import useSWR from "swr"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Trash2, Plus, Calendar, Clock, Tag, FileText, 
  Edit3, Target, CheckCircle2, Circle, Star,
  AlertCircle, Timer, TrendingUp, Play, Pause
} from "lucide-react"
import { 
  getTasks, setTasks, addTask as addTaskToStorage, toggleTask as toggleTaskInStorage, 
  removeTask, pauseTask, resumeTask, updateTaskStatus, 
  type Task, type TaskStatus, useXP 
} from "@/lib/storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const fetchTasks = async () => getTasks()

const priorityColors = {
  Low: "bg-green-500/10 text-green-400 border-green-500/20",
  Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", 
  High: "bg-red-500/10 text-red-400 border-red-500/20"
}

const priorityIcons = {
  Low: Circle,
  Medium: AlertCircle,
  High: Star
}

const statusColors = {
  active: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  paused: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20"
}

const statusIcons = {
  active: Play,
  paused: Pause,
  completed: CheckCircle2
}

export function TasksPanel() {
  const { data, mutate } = useSWR("tasks", fetchTasks, { fallbackData: [] as Task[] })
  const [text, setText] = useState("")
  const [open, setOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [advTitle, setAdvTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [category, setCategory] = useState<string>("General")
  const [estimate, setEstimate] = useState<number | "">("" as any)
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium")
  const [dueDate, setDueDate] = useState("")
  const [progress, setProgress] = useState(0)
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "completed">("all")
  const { addXP } = useXP()

  const tasks = data ?? []
  const completedTasks = tasks.filter(t => t.done || t.status === 'completed')
  const activeTasks = tasks.filter(t => t.status === 'active')
  const pausedTasks = tasks.filter(t => t.status === 'paused')
  const todayTasks = tasks.filter(t => {
    const taskDate = new Date(t.createdAt)
    const today = new Date()
    return taskDate.toDateString() === today.toDateString()
  })

  const filteredTasks = filter === "all" ? tasks 
    : filter === "completed" ? completedTasks 
    : filter === "active" ? activeTasks 
    : pausedTasks

  const addTaskQuick = () => {
    const t = text.trim()
    if (!t) return
    
    addTaskToStorage({
      title: t, 
      done: false, 
      status: 'active',
      progress: 0
    })
    
    mutate(getTasks(), false)
    setText("")
  }

  const addAdvancedTask = () => {
    const title = advTitle.trim()
    if (!title) return
    
    if (editingTask) {
      // Update existing task
      const updatedTasks = tasks.map(t => 
        t.id === editingTask.id 
          ? {
              ...t,
              title,
              category,
              estimate: typeof estimate === "number" ? estimate : undefined,
              priority,
              notes: notes.trim() || undefined,
              dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
              progress: progress || 0
            }
          : t
      )
      setTasks(updatedTasks)
    } else {
      // Add new task
      addTaskToStorage({
        title,
        done: false,
        status: 'active',
        category,
        estimate: typeof estimate === "number" ? estimate : undefined,
        priority,
        notes: notes.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        progress: progress || 0
      })
    }
    
    mutate(getTasks(), false)
    resetForm()
    setOpen(false)
  }

  const resetForm = () => {
    setAdvTitle("")
    setNotes("")
    setCategory("General")
    setEstimate("")
    setPriority("Medium")
    setDueDate("")
    setProgress(0)
    setEditingTask(null)
  }

  const toggleTask = (task: Task) => {
    const wasNotDone = !task.done
    
    // Use the storage function which handles roadmap syncing
    toggleTaskInStorage(task.id)
    
    // Refresh the data
    mutate(getTasks(), false)
    
    if (wasNotDone) {
      addXP(10) // Reward for completing task
    }
  }

  const deleteTask = (id: string) => {
    removeTask(id)
    mutate(getTasks(), false)
  }

  const pauseTaskHandler = (id: string) => {
    pauseTask(id)
    mutate(getTasks(), false)
  }

  const resumeTaskHandler = (id: string) => {
    resumeTask(id)
    mutate(getTasks(), false)
  }

  const updateTaskStatusHandler = (id: string, status: TaskStatus) => {
    updateTaskStatus(id, status)
    mutate(getTasks(), false)
    
    if (status === 'completed') {
      addXP(10) // Reward for completing task
    }
  }

  const editTask = (task: Task) => {
    setEditingTask(task)
    setAdvTitle(task.title)
    setNotes(task.notes || "")
    setCategory(task.category || "General")
    setEstimate(task.estimate || "")
    setPriority(task.priority || "Medium")
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "")
    setProgress(task.progress || 0)
    setOpen(true)
  }

  const updateProgress = (taskId: string, newProgress: number) => {
    const next = tasks.map(t => 
      t.id === taskId 
        ? { ...t, progress: newProgress, done: newProgress >= 100 }
        : t
    )
    setTasks(next)
    mutate(next, false)
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Target className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{tasks.length}</div>
              <div className="text-xs text-muted-foreground">Total Tasks</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{completedTasks.length}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Timer className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">{activeTasks.length}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{todayTasks.length}</div>
              <div className="text-xs text-muted-foreground">Today</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Add */}
      <Card className="p-6 bg-gradient-to-br from-background/80 to-background/60 border-amber-500/20">
        <div className="flex gap-3">
          <Input
            placeholder="Quick add a task..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTaskQuick()}
            className="flex-1 bg-background/80 border-amber-500/20 focus:border-amber-400/50"
          />
          <Button onClick={addTaskQuick} className="bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-black">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetForm} className="border-amber-500/30 hover:bg-amber-500/10">
                <Edit3 className="h-4 w-4 mr-2" />
                Advanced
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTask ? "Edit Task" : "Create Advanced Task"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={advTitle}
                    onChange={(e) => setAdvTitle(e.target.value)}
                    placeholder="Task title..."
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add detailed notes, steps, or context..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Learning">Learning</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estimate (min)</label>
                    <Input
                      type="number"
                      value={estimate}
                      onChange={(e) => setEstimate(e.target.value ? Number(e.target.value) : "")}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Progress ({progress}%)</label>
                    <div className="px-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => setProgress(Number(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={addAdvancedTask}>{editingTask ? "Update" : "Create"} Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeTasks.length})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({pausedTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Done ({completedTasks.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tasks List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredTasks.map((task, index) => {
            const PriorityIcon = priorityIcons[task.priority || "Medium"]
            const isOverdue = task.dueDate && task.dueDate < Date.now() && !task.done
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "p-6 transition-all duration-200 hover:shadow-lg",
                  task.done && "opacity-75 bg-green-500/5 border-green-500/20",
                  isOverdue && "border-red-500/30 bg-red-500/5"
                )}>
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Checkbox
                        checked={task.done}
                        onCheckedChange={() => toggleTask(task)}
                        className="mt-1 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                    </motion.div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={cn(
                            "font-medium text-lg leading-relaxed",
                            task.done && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </h3>
                          
                          {task.notes && (
                            <p className="text-sm text-muted-foreground mt-2 bg-muted/30 p-3 rounded-lg">
                              <FileText className="inline h-3 w-3 mr-1" />
                              {task.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {/* Status Control Buttons */}
                          {!task.done && task.status !== 'completed' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateTaskStatusHandler(task.id, 'completed')}
                                className="h-8 w-8 p-0 hover:bg-green-500/10 hover:text-green-400"
                                title="Mark as completed"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => task.status === 'paused' ? resumeTaskHandler(task.id) : pauseTaskHandler(task.id)}
                                className={cn(
                                  "h-8 w-8 p-0",
                                  task.status === 'paused' 
                                    ? "hover:bg-blue-500/10 hover:text-blue-400" 
                                    : "hover:bg-orange-500/10 hover:text-orange-400"
                                )}
                                title={task.status === 'paused' ? 'Resume task' : 'Pause task'}
                              >
                                {task.status === 'paused' ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                              </Button>
                            </>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editTask(task)}
                            className="h-8 w-8 p-0 hover:bg-amber-500/10"
                            title="Edit task"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                            className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-400"
                            title="Delete task"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {(task.progress || 0) > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{task.progress || 0}%</span>
                          </div>
                          <Progress 
                            value={task.progress || 0} 
                            className="h-2"
                          />
                        </div>
                      )}

                      {/* Task Meta */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Status Badge */}
                        <Badge variant="outline" className={cn("px-2 py-1", statusColors[task.status || 'active'])}>
                          {(() => {
                            const StatusIcon = statusIcons[task.status || 'active']
                            return <StatusIcon className="h-3 w-3 mr-1" />
                          })()}
                          {(task.status || 'active').charAt(0).toUpperCase() + (task.status || 'active').slice(1)}
                        </Badge>

                        {task.priority && (
                          <Badge variant="outline" className={cn("px-2 py-1", priorityColors[task.priority])}>
                            <PriorityIcon className="h-3 w-3 mr-1" />
                            {task.priority}
                          </Badge>
                        )}
                        
                        {task.category && (
                          <Badge variant="outline" className="px-2 py-1">
                            <Tag className="h-3 w-3 mr-1" />
                            {task.category}
                          </Badge>
                        )}
                        
                        {task.estimate && (
                          <Badge variant="outline" className="px-2 py-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.estimate}m
                          </Badge>
                        )}
                        
                        {task.dueDate && (
                          <Badge variant="outline" className={cn(
                            "px-2 py-1",
                            isOverdue && "border-red-500/50 text-red-400"
                          )}>
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </Badge>
                        )}

                        <Badge variant="outline" className="px-2 py-1 text-muted-foreground">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                {filter === "completed" ? "No completed tasks yet" 
                 : filter === "active" ? "No active tasks" 
                 : filter === "paused" ? "No paused tasks"
                 : "No tasks yet"}
              </h3>
              <p className="text-sm">
                {filter === "all" && "Create your first task to get started!"}
                {filter === "active" && "All tasks are either completed or paused."}
                {filter === "paused" && "No tasks are currently paused."}
                {filter === "completed" && "Complete some tasks to see them here."}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}