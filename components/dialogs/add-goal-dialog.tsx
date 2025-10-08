"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface AddGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function AddGoalDialog({ open, onOpenChange, onCreated }: AddGoalDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [targetDate, setTargetDate] = useState<Date>()
  const [milestones, setMilestones] = useState<string[]>([""])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const filteredMilestones = milestones.filter((m) => m.trim() !== "")
      
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
          targetDate: targetDate?.toISOString(),
          milestones: filteredMilestones,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Reset form
        setTitle("")
        setDescription("")
        setCategory("")
        setTargetDate(undefined)
        setMilestones([""])
        onOpenChange(false)
        onCreated?.()
      } else {
        setError(data.error || "Failed to create goal")
      }
    } catch (err) {
      setError("Failed to create goal")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addMilestone = () => {
    setMilestones([...milestones, ""])
  }

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const updateMilestone = (index: number, value: string) => {
    const updated = [...milestones]
    updated[index] = value
    setMilestones(updated)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
          <DialogDescription>Set a new goal and define milestones to track your progress.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goal-title">Goal Title *</Label>
              <Input
                id="goal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Learn React & Next.js"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-description">Description</Label>
              <Textarea
                id="goal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you want to achieve..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="career">Career</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="skill">Skill</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Date</Label>
                <Popover
                  open={calendarOpen} 
                  onOpenChange={setCalendarOpen}
                  modal={true}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !targetDate && "text-muted-foreground",
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {targetDate ? format(targetDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={targetDate}
                      onSelect={(date) => {
                        if (date) {
                          setTargetDate(date);
                          setCalendarOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Milestones</Label>
                <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={milestone}
                      onChange={(e) => updateMilestone(index, e.target.value)}
                      placeholder={`Milestone ${index + 1}`}
                    />
                    {milestones.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 bg-transparent"
                        onClick={() => removeMilestone(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-md">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
