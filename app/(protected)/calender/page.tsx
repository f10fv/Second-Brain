"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
  Clock,
  CheckCircle,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  projectId?: string;
  project?: {
    id: string;
    title: string;
  };
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const priorityColors = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#10b981",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [searchTerm, setSearchTerm] = useState("")

  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  // Generate calendar days including previous and next month days
  const calendarDays = [] as { date: Date; isCurrentMonth: boolean }[]

  // Previous month days
  const prevMonth = new Date(currentYear, currentMonth - 1, 0) 
  const prevMonthDays = prevMonth.getDate()
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    calendarDays.push({
      date: new Date(currentYear, currentMonth - 1, day),
      isCurrentMonth: false,
    })
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth, day),
      isCurrentMonth: true,
    })
  }

  // Next month days to fill the grid
  const remainingCells = 42 - calendarDays.length
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push({
      date: new Date(currentYear, currentMonth + 1, day),
      isCurrentMonth: false,
    })
  }

  // Generate week days
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      weekDays.push(day)
    }
    return weekDays
  }

  // Filter tasks based on search term
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.project?.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setDate(prev.getDate() - 7)
      } else {
        newDate.setDate(prev.getDate() + 7)
      }
      return newDate
    })
  }

  const navigateDay = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setDate(prev.getDate() - 1)
      } else {
        newDate.setDate(prev.getDate() + 1)
      }
      return newDate
    })
  }

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tasks')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setTasks(result.data)
      } else {
        console.error('Failed to fetch tasks:', result.error)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getTasksForDate = (date: Date) => {
    const tasksToFilter = searchTerm ? filteredTasks : tasks
    return tasksToFilter.filter((task) => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return taskDate.toDateString() === date.toDateString()
    })
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const handleToggleComplete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !tasks.find(t => t.id === taskId)?.completed }),
      })
      
      if (response.ok) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ))
        toast.success("Task updated successfully")
      } else {
        toast.error("Failed to update task")
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error("Failed to update task")
    }
  }

  const renderMonthView = () => (
    <div className="flex-1 flex flex-col bg-background">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 border-b bg-card">
        {dayNames.map((day) => (
          <div key={day} className="p-4 text-center">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{day}</div>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6">
        {calendarDays.map((day, index) => {
          const dayTasks = getTasksForDate(day.date)
          const isCurrentDay = isToday(day.date)

          return (
            <div
              key={index}
              className={`
                border-r border-b p-2 min-h-[120px] relative
                ${!day.isCurrentMonth ? "bg-muted/50" : "bg-background"}
                hover:bg-muted cursor-pointer transition-colors
              `}
              onClick={() => setSelectedDate(day.date)}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    text-sm font-medium
                    ${!day.isCurrentMonth ? "text-muted-foreground/50" : "text-foreground"}
                    ${isCurrentDay ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs" : ""}
                  `}
                >
                  {day.date.getDate()}
                </span>
                {dayTasks.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {dayTasks.length}
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <motion.div
                    key={task.id}
                    className="text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.MEDIUM }}
                    whileHover={{ scale: 1.02 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTask(task)
                      setShowTaskDialog(true)
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {task.completed ? <CheckCircle className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                      <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
                    </div>
                  </motion.div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-muted-foreground pl-1">+{dayTasks.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderWeekView = () => {
    const weekDays = getWeekDays()
    
    return (
      <div className="flex-1 flex flex-col bg-background">
        {/* Week Header */}
        <div className="grid grid-cols-7 border-b bg-card">
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="p-4 text-center">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {dayNames[day.getDay()]}
              </div>
              <div className={`text-lg font-semibold mt-1 ${isToday(day) ? "text-primary" : "text-foreground"}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Week Grid */}
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((day) => {
            const dayTasks = getTasksForDate(day)
            const isCurrentDay = isToday(day)

            return (
              <div
                key={day.toISOString()}
                className={`
                  border-r p-3 min-h-[400px] relative
                  ${isCurrentDay ? "bg-primary/10" : "bg-background"}
                  hover:bg-muted transition-colors
                `}
              >
                <div className="space-y-2">
                  {dayTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      className="p-2 rounded text-white cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.MEDIUM }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSelectedTask(task)
                        setShowTaskDialog(true)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleComplete(task.id)
                          }}
                          className="text-white hover:text-gray-200"
                        >
                          {task.completed ? <CheckCircle className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate ${task.completed ? 'line-through' : ''}`}>
                            {task.title}
                          </div>
                          {task.project && (
                            <div className="text-xs opacity-80 truncate">{task.project.title}</div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {dayTasks.length === 0 && (
                    <div className="text-muted-foreground text-sm text-center py-4">No tasks</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const dayTasks = getTasksForDate(currentDate)
    const isCurrentDay = isToday(currentDate)
    
    return (
      <div className="flex-1 flex flex-col bg-background">
        {/* Day Header */}
        <div className="border-b bg-card p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {dayNames[currentDate.getDay()]}
            </div>
            <div className={`text-4xl font-bold mt-2 ${isCurrentDay ? "text-primary" : "text-foreground"}`}>
              {currentDate.getDate()}
            </div>
            <div className="text-lg text-muted-foreground mt-1">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
          </div>
        </div>

        {/* Day Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {dayTasks.map((task) => (
                <motion.div
                  key={task.id}
                  className="p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all"
                  style={{ 
                    backgroundColor: priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.MEDIUM,
                    opacity: task.completed ? 0.7 : 1
                  }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setSelectedTask(task)
                    setShowTaskDialog(true)
                  }}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleComplete(task.id)
                      }}
                      className="text-white hover:text-gray-200"
                    >
                      {task.completed ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                    </button>
                    <div className="flex-1">
                      <div className={`text-lg font-semibold text-white ${task.completed ? 'line-through' : ''}`}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-white/80 mt-1">{task.description}</div>
                      )}
                      {task.project && (
                        <div className="text-white/60 text-sm mt-1">Project: {task.project.title}</div>
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-white border-white/30"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </motion.div>
              ))}
              {dayTasks.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-muted-foreground text-lg">No tasks scheduled for this day</div>
                  <div className="text-muted-foreground text-sm mt-2">Tasks with due dates will appear here</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Calendar</h1>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-primary border-primary hover:bg-primary/10"
            >
              Today
            </Button>

            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  if (view === "month") navigateMonth("prev")
                  else if (view === "week") navigateWeek("prev")
                  else navigateDay("prev")
                }} 
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  if (view === "month") navigateMonth("next")
                  else if (view === "week") navigateWeek("next")
                  else navigateDay("next")
                }} 
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <h2 className="text-xl font-semibold min-w-[200px]">
              {view === "month" && `${monthNames[currentMonth]} ${currentYear}`}
              {view === "week" && `Week of ${getWeekDays()[0].toLocaleDateString()}`}
              {view === "day" && `${dayNames[currentDate.getDay()]}, ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tasks..." 
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center border rounded-lg bg-muted">
              <Button
                variant={view === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("month")}
                className={view === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}
              >
                Month
              </Button>
              <Button
                variant={view === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("week")}
                className={view === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}
              >
                Week
              </Button>
              <Button
                variant={view === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("day")}
                className={view === "day" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}
              >
                Day
              </Button>
            </div>
            </div>
          </div>
        </div>

      <div className="flex h-[calc(100vh-80px)]">
          {/* Sidebar */}
        <div className="w-80 border-r bg-card p-6">
          {/* Task Priority Legend */}
            <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">
              Task Priorities
                </h3>
            <div className="space-y-2">
              {Object.entries(priorityColors).map(([priority, color]) => (
                <div key={priority} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-sm text-muted-foreground">{priority}</span>
                </div>
              ))}
                </div>
              </div>

          {/* Today's Tasks */}
          <div>
            <h3 className="text-sm font-medium mb-3">
              Today's Tasks
            </h3>
            <div className="space-y-2">
              {getTasksForDate(today).map((task) => (
                <div
                  key={task.id}
                  className="p-2 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  style={{
                    borderLeft: `3px solid ${
                      priorityColors[
                        task.priority as keyof typeof priorityColors
                      ] || priorityColors.MEDIUM
                    }`,
                  }}
                  onClick={() => {
                    setSelectedTask(task);
                    setShowTaskDialog(true);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleComplete(task.id);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {task.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div
                        className={`text-sm font-medium ${
                          task.completed
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </div>
                      {task.project && (
                        <div className="text-xs text-muted-foreground">
                          {task.project.title}
                        </div>
                      )}
              </div>
            </div>
                </div>
              ))}
              {getTasksForDate(today).length === 0 && (
                <div className="text-sm text-muted-foreground">
                  {searchTerm ? "No matching tasks today" : "No tasks due today"}
                </div>
              )}
            </div>
          </div>

          {/* Task Statistics */}
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">
              Task Statistics
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Total Tasks:</span>
                <span>{searchTerm ? filteredTasks.length : tasks.length}</span>
                </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span>
                  {searchTerm 
                    ? filteredTasks.filter((t) => t.completed).length
                    : tasks.filter((t) => t.completed).length
                  }
                </span>
            </div>
              <div className="flex justify-between">
                <span>Pending:</span>
                <span>
                  {searchTerm 
                    ? filteredTasks.filter((t) => !t.completed).length
                    : tasks.filter((t) => !t.completed).length
                  }
                      </span>
                    </div>
              {searchTerm && (
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Showing results for "{searchTerm}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Calendar View */}
        {view === "month" && renderMonthView()}
        {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()}
      </div>

      {/* View Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
            <DialogDescription>
              {selectedTask && (
                <>
                  {selectedTask.priority}{" "}
                  Priority • Due:{" "}
                  {selectedTask?.dueDate
                    ? new Date(selectedTask.dueDate).toLocaleDateString()
                    : "No due date"}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              {selectedTask.description && (
                <p className="text-muted-foreground">{selectedTask.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Created:{" "}
                    {new Date(selectedTask.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {selectedTask.project && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Project: {selectedTask.project.title}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleComplete(selectedTask.id)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  {selectedTask.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  <span>
                    {selectedTask.completed ? "Completed" : "Mark as completed"}
                  </span>
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowTaskDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
