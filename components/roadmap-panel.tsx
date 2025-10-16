"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, Trophy, Target, Clock, CheckCircle, MapPin, Star } from 'lucide-react'
import { getRoadmaps, completeRoadmapStep, deleteRoadmap, type Roadmap } from '@/lib/storage'

export default function RoadmapPanel() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null)

  useEffect(() => {
    setRoadmaps(getRoadmaps())
  }, [])

  const refreshRoadmaps = () => {
    setRoadmaps(getRoadmaps())
    if (selectedRoadmap) {
      const updated = getRoadmaps().find(r => r.id === selectedRoadmap.id)
      setSelectedRoadmap(updated || null)
    }
  }

  const handleStepComplete = (roadmapId: string, stepId: string) => {
    completeRoadmapStep(roadmapId, stepId)
    refreshRoadmaps()
  }

  const handleDeleteRoadmap = (id: string) => {
    deleteRoadmap(id)
    if (selectedRoadmap?.id === id) {
      setSelectedRoadmap(null)
    }
    refreshRoadmaps()
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatDuration = (duration: string) => {
    return duration.toLowerCase().replace(/(\d+)/, '$1 ')
  }

  if (selectedRoadmap) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedRoadmap(null)}
          >
            ← Back to Roadmaps
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleDeleteRoadmap(selectedRoadmap.id)}
          >
            Delete Roadmap
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {selectedRoadmap.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedRoadmap.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={selectedRoadmap.completed ? "default" : "secondary"}>
                  {selectedRoadmap.completed ? "Completed" : "In Progress"}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {selectedRoadmap.difficulty}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Duration: {formatDuration(selectedRoadmap.duration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Created: {formatDate(selectedRoadmap.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span>Progress: {selectedRoadmap.progress}%</span>
              </div>
            </div>
            
            <div>
              <Progress value={selectedRoadmap.progress} className="h-2" />
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Roadmap Steps ({selectedRoadmap.steps.filter(s => s.completed).length}/{selectedRoadmap.steps.length})
              </h4>
              <div className="space-y-2">
                {selectedRoadmap.steps.map((step, index) => (
                  <div 
                    key={step.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      step.completed ? 'bg-muted/50' : 'bg-background'
                    }`}
                  >
                    <Checkbox
                      checked={step.completed}
                      onCheckedChange={() => handleStepComplete(selectedRoadmap.id, step.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">
                          Step {index + 1}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {formatDuration(step.duration)}
                        </Badge>
                        {step.completed && (
                          <Badge variant="default" className="flex items-center gap-1 text-xs">
                            <CheckCircle className="h-3 w-3" />
                            Done
                          </Badge>
                        )}
                      </div>
                      <h5 className={`font-medium ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {step.title}
                      </h5>
                      <p className={`text-sm ${step.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                        {step.description}
                      </p>
                      {step.completed && step.completedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Completed on {formatDate(step.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedRoadmap.completed && (
              <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <Trophy className="h-5 w-5" />
                    <span className="font-semibold">Congratulations!</span>
                  </div>
                  <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                    You've successfully completed this roadmap! 🎉
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Roadmaps</h2>
          <p className="text-muted-foreground">Track your learning and progress</p>
        </div>
        <Badge variant="secondary">
          {roadmaps.length} roadmap{roadmaps.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {roadmaps.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No roadmaps yet</h3>
              <p className="text-muted-foreground mb-4">
                Ask Sara to create a personalized learning roadmap for you!
              </p>
              <p className="text-sm text-muted-foreground">
                Try: "Create a roadmap to learn React in 3 months"
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {roadmaps.map((roadmap) => (
            <Card 
              key={roadmap.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedRoadmap(roadmap)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{roadmap.title}</h3>
                    <p className="text-muted-foreground text-sm">{roadmap.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant={roadmap.completed ? "default" : "secondary"}>
                      {roadmap.completed ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDuration(roadmap.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span>{roadmap.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{roadmap.steps.length} steps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span>{roadmap.steps.filter(s => s.completed).length} done</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{roadmap.progress}%</span>
                  </div>
                  <Progress value={roadmap.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}