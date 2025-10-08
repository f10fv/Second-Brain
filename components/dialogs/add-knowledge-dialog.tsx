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
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { toast } from "sonner"

interface AddKnowledgeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNoteCreated?: () => void
}

export function AddKnowledgeDialog({ open, onOpenChange, onNoteCreated }: AddKnowledgeDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required")
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category: category || null,
          tags: tags,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("Note created successfully!")
        
        // Reset form
        setTitle("")
        setContent("")
        setCategory("")
        setTags([])
        setCurrentTag("")
        
        // Close dialog
        onOpenChange(false)
        
        // Call callback if provided
        if (onNoteCreated) {
          onNoteCreated()
        }
      } else {
        toast.error(result.error || "Failed to create note")
      }
    } catch (error) {
      console.error('Error creating knowledge note:', error)
      toast.error("Failed to create note")
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
          <DialogDescription>Add a new note to your knowledge base for future reference.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="knowledge-title">Title *</Label>
              <Input
                id="knowledge-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., React Best Practices"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="ideas">Ideas</SelectItem>
                  <SelectItem value="resources">Resources</SelectItem>
                  <SelectItem value="meeting-notes">Meeting Notes</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="tutorials">Tutorials</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="knowledge-content">Content *</Label>
              <Textarea
                id="knowledge-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note content here..."
                rows={10}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="knowledge-tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="knowledge-tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Add a tag and press Enter"
                  disabled={loading}
                />
                <Button type="button" variant="outline" onClick={addTag} disabled={loading}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Save Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
