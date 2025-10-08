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

interface AddJournalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddJournalDialog({ open, onOpenChange }: AddJournalDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mood, setMood] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ title, content, mood })

    // Reset form
    setTitle("")
    setContent("")
    setMood("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Journal Entry</DialogTitle>
          <DialogDescription>Capture your thoughts, experiences, and reflections.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="journal-title">Title *</Label>
              <Input
                id="journal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind today?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue placeholder="How are you feeling?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="😊">😊 Happy</SelectItem>
                  <SelectItem value="😌">😌 Calm</SelectItem>
                  <SelectItem value="💡">💡 Inspired</SelectItem>
                  <SelectItem value="🤔">🤔 Thoughtful</SelectItem>
                  <SelectItem value="⚡">⚡ Energetic</SelectItem>
                  <SelectItem value="😔">😔 Sad</SelectItem>
                  <SelectItem value="😤">😤 Frustrated</SelectItem>
                  <SelectItem value="😴">😴 Tired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="journal-content">Content *</Label>
              <Textarea
                id="journal-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write about your day, thoughts, or experiences..."
                rows={8}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Entry</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
