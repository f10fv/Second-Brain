"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Tag, Edit, Trash2, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AddKnowledgeDialog } from "@/components/dialogs/add-knowledge-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export default function KnowledgePage() {
  const [knowledgeDialogOpen, setKnowledgeDialogOpen] = useState(false)
  const [knowledgeNotes, setKnowledgeNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewNote, setViewNote] = useState<any>(null)
  const [editNote, setEditNote] = useState<any>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const fetchKnowledgeNotes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/knowledge')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setKnowledgeNotes(result.data)
      } else {
        setError(result.error || 'Failed to fetch knowledge notes')
      }
    } catch (error) {
      console.error('Error fetching knowledge notes:', error)
      setError('Failed to fetch knowledge notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKnowledgeNotes()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return
    
    try {
      const response = await fetch(`/api/knowledge/${id}`, { method: "DELETE" })
      if (response.ok) {
        setKnowledgeNotes(notes => notes.filter(note => note.id !== id))
      } else {
        alert("Failed to delete note")
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert("Failed to delete note")
    }
  }

  const handleEdit = async (note: any) => {
    setEditNote(note)
    setEditDialogOpen(true)
  }

  const handleUpdateNote = async (updatedNote: any) => {
    try {
      const response = await fetch(`/api/knowledge/${updatedNote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedNote),
      })
      
      if (response.ok) {
        setKnowledgeNotes(notes => 
          notes.map(note => note.id === updatedNote.id ? updatedNote : note)
        )
        setEditDialogOpen(false)
        setEditNote(null)
      } else {
        alert("Failed to update note")
      }
    } catch (error) {
      console.error('Error updating note:', error)
      alert("Failed to update note")
    }
  }

  // Filter notes based on search term and category
  const filteredNotes = knowledgeNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || note.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = Array.from(new Set(knowledgeNotes.map(note => note.category).filter(Boolean)))
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = knowledgeNotes.filter(note => note.category === category).length
    return acc
  }, {} as Record<string, number>)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">Organize and access your notes, ideas, and resources</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline">
            <Tag className="mr-2 h-4 w-4" />
            Manage Tags
          </Button>
          <Button onClick={() => setKnowledgeDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search notes..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div 
                  className={`flex justify-between items-center p-2 rounded hover:bg-accent cursor-pointer ${
                    selectedCategory === null ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  <span>All</span>
                  <Badge variant="outline">{knowledgeNotes.length}</Badge>
                </div>
                {categories.map((category) => (
                  <div 
                    key={category}
                    className={`flex justify-between items-center p-2 rounded hover:bg-accent cursor-pointer ${
                      selectedCategory === category ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <span>{category}</span>
                    <Badge variant="outline">{categoryCounts[category]}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewNote(note)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(note)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(note.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Badge variant="outline" className="mb-2 w-fit">
                      {note.category || "Uncategorized"}
                    </Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(note.updatedAt)}</span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {note.content}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag: string, j: number) => (
                      <Badge key={j} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* View Note Dialog */}
      <Dialog open={!!viewNote} onOpenChange={() => setViewNote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewNote?.title}</DialogTitle>
            <DialogDescription>
              {viewNote?.category && <Badge variant="outline">{viewNote.category}</Badge>}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm">{viewNote?.content}</pre>
            </div>
            {viewNote?.tags && viewNote.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {viewNote.tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>Update your knowledge note</DialogDescription>
          </DialogHeader>
          {editNote && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={editNote.title}
                  onChange={(e) => setEditNote({...editNote, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea 
                  id="content" 
                  value={editNote.content}
                  onChange={(e) => setEditNote({...editNote, content: e.target.value})}
                  className="min-h-[200px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  value={editNote.category || ""}
                  onChange={(e) => setEditNote({...editNote, category: e.target.value})}
                  placeholder="e.g., Work, Personal, Learning"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input 
                  id="tags" 
                  value={editNote.tags?.join(", ") || ""}
                  onChange={(e) => setEditNote({
                    ...editNote, 
                    tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
                  })}
                  placeholder="react, javascript, tips..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateNote(editNote)}>
                  Update Note
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddKnowledgeDialog 
        open={knowledgeDialogOpen} 
        onOpenChange={setKnowledgeDialogOpen}
        onNoteCreated={fetchKnowledgeNotes}
      />
    </div>
  )
}
