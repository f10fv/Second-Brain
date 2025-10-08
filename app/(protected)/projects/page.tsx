"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ChevronRight,
  Clock,
  Plus,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Filter,
  Search,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AddProjectDialog } from "@/components/dialogs/add-project-dialog"
import { EditProjectDialog } from "@/components/dialogs/edit-project-dialog"
import { ViewProjectDialog } from "@/components/dialogs/view-project-dialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { PageWrapper } from "@/components/animated/page-wrapper"
import { AnimatedCard } from "@/components/animated/animated-card"
import { StaggerContainer } from "@/components/animated/stagger-container"
import { toast } from "sonner"

interface Project {
  id: string
  title: string
  description?: string
  status: string
  startDate?: Date
  endDate?: Date
  progress: number
  createdAt: Date
  updatedAt: Date
  userId: string
  tasks?: {
    id: string
    title: string
    completed: boolean
  }[]
}

export default function ProjectsPage() {
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setProjects(result.data)
        if (result.data.length > 0) {
          toast.success(`Loaded ${result.data.length} project${result.data.length === 1 ? '' : 's'}`)
        }
      } else {
        console.error('Failed to fetch projects:', result.error)
        toast.error('Failed to fetch projects')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok && data.success) {
        setProjects(prev => prev.filter(p => p.id !== id))
        toast.success('Project deleted')
      } else {
        toast.error(data.error || 'Failed to delete project')
      }
    } catch (err) {
      console.error('Delete failed', err)
      toast.error('Failed to delete project')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
      case "in-progress":
      case "active":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
      case "planning":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getStatusDisplayName = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "Completed"
      case "in-progress":
      case "active":
        return "In Progress"
      case "planning":
        return "Planning"
      default:
        return status
    }
  }

  const getDaysUntilDeadline = (deadline: Date | null | undefined) => {
    if (!deadline) return null
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getProjectStats = (project: Project) => {
    const tasks = project.tasks ?? []
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.completed).length
    return { total: totalTasks, completed: completedTasks }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFilter = selectedFilter === "all" || project.status.toLowerCase() === selectedFilter
    return matchesSearch && matchesFilter
  })

  const projectStats = {
    total: projects.length,
    completed: projects.filter((p) => p.status.toLowerCase() === "completed").length,
    inProgress: projects.filter((p) => p.status.toLowerCase() === "in-progress" || p.status.toLowerCase() === "active").length,
    planning: projects.filter((p) => p.status.toLowerCase() === "planning").length,
    overdue: projects.filter((p) => {
      if (!p.endDate) return false
      const days = getDaysUntilDeadline(p.endDate || null)
      return days !== null && days < 0
    }).length,
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-1">Manage and track all your work projects with detailed insights</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Button onClick={() => setProjectDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <AnimatedCard className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{projectStats.total}</p>
                <p className="text-sm text-blue-600 dark:text-blue-500">Total Projects</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{projectStats.completed}</p>
                <p className="text-sm text-green-600 dark:text-green-500">Completed</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{projectStats.inProgress}</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-500">In Progress</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{projectStats.planning}</p>
                <p className="text-sm text-purple-600 dark:text-purple-500">Planning</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{projectStats.overdue}</p>
                <p className="text-sm text-red-600 dark:text-red-500">Overdue</p>
              </div>
            </div>
          </AnimatedCard>
        </StaggerContainer>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("all")}
            >
              All
            </Button>
            <Button
              variant={selectedFilter === "in-progress" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("in-progress")}
            >
              Active
            </Button>
            <Button
              variant={selectedFilter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("completed")}
            >
              Completed
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="mt-6">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg mb-2">
                  {searchQuery || selectedFilter !== "all" 
                    ? "No projects match your search criteria" 
                    : "No projects yet"}
                </div>
                <div className="text-muted-foreground text-sm mb-4">
                  {searchQuery || selectedFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Create your first project to get started"}
                </div>
              </div>
            ) : (
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                              {filteredProjects.map((project) => {
                  const daysUntilDeadline = getDaysUntilDeadline(project.endDate || null)
                  const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0
                  const isDueSoon = daysUntilDeadline !== null && daysUntilDeadline <= 3 && daysUntilDeadline >= 0

                return (
                  <AnimatedCard key={project.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full bg-blue-500`} />
                            <Badge variant="outline" className={getStatusColor(project.status)}>
                              {getStatusDisplayName(project.status)}
                            </Badge>
                            <Badge variant="outline" className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              {project.tasks?.length ?? 0} Tasks
                            </Badge>
                          </div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {project.title}
                          </CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">{project.description}</CardDescription>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedProject(project); setViewDialogOpen(true); }}>View</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedProject(project); setEditDialogOpen(true); }}>Edit</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(project.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-3">
                      <div className="space-y-4">
                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              {getProjectStats(project).completed}/{getProjectStats(project).total} tasks
                            </span>
                          </div>
                        </div>

                        {/* Deadline */}
                        {project.endDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span
                              className={`${isOverdue ? "text-red-600" : isDueSoon ? "text-orange-600" : "text-muted-foreground"}`}
                            >
                              {isOverdue
                                ? `Overdue by ${Math.abs(daysUntilDeadline!)} days`
                                : daysUntilDeadline === 0
                                  ? "Due today"
                                  : daysUntilDeadline === 1
                                    ? "Due tomorrow"
                                    : `Due in ${daysUntilDeadline} days`}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-3">
                      <Button
                        asChild
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        <Link href={`/projects/${project.id}`}>
                          View Project
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </AnimatedCard>
                )
              })}
            </StaggerContainer>
            )}
          </TabsContent>
          
          {/* Dialogs */}
          <ViewProjectDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} project={selectedProject} />
          <EditProjectDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            project={selectedProject}
            onProjectUpdated={(updated) => {
              setProjects(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated, tasks: updated.tasks ?? p.tasks } : p))
              if (selectedProject?.id === updated.id) {
                setSelectedProject((prev: { tasks: any }) => ({ ...prev, ...updated, tasks: updated.tasks ?? prev?.tasks }))
              }
            }}
          />
          <AddProjectDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} onProjectCreated={() => fetchProjects()} />

          <TabsContent value="list" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
                <CardDescription>Detailed view of all your projects with key metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground text-lg mb-2">
                      {searchQuery || selectedFilter !== "all" 
                        ? "No projects match your search criteria" 
                        : "No projects yet"}
                    </div>
                    <div className="text-muted-foreground text-sm mb-4">
                      {searchQuery || selectedFilter !== "all" 
                        ? "Try adjusting your search or filters" 
                        : "Create your first project to get started"}
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                                             {filteredProjects.map((project) => {
                         const daysUntilDeadline = getDaysUntilDeadline(project.endDate || null)
                         const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0

                        return (
                          <div
                            key={project.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`w-4 h-4 rounded-full bg-blue-500`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium truncate">{project.title}</h3>
                                  <Badge variant="outline" className={getStatusColor(project.status)}>
                                    {getStatusDisplayName(project.status)}
                                  </Badge>
                                  <Badge variant="outline" className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                    {project.tasks?.length ?? 0} Tasks
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>
                                    Tasks: {getProjectStats(project).completed}/{getProjectStats(project).total}
                                  </span>
                                  {project.endDate && (
                                    <span className={isOverdue ? "text-red-600" : ""}>
                                      {isOverdue
                                        ? `Overdue by ${Math.abs(daysUntilDeadline!)} days`
                                        : daysUntilDeadline === 0
                                          ? "Due today"
                                          : `Due in ${daysUntilDeadline} days`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">


                              <div className="flex items-center gap-2 min-w-[120px]">
                                <Progress value={project.progress} className="h-2 flex-1" />
                                <span className="text-sm font-medium min-w-[35px]">{project.progress}%</span>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                
                              >
                                <Link href={`/projects/${project.id}`}>
                                  <ChevronRight className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

    </PageWrapper>
  )
}
