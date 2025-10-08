"use client"

import { useState } from "react"
import { MoonIcon, SunIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddTaskDialog } from "@/components/dialogs/add-task-dialog"
import { AddHabitDialog } from "@/components/dialogs/add-habit-dialog"
import { AddProjectDialog } from "@/components/dialogs/add-project-dialog"
import { AddJournalDialog } from "@/components/dialogs/add-journal-dialog"
import { AddSnippetDialog } from "@/components/dialogs/add-snippet-dialog"
import { AddWishlistDialog } from "@/components/dialogs/add-wishlist-dialog"
import { AddFinanceDialog } from "@/components/dialogs/add-finance-dialog"
import { AddEntertainmentDialog } from "@/components/dialogs/add-entertainment-dialog"
import { AddGoalDialog } from "@/components/dialogs/add-goal-dialog"
import { AddKnowledgeDialog } from "@/components/dialogs/add-knowledge-dialog"
import { UserButton } from "@/components/auth/user-button"

export function Header() {
  const { setTheme } = useTheme()
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [habitDialogOpen, setHabitDialogOpen] = useState(false)
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [journalDialogOpen, setJournalDialogOpen] = useState(false)
  const [snippetDialogOpen, setSnippetDialogOpen] = useState(false)
  const [wishlistDialogOpen, setWishlistDialogOpen] = useState(false)
  const [financeDialogOpen, setFinanceDialogOpen] = useState(false)
  const [entertainmentDialogOpen, setEntertainmentDialogOpen] = useState(false)
  const [goalDialogOpen, setGoalDialogOpen] = useState(false)
  const [knowledgeDialogOpen, setKnowledgeDialogOpen] = useState(false)

  const handleQuickAdd = (type: string) => {
    setQuickAddOpen(false)
    switch (type) {
      case "task":
        setTaskDialogOpen(true)
        break
      case "habit":
        setHabitDialogOpen(true)
        break
      case "project":
        setProjectDialogOpen(true)
        break
      case "journal":
        setJournalDialogOpen(true)
        break
      case "snippet":
        setSnippetDialogOpen(true)
        break
      case "wishlist":
        setWishlistDialogOpen(true)
        break
      case "finance":
        setFinanceDialogOpen(true)
        break
      case "entertainment":
        setEntertainmentDialogOpen(true)
        break
      case "goal":
        setGoalDialogOpen(true)
        break
      case "knowledge":
        setKnowledgeDialogOpen(true)
        break
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 ml-0 md:ml-0">
        {/* Add left margin on mobile to account for menu button */}
        <div className="ml-12 md:ml-0 flex-1" />
        {/* <div className="w-[200px]">
            <Input type="search" placeholder="Search..." className="h-8 w-full md:w-[200px] lg:w-[280px]" />
          </div> */}
        <div className="flex items-center gap-2">
          <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quick Add</DialogTitle>
                <DialogDescription>Choose what you want to create</DialogDescription>
              </DialogHeader>
              <div className="grid gap-2 py-4">
                <Button variant="ghost" className="justify-start h-12" onClick={() => handleQuickAdd("task")}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      ✓
                    </div>
                    <div className="text-left">
                      <div className="font-medium">New Task</div>
                      <div className="text-sm text-muted-foreground">Add a task to your to-do list</div>
                    </div>
                  </div>
                </Button>

                <Button variant="ghost" className="justify-start h-12" onClick={() => handleQuickAdd("habit")}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      🔄
                    </div>
                    <div className="text-left">
                      <div className="font-medium">New Habit</div>
                      <div className="text-sm text-muted-foreground">Create a new habit to track</div>
                    </div>
                  </div>
                </Button>

                <Button variant="ghost" className="justify-start h-12" onClick={() => handleQuickAdd("project")}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      📁
                    </div>
                    <div className="text-left">
                      <div className="font-medium">New Project</div>
                      <div className="text-sm text-muted-foreground">Start a new project</div>
                    </div>
                  </div>
                </Button>

                <Button variant="ghost" className="justify-start h-12" onClick={() => handleQuickAdd("journal")}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      📝
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Journal Entry</div>
                      <div className="text-sm text-muted-foreground">Write a new journal entry</div>
                    </div>
                  </div>
                </Button>

                <Button variant="ghost" className="justify-start h-12" onClick={() => handleQuickAdd("snippet")}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                      💻
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Code Snippet</div>
                      <div className="text-sm text-muted-foreground">Save a code snippet</div>
                    </div>
                  </div>
                </Button>
                <Button variant="ghost" className="justify-start h-12" onClick={() => handleQuickAdd("goal")}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      🎯
                    </div>
                    <div className="text-left">
                      <div className="font-medium">New Goal</div>
                      <div className="text-sm text-muted-foreground">Set a new goal to achieve</div>
                    </div>
                  </div>
                </Button>

                <Button variant="ghost" className="justify-start h-12" onClick={() => handleQuickAdd("finance")}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      💰
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Finance Transaction</div>
                      <div className="text-sm text-muted-foreground">Record income or expense</div>
                    </div>
                  </div>
                </Button>

                <Button variant="ghost" className="justify-start h-12" onClick={() => handleQuickAdd("entertainment")}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                      🎬
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Entertainment Item</div>
                      <div className="text-sm text-muted-foreground">Add movie, show, book, or game</div>
                    </div>
                  </div>
                </Button>

                <Button variant="ghost" className="justify-start h-12" onClick={() => handleQuickAdd("knowledge")}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      📚
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Knowledge Note</div>
                      <div className="text-sm text-muted-foreground">Save a note or idea</div>
                    </div>
                  </div>
                </Button>

                <Button variant="ghost" className="justify-start h-12" onClick={() => handleQuickAdd("wishlist")}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      🛍️
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Wishlist Item</div>
                      <div className="text-sm text-muted-foreground">Add item to your wishlist</div>
                    </div>
                  </div>
                </Button>
              </div>
            </DialogContent>
          </Dialog> 
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div>
            <UserButton />
          </div>
        </div>
      </header>

      <AddTaskDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} />
      <AddHabitDialog open={habitDialogOpen} onOpenChange={setHabitDialogOpen} />
      <AddProjectDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} />
      <AddJournalDialog open={journalDialogOpen} onOpenChange={setJournalDialogOpen} />
      <AddSnippetDialog open={snippetDialogOpen} onOpenChange={setSnippetDialogOpen} />
      <AddWishlistDialog open={wishlistDialogOpen} onOpenChange={setWishlistDialogOpen} />
      <AddFinanceDialog open={financeDialogOpen} onOpenChange={setFinanceDialogOpen} />
      <AddEntertainmentDialog open={entertainmentDialogOpen} onOpenChange={setEntertainmentDialogOpen} />
      <AddGoalDialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen} />
      <AddKnowledgeDialog open={knowledgeDialogOpen} onOpenChange={setKnowledgeDialogOpen} />
    </>
  )
}
