"use client"

import { useState, useEffect } from "react"
import { Plus, Target, TrendingUp, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { AddGoalDialog } from "@/components/dialogs/add-goal-dialog"
import { EditGoalDialog } from "@/components/dialogs/edit-goal-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function GoalsPage() {
  const [goalDialogOpen, setGoalDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [goalToEdit, setGoalToEdit] = useState<any>(null)

  const fetchGoals = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/goals")
      const data = await res.json()
      if (res.ok && data.success) {
        setGoals(data.data)
      } else {
        setError(data.error || "Failed to fetch goals")
      }
    } catch (err) {
      setError("Failed to fetch goals")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return
    try {
      const response = await fetch(`/api/goals/${id}`, { method: "DELETE" })
      if (response.ok) {
        setGoals(goals => goals.filter(g => g.id !== id))
      } else {
        alert("Failed to delete goal")
      }
    } catch (err) {
      alert("Failed to delete goal")
    }
  }

  const openEdit = (goal: any) => {
    setGoalToEdit(goal)
    setEditDialogOpen(true)
  }

  const toggleMilestone = async (goalId: string, milestoneId: string, completed: boolean) => {
    try {
      await fetch(`/api/goals/${goalId}/milestones`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, completed }),
      })
      fetchGoals() // Refresh goals to get updated progress
    } catch (err) {
      alert("Failed to update milestone")
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      career: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      health: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      financial: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      personal: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
      education: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
      creative: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
      skill: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    }
    return colors[category.toLowerCase()] || "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400"
  }

  const getDaysLeft = (targetDate: string) => {
    const target = new Date(targetDate)
    const now = new Date()
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return "Overdue"
    if (diff === 0) return "Due today"
    if (diff === 1) return "1 day left"
    return `${diff} days left`
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals & Progress</h1>
          <p className="text-muted-foreground">Set, track, and achieve your personal and professional goals</p>
        </div>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Goals</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading goals...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No goals yet. Create your first goal!</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goals.filter(goal => goal.status === "ACTIVE").map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Target className="h-5 w-5 text-primary" />
                      <Badge variant="outline" className={getCategoryColor(goal.category)}>
                        {goal.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <CardDescription>{goal.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Milestones</h4>
                        <div className="space-y-1">
                          {goal.milestones.map((milestone: any) => (
                            <div key={milestone.id} className="flex items-center gap-2 text-sm">
                              <div
                                className={`h-3 w-3 rounded-full cursor-pointer ${
                                  milestone.completed ? "bg-primary" : "border border-muted"
                                }`}
                                onClick={() => toggleMilestone(goal.id, milestone.id, !milestone.completed)}
                              />
                              <span className={milestone.completed ? "line-through text-muted-foreground" : ""}>
                                {milestone.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Due: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : "No deadline"}</span>
                      <span>{goal.targetDate ? getDaysLeft(goal.targetDate) : "No deadline"}</span>
                    </div>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(goal)}>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(goal.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-full p-6">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Create New Goal</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Set a new goal and start tracking your progress
                  </p>
                  <Button onClick={() => setGoalDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Goal
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Goals</CardTitle>
              <CardDescription>Goals you've successfully achieved</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {goals.filter(goal => goal.status === "COMPLETED").length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No completed goals yet.</div>
                  ) : (
                    goals.filter(goal => goal.status === "COMPLETED").map((goal) => (
                      <div key={goal.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                        <div className="space-y-1">
                          <h4 className="font-medium">{goal.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className={getCategoryColor(goal.category)}>
                              {goal.category}
                            </Badge>
                            <span>•</span>
                            <span>Completed {goal.updatedAt ? new Date(goal.updatedAt).toLocaleDateString() : "recently"}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">Completed</div>
                          <div className="text-xs text-muted-foreground">
                            {goal.updatedAt ? new Date(goal.updatedAt).toLocaleDateString() : "Recently"}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
      <AddGoalDialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen} onCreated={fetchGoals} />
      {goalToEdit && (
        <EditGoalDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          goal={goalToEdit}
          onUpdated={() => {
            fetchGoals()
            setEditDialogOpen(false)
            setGoalToEdit(null)
          }}
        />
      )}
    </div>
  )
}
