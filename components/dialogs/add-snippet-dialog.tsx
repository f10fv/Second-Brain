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

interface AddSnippetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddSnippetDialog({ open, onOpenChange }: AddSnippetDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ title, description, code, language, category, tags })

    // Reset form
    setTitle("")
    setDescription("")
    setCode("")
    setLanguage("")
    setCategory("")
    setTags("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Code Snippet</DialogTitle>
          <DialogDescription>Save a reusable code snippet for future reference.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="snippet-title">Title *</Label>
              <Input
                id="snippet-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter snippet title..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="snippet-description">Description</Label>
              <Input
                id="snippet-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of what this snippet does..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="sql">SQL</SelectItem>
                    <SelectItem value="bash">Bash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utility">Utility</SelectItem>
                    <SelectItem value="component">Component</SelectItem>
                    <SelectItem value="hook">Hook</SelectItem>
                    <SelectItem value="function">Function</SelectItem>
                    <SelectItem value="config">Config</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="snippet-tags">Tags (comma separated)</Label>
              <Input
                id="snippet-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="react, hooks, utility..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="snippet-code">Code *</Label>
              <Textarea
                id="snippet-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                className="min-h-[200px] font-mono text-sm"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Snippet</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
