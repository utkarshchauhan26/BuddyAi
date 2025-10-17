"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, Calendar, Edit3, Trash2, BookOpen, Target, 
  Smile, Meh, Frown, Heart, ThumbsUp, Tag, Save,
  ChevronLeft, ChevronRight, Star, TrendingUp
} from "lucide-react"
import { getNotes, addNote, updateNote, deleteNote, getNotesByDate, type Note } from "@/lib/storage"
import { cn } from "@/lib/utils"

const moodIcons = {
  great: { icon: Heart, color: "text-green-500", bg: "bg-green-500/10" },
  good: { icon: ThumbsUp, color: "text-blue-500", bg: "bg-blue-500/10" },
  okay: { icon: Meh, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  bad: { icon: Frown, color: "text-orange-500", bg: "bg-orange-500/10" },
  terrible: { icon: Frown, color: "text-red-500", bg: "bg-red-500/10" }
}

const moodLabels = {
  great: "Great",
  good: "Good", 
  okay: "Okay",
  bad: "Bad",
  terrible: "Terrible"
}

export function NotesPanel({ compact = false }: { compact?: boolean }) {
  const [notes, setNotesState] = useState<Note[]>(getNotes())
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  
  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mood, setMood] = useState<Note['mood']>()
  const [outcomes, setOutcomes] = useState("")
  const [tags, setTags] = useState("")

  const refreshNotes = () => {
    setNotesState(getNotes())
  }

  const todaysNotes = getNotesByDate(selectedDate)
  const recentNotes = notes
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, compact ? 3 : 10)

  const resetForm = () => {
    setTitle("")
    setContent("")
    setMood(undefined)
    setOutcomes("")
    setTags("")
    setEditingNote(null)
  }

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return

    const outcomesList = outcomes.split('\n').filter(o => o.trim()).map(o => o.trim())
    const tagsList = tags.split(',').filter(t => t.trim()).map(t => t.trim())

    if (editingNote) {
      updateNote(editingNote.id, {
        title: title.trim(),
        content: content.trim(),
        date: selectedDate,
        mood,
        outcomes: outcomesList.length > 0 ? outcomesList : undefined,
        tags: tagsList.length > 0 ? tagsList : undefined,
      })
    } else {
      addNote({
        title: title.trim(),
        content: content.trim(),
        date: selectedDate,
        mood,
        outcomes: outcomesList.length > 0 ? outcomesList : undefined,
        tags: tagsList.length > 0 ? tagsList : undefined,
      })
    }

    refreshNotes()
    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
    setSelectedDate(note.date)
    setMood(note.mood)
    setOutcomes(note.outcomes?.join('\n') || "")
    setTags(note.tags?.join(', ') || "")
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteNote(id)
    refreshNotes()
  }

  const changeDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate)
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      currentDate.setDate(currentDate.getDate() + 1)
    }
    setSelectedDate(currentDate.toISOString().split('T')[0])
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (dateString === today.toISOString().split('T')[0]) {
      return "Today"
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Quick add button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Input
                placeholder="Note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              
              <Textarea
                placeholder="What's on your mind today?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Mood</label>
                  <Select value={mood} onValueChange={(value) => setMood(value as Note['mood'])}>
                    <SelectTrigger>
                      <SelectValue placeholder="How are you feeling?" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(moodLabels).map(([key, label]) => {
                        const MoodIcon = moodIcons[key as keyof typeof moodIcons].icon
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <MoodIcon className={cn("h-4 w-4", moodIcons[key as keyof typeof moodIcons].color)} />
                              {label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Date</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Key Outcomes (one per line)</label>
                <Textarea
                  placeholder="What did you achieve today?"
                  value={outcomes}
                  onChange={(e) => setOutcomes(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Tags (comma separated)</label>
                <Input
                  placeholder="work, personal, learning..."
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetForm()
                setIsDialogOpen(false)
              }}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!title.trim() || !content.trim()}>
                <Save className="h-4 w-4 mr-2" />
                {editingNote ? 'Update' : 'Save'} Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Recent notes preview */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground">Recent Notes</h3>
          {recentNotes.length === 0 ? (
            <Card className="p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No notes yet. Start journaling!</p>
            </Card>
          ) : (
            recentNotes.map((note) => (
              <Card key={note.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{note.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {note.mood && (
                        <div className={cn("flex items-center gap-1 px-2 py-1 rounded text-xs", 
                          moodIcons[note.mood].bg)}>
                          {React.createElement(moodIcons[note.mood].icon, {
                            className: cn("h-3 w-3", moodIcons[note.mood].color)
                          })}
                          {moodLabels[note.mood]}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(note.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header with date navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start">
          <Button variant="outline" size="sm" onClick={() => changeDate('prev')} className="px-2 sm:px-3">
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <div className="text-center min-w-0">
            <h2 className="font-semibold text-sm sm:text-base">{formatDate(selectedDate)}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{selectedDate}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => changeDate('next')} className="px-2 sm:px-3">
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 w-full sm:w-auto">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="text-sm sm:text-base">Add Note</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-full sm:max-w-2xl mx-2 sm:mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <Input
                placeholder="Note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-sm sm:text-base"
              />
              
              <Textarea
                placeholder="What's on your mind today?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="text-sm sm:text-base resize-none"
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Mood</label>
                  <Select value={mood} onValueChange={(value) => setMood(value as Note['mood'])}>
                    <SelectTrigger>
                      <SelectValue placeholder="How are you feeling?" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(moodLabels).map(([key, label]) => {
                        const MoodIcon = moodIcons[key as keyof typeof moodIcons].icon
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <MoodIcon className={cn("h-4 w-4", moodIcons[key as keyof typeof moodIcons].color)} />
                              {label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Date</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Key Outcomes (one per line)</label>
                <Textarea
                  placeholder="What did you achieve today?"
                  value={outcomes}
                  onChange={(e) => setOutcomes(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Tags (comma separated)</label>
                <Input
                  placeholder="work, personal, learning..."
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetForm()
                setIsDialogOpen(false)
              }}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!title.trim() || !content.trim()}>
                <Save className="h-4 w-4 mr-2" />
                {editingNote ? 'Update' : 'Save'} Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notes for selected date */}
      <div className="space-y-4">
        <h3 className="font-medium text-muted-foreground">
          Notes for {formatDate(selectedDate)} ({todaysNotes.length})
        </h3>
        
        {todaysNotes.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No notes for this day</h3>
            <p className="text-muted-foreground mb-4">
              Start journaling your thoughts, experiences, and achievements!
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Add First Note
            </Button>
          </Card>
        ) : (
          todaysNotes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{note.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      {note.mood && (
                        <Badge variant="outline" className={cn("px-2 py-1", moodIcons[note.mood].bg)}>
                          {React.createElement(moodIcons[note.mood].icon, {
                            className: cn("h-3 w-3 mr-1", moodIcons[note.mood].color)
                          })}
                          {moodLabels[note.mood]}
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {new Date(note.updatedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(note)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(note.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-muted-foreground">{note.content}</p>
                </div>

                {note.outcomes && note.outcomes.length > 0 && (
                  <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm text-green-700 dark:text-green-400">Key Outcomes</span>
                    </div>
                    <ul className="space-y-1">
                      {note.outcomes.map((outcome, index) => (
                        <li key={index} className="text-sm text-green-600 dark:text-green-300">
                          • {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {note.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Recent activity */}
      {!compact && recentNotes.length > 0 && (
        <div className="mt-8">
          <h3 className="font-medium text-muted-foreground mb-4">Recent Activity</h3>
          <div className="grid gap-3">
            {recentNotes.slice(0, 5).map((note) => (
              <Card key={note.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{note.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {note.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {note.mood && (
                      <div className={cn("p-1 rounded", moodIcons[note.mood].bg)}>
                        {React.createElement(moodIcons[note.mood].icon, {
                          className: cn("h-3 w-3", moodIcons[note.mood].color)
                        })}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(note.date)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}