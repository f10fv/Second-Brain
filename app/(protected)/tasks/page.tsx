"use client"

import { useState, useEffect } from "react"
import {
  Clock,
  HeartPulse,
  Plus,
  Timer,
  Calendar as CalendarIcon,
  Filter,
  MoreHorizontal,
  Star,
  Flame,
  Target,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { EditTaskDialog } from "@/components/dialogs/edit-task-dialog";
import { AddHabitDialog } from "@/components/dialogs/add-habit-dialog";
import { EditHabitDialog } from "@/components/dialogs/edit-habit-dialog";

export default function TasksPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [tasks, setTasks] = useState<any[]>([])
  const [habits, setHabits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [habitDialogOpen, setHabitDialogOpen] = useState(false);
  const [editHabitDialogOpen, setEditHabitDialogOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<any>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tasks')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setTasks(result.data)
      } else {
        setError(result.error || 'Failed to fetch tasks')
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setError('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchHabits = async () => {
    try {
      const response = await fetch('/api/habits')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setHabits(result.data)
      } else {
        console.error('Failed to fetch habits:', result.error)
      }
    } catch (error) {
      console.error('Error fetching habits:', error)
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchHabits()
  }, [])

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    overdue: tasks.filter(task => {
      if (!task.dueDate || task.completed) return false
      return new Date(task.dueDate) < new Date()
    }).length,
    today: tasks.filter(task => {
      if (!task.dueDate) return false
      const today = new Date()
      const taskDate = new Date(task.dueDate)
      return taskDate.toDateString() === today.toDateString()
    }).length,
  }

  const selectedDayTasks = tasks.filter(task => {
    if (!task.dueDate || !selectedDate) return false;
    const due = new Date(task.dueDate);
    return (
      due.getFullYear() === selectedDate.getFullYear() &&
      due.getMonth() === selectedDate.getMonth() &&
      due.getDate() === selectedDate.getDate()
    );
  });

  const habitStats = {
    activeHabits: habits.length,
    completionRate: habits.length > 0 ? Math.round(habits.reduce((acc, habit) => acc + (habit.currentStreak || 0), 0) / habits.length) : 0,
    longestStreak: habits.length > 0 ? Math.max(...habits.map(h => h.currentStreak || 0)) : 0,
    todayCompleted: habits.filter(h => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return h.habitEntries?.some((entry: any) => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime() && entry.completed;
      });
    }).length,
  }

  const handleToggleCompleted = async (taskId: string, current: boolean) => {
    try {
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, completed: !current } : task
        )
      );
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current }),
      });
    } catch (err) {
      setError("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    setTasks(tasks => tasks.filter(t => t.id !== taskId));
  };

  const handleDuplicateTask = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, { method: "POST" });
    const data = await res.json();
    if (data.success) setTasks(tasks => [data.data, ...tasks]);
  };

  const handleEditTask = (task: any) => {
    setTaskToEdit(task);
    setEditDialogOpen(true);
  };

  const handleToggleHabitCompleted = async (habitId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/habits/${habitId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        fetchHabits(); // Refresh habits to get updated streaks
      }
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await fetch(`/api/habits/${habitId}`, { method: 'DELETE' });
      setHabits(habits => habits.filter(h => h.id !== habitId));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const handleEditHabit = (habit: any) => {
    setHabitToEdit(habit);
    setEditHabitDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks & Habits</h1>
          <p className="text-muted-foreground">Manage your daily tasks and build lasting habits</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Tasks</p>
                <p className="text-2xl font-bold">{taskStats.today}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Habit Streak</p>
                <p className="text-2xl font-bold">{habitStats.longestStreak}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Habits</p>
                <p className="text-2xl font-bold">{habitStats.activeHabits}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <HeartPulse className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="habits" className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4" />
            Habits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-6">
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Today's Focus
                      </CardTitle>
                      <CardDescription>Your most important tasks for today</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <div className="text-center py-4 text-muted-foreground">Loading tasks...</div>
                  ) : error ? (
                    <div className="text-center py-4 text-red-600">{error}</div>
                  ) : selectedDayTasks.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No tasks for this day</div>
                  ) : (
                    selectedDayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleCompleted(task.id, task.completed)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                task.priority === "high"
                                  ? "border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950/30"
                                  : task.priority === "medium"
                                    ? "border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:bg-yellow-950/30"
                                    : "border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-400 dark:bg-green-950/30"
                              }`}
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            {task.project && (
                              <span>{task.project.title}</span>
                            )}
                            {task.description && (
                              <span className="truncate">{task.description}</span>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTask(task)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateTask(task.id)}>Duplicate</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTask(task.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Tasks</CardTitle>
                      <CardDescription>Manage all your tasks and projects</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {loading ? (
                      <div className="text-center py-4 text-muted-foreground">Loading tasks...</div>
                    ) : error ? (
                      <div className="text-center py-4 text-red-600">{error}</div>
                    ) : tasks.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">No tasks found</div>
                    ) : (
                      tasks.map((task) => (
                        <div
                          key={task.id}
                          className="group flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <Checkbox 
                            checked={task.completed}
                            onCheckedChange={() => handleToggleCompleted(task.id, task.completed)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                                {task.title}
                              </p>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  task.priority === "high"
                                    ? "border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950/30"
                                    : task.priority === "medium"
                                      ? "border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:bg-yellow-950/30"
                                      : "border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-400 dark:bg-green-950/30"
                                }`}
                              >
                                {task.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {task.dueDate && (
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                              {task.project && (
                                <span>{task.project.title}</span>
                              )}
                              {task.description && (
                                <span className="truncate">{task.description}</span>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditTask(task)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateTask(task.id)}>Duplicate</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTask(task.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border-0"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tasks Completed</span>
                      <span className="font-medium">
                        {taskStats.completed}/{taskStats.total}
                      </span>
                    </div>
                    <Progress value={taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0} className="h-2" />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
                      <p className="text-xs text-muted-foreground">Overdue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="habits" className="space-y-6">
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-500" />
                        Today's Habits
                      </CardTitle>
                      <CardDescription>Complete your daily habits to build streaks</CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setHabitDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {habits.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No habits found. Create your first habit to get started!
                    </div>
                  ) : (
                    habits.map((habit) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const isCompletedToday = habit.habitEntries?.some((entry: any) => {
                        const entryDate = new Date(entry.date);
                        entryDate.setHours(0, 0, 0, 0);
                        return entryDate.getTime() === today.getTime() && entry.completed;
                      });

                                            return (
                        <div
                          key={habit.id}
                      className="group flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                          <div className="text-2xl">🎯</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{habit.title}</h4>
                          <Badge variant="outline" className="text-xs">
                                {habit.frequency}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                                {habit.currentStreak || 0} day streak
                          </span>
                              {habit.description && (
                                <span className="truncate">{habit.description}</span>
                              )}
                        </div>
                        <div className="flex gap-1">
                              {Array.from({ length: 7 }).map((_, j) => {
                                const entryDate = new Date();
                                entryDate.setDate(entryDate.getDate() - (6 - j));
                                entryDate.setHours(0, 0, 0, 0);
                                
                                const isCompleted = habit.habitEntries?.some((entry: any) => {
                                  const entryDate2 = new Date(entry.date);
                                  entryDate2.setHours(0, 0, 0, 0);
                                  return entryDate2.getTime() === entryDate.getTime() && entry.completed;
                                });
                                
                                return (
                                  <div 
                                    key={j} 
                                    className={`h-2 w-full rounded-full ${isCompleted ? "bg-primary" : "bg-muted"}`} 
                                  />
                                );
                              })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                              checked={isCompletedToday}
                              onCheckedChange={() => handleToggleHabitCompleted(habit.id, isCompletedToday)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditHabit(habit)}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteHabit(habit.id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>Habit Categories</CardTitle>
                  <CardDescription>Organize your habits by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {habits.length === 0 ? (
                      <div className="col-span-3 text-center py-8 text-muted-foreground">
                        No habits to categorize yet
                      </div>
                    ) : (
                      <>
                        <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                            <h4 className="font-medium">Daily</h4>
                          <Badge variant="outline" className="text-xs ml-auto">
                              {habits.filter(h => h.frequency === 'daily').length}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Completion</span>
                              <span className="font-medium">
                                {habits.filter(h => h.frequency === 'daily').length > 0 
                                  ? Math.round(habits.filter(h => h.frequency === 'daily').reduce((acc, h) => acc + (h.currentStreak || 0), 0) / habits.filter(h => h.frequency === 'daily').length)
                                  : 0}%
                              </span>
                            </div>
                            <Progress 
                              value={habits.filter(h => h.frequency === 'daily').length > 0 
                                ? habits.filter(h => h.frequency === 'daily').reduce((acc, h) => acc + (h.currentStreak || 0), 0) / habits.filter(h => h.frequency === 'daily').length
                                : 0} 
                              className="h-2" 
                            />
                          </div>
                        </div>
                        <div className="p-4 rounded-lg border bg-card">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500" />
                            <h4 className="font-medium">Weekly</h4>
                            <Badge variant="outline" className="text-xs ml-auto">
                              {habits.filter(h => h.frequency === 'weekly').length}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Completion</span>
                              <span className="font-medium">
                                {habits.filter(h => h.frequency === 'weekly').length > 0 
                                  ? Math.round(habits.filter(h => h.frequency === 'weekly').reduce((acc, h) => acc + (h.currentStreak || 0), 0) / habits.filter(h => h.frequency === 'weekly').length)
                                  : 0}%
                              </span>
                            </div>
                            <Progress 
                              value={habits.filter(h => h.frequency === 'weekly').length > 0 
                                ? habits.filter(h => h.frequency === 'weekly').reduce((acc, h) => acc + (h.currentStreak || 0), 0) / habits.filter(h => h.frequency === 'weekly').length
                                : 0} 
                              className="h-2" 
                            />
                          </div>
                        </div>
                        <div className="p-4 rounded-lg border bg-card">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-3 w-3 rounded-full bg-purple-500" />
                            <h4 className="font-medium">Monthly</h4>
                            <Badge variant="outline" className="text-xs ml-auto">
                              {habits.filter(h => h.frequency === 'monthly').length}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Completion</span>
                              <span className="font-medium">
                                {habits.filter(h => h.frequency === 'monthly').length > 0 
                                  ? Math.round(habits.filter(h => h.frequency === 'monthly').reduce((acc, h) => acc + (h.currentStreak || 0), 0) / habits.filter(h => h.frequency === 'monthly').length)
                                  : 0}%
                              </span>
                            </div>
                            <Progress 
                              value={habits.filter(h => h.frequency === 'monthly').length > 0 
                                ? habits.filter(h => h.frequency === 'monthly').reduce((acc, h) => acc + (h.currentStreak || 0), 0) / habits.filter(h => h.frequency === 'monthly').length
                                : 0} 
                              className="h-2" 
                            />
                        </div>
                      </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{habitStats.completionRate}%</div>
                    <p className="text-sm text-muted-foreground">Overall Completion</p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Longest Streak</span>
                      <span className="text-sm font-medium">{habitStats.longestStreak} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Active Habits</span>
                      <span className="text-sm font-medium">{habitStats.activeHabits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Today Completed</span>
                      <span className="text-sm font-medium">
                        {habitStats.todayCompleted}/{habitStats.activeHabits}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Monthly Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-7 gap-1 text-xs text-center text-muted-foreground">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                        <div key={i}>{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 35 }).map((_, i) => (
                        <div
                          key={i}
                          className={`aspect-square rounded-sm ${
                            Math.random() > 0.3 ? (Math.random() > 0.7 ? "bg-primary" : "bg-primary/60") : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Less</span>
                      <span>More</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Daily Motivation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="text-4xl">🎯</div>
                    <p className="text-sm font-medium">
                      "Success is the sum of small efforts repeated day in and day out."
                    </p>
                    <p className="text-xs text-muted-foreground">- Robert Collier</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      {taskToEdit && (
        <EditTaskDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          task={taskToEdit}
          onTaskUpdated={updatedTask => {
            setTasks(tasks => tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
            setEditDialogOpen(false);
            setTaskToEdit(null);
          }}
        />
      )}
      
      <AddHabitDialog
        open={habitDialogOpen}
        onOpenChange={setHabitDialogOpen}
        onHabitCreated={() => {
          fetchHabits();
        }}
      />
      
      {habitToEdit && (
        <EditHabitDialog
          open={editHabitDialogOpen}
          onOpenChange={setEditHabitDialogOpen}
          habit={habitToEdit}
          onHabitUpdated={updatedHabit => {
            setHabits(habits => habits.map(h => h.id === updatedHabit.id ? updatedHabit : h));
            setEditHabitDialogOpen(false);
            setHabitToEdit(null);
          }}
        />
      )}
    </div>
  )
}