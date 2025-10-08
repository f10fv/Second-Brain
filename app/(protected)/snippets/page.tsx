"use client"
import { useState, useEffect } from "react"
import { Copy, Plus, Search, Tag, Star, Edit, Trash2, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function CodeSnippetsPage() {
  const [snippets, setSnippets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewSnippet, setViewSnippet] = useState<any>(null)
  const [editSnippet, setEditSnippet] = useState<any>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newSnippet, setNewSnippet] = useState({
    title: "",
    description: "",
    code: "",
    language: "",
    category: "",
    tags: ""
  })

  const fetchSnippets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/snippets')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setSnippets(result.data)
      } else {
        setError(result.error || 'Failed to fetch snippets')
      }
    } catch (error) {
      console.error('Error fetching snippets:', error)
      setError('Failed to fetch snippets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSnippets()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this snippet?")) return
    
    try {
      const response = await fetch(`/api/snippets/${id}`, { method: "DELETE" })
      if (response.ok) {
        setSnippets(snippets => snippets.filter(snippet => snippet.id !== id))
        toast.success("Snippet deleted successfully")
      } else {
        toast.error("Failed to delete snippet")
      }
    } catch (error) {
      console.error('Error deleting snippet:', error)
      toast.error("Failed to delete snippet")
    }
  }

  const handleEdit = async (snippet: any) => {
    setEditSnippet(snippet)
    setEditDialogOpen(true)
  }

  const handleUpdateSnippet = async (updatedSnippet: any) => {
    try {
      const response = await fetch(`/api/snippets/${updatedSnippet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSnippet),
      })
      
      if (response.ok) {
        setSnippets(snippets => 
          snippets.map(snippet => snippet.id === updatedSnippet.id ? updatedSnippet : snippet)
        )
        setEditDialogOpen(false)
        setEditSnippet(null)
        toast.success("Snippet updated successfully")
      } else {
        toast.error("Failed to update snippet")
      }
    } catch (error) {
      console.error('Error updating snippet:', error)
      toast.error("Failed to update snippet")
    }
  }

  const handleCreateSnippet = async () => {
    try {
      const snippetData = {
        ...newSnippet,
        tags: newSnippet.tags.split(",").map(tag => tag.trim()).filter(Boolean)
      }

      const response = await fetch('/api/snippets', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snippetData),
      })
      
      if (response.ok) {
        const result = await response.json()
        setSnippets(snippets => [result.data, ...snippets])
        setAddDialogOpen(false)
        setNewSnippet({
          title: "",
          description: "",
          code: "",
          language: "",
          category: "",
          tags: ""
        })
        toast.success("Snippet created successfully")
      } else {
        toast.error("Failed to create snippet")
      }
    } catch (error) {
      console.error('Error creating snippet:', error)
      toast.error("Failed to create snippet")
    }
  }

  const handleCopyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success("Code copied to clipboard")
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast.error("Failed to copy code")
    }
  }

  const handleToggleFavorite = async (snippet: any) => {
    try {
      const response = await fetch(`/api/snippets/${snippet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...snippet, favorite: !snippet.favorite }),
      })
      
      if (response.ok) {
        setSnippets(snippets => 
          snippets.map(s => s.id === snippet.id ? { ...s, favorite: !s.favorite } : s)
        )
        toast.success(snippet.favorite ? "Removed from favorites" : "Added to favorites")
      } else {
        toast.error("Failed to update snippet")
      }
    } catch (error) {
      console.error('Error updating snippet:', error)
      toast.error("Failed to update snippet")
    }
  }

  // Filter snippets based on search term, language, and category
  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLanguage = selectedLanguage === "all" || snippet.language.toLowerCase() === selectedLanguage.toLowerCase()
    const matchesCategory = !selectedCategory || snippet.category === selectedCategory
    return matchesSearch && matchesLanguage && matchesCategory
  })

  // Get unique categories and languages
  const categories = Array.from(new Set(snippets.map(snippet => snippet.category).filter(Boolean)))
  const languages = Array.from(new Set(snippets.map(snippet => snippet.language).filter(Boolean)))
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = snippets.filter(snippet => snippet.category === category).length
    return acc
  }, {} as Record<string, number>)

  const favorites = snippets.filter(snippet => snippet.favorite)
  const recentSnippets = snippets.sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()).slice(0, 5)

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
          <h1 className="text-3xl font-bold tracking-tight">Code Snippets</h1>
          <p className="text-muted-foreground">Organize and manage your reusable code snippets</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Snippet
              </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search snippets..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {languages.map(language => (
              <SelectItem key={language} value={language.toLowerCase()}>
                {language}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Snippets ({filteredSnippets.length})</TabsTrigger>
          <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
          <TabsTrigger value="recent">Recently Used</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
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
                      <span className="text-sm">All</span>
                      <Badge variant="outline">{snippets.length}</Badge>
                    </div>
                    {categories.map((category) => (
                      <div
                        key={category}
                        className={`flex justify-between items-center p-2 rounded hover:bg-accent cursor-pointer ${
                          selectedCategory === category ? 'bg-accent' : ''
                        }`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        <span className="text-sm">{category}</span>
                        <Badge variant="outline">{categoryCounts[category]}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-3">
              <div className="grid gap-4 md:grid-cols-2">
                {filteredSnippets.map((snippet) => (
                  <Card key={snippet.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{snippet.language}</Badge>
                          <Badge variant="secondary">{snippet.category}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleFavorite(snippet)
                            }}
                          >
                            <Star className={`h-3 w-3 ${snippet.favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal className="h-3 w-3" />
                          </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(snippet)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyToClipboard(snippet.code)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Code
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(snippet.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{snippet.title}</CardTitle>
                      <CardDescription>{snippet.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-muted rounded-md p-3">
                        <pre className="text-xs overflow-x-auto">
                          <code className="line-clamp-6">{snippet.code}</code>
                        </pre>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {snippet.tags.map((tag: string, j: number) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Last used: {formatDate(snippet.lastUsed)}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={() => setViewSnippet(snippet)}
                        >
                          View Full
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((snippet) => (
              <Card key={snippet.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">{snippet.language}</Badge>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <CardTitle className="text-lg">{snippet.title}</CardTitle>
                  <CardDescription>Category: {snippet.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Last used: {formatDate(snippet.lastUsed)}</span>
                    <Button variant="ghost" size="sm" onClick={() => setViewSnippet(snippet)}>
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Used Snippets</CardTitle>
              <CardDescription>Snippets you've accessed recently</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {recentSnippets.map((snippet) => (
                    <div key={snippet.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                      <div className="space-y-1">
                        <h4 className="font-medium">{snippet.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{snippet.language}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{formatDate(snippet.lastUsed)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Snippet Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{snippets.length}</div>
              <p className="text-sm text-muted-foreground">Total Snippets</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{languages.length}</div>
              <p className="text-sm text-muted-foreground">Languages</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{favorites.length}</div>
              <p className="text-sm text-muted-foreground">Favorites</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Snippet Dialog */}
      <Dialog open={!!viewSnippet} onOpenChange={() => setViewSnippet(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{viewSnippet?.title}</DialogTitle>
            <DialogDescription>
              <div className="flex gap-2">
                <Badge variant="outline">{viewSnippet?.language}</Badge>
                <Badge variant="secondary">{viewSnippet?.category}</Badge>
                {viewSnippet?.favorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {viewSnippet?.description && (
              <p className="text-sm text-muted-foreground">{viewSnippet.description}</p>
            )}
            <div className="bg-muted rounded-md p-4">
              <pre className="text-sm overflow-x-auto">
                <code>{viewSnippet?.code}</code>
              </pre>
            </div>
            {viewSnippet?.tags && viewSnippet.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {viewSnippet.tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Last used: {viewSnippet ? formatDate(viewSnippet.lastUsed) : ""}
              </span>
              <Button onClick={() => handleCopyToClipboard(viewSnippet?.code || "")}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Snippet Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Code Snippet</DialogTitle>
            <DialogDescription>Add a new code snippet to your collection</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                placeholder="Enter snippet title..." 
                value={newSnippet.title}
                onChange={(e) => setNewSnippet({...newSnippet, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                placeholder="Brief description of what this snippet does..." 
                value={newSnippet.description}
                onChange={(e) => setNewSnippet({...newSnippet, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={newSnippet.language} onValueChange={(value) => setNewSnippet({...newSnippet, language: value})}>
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
                <Label htmlFor="category">Category</Label>
                <Select value={newSnippet.category} onValueChange={(value) => setNewSnippet({...newSnippet, category: value})}>
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
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input 
                id="tags" 
                placeholder="react, hooks, utility..." 
                value={newSnippet.tags}
                onChange={(e) => setNewSnippet({...newSnippet, tags: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Textarea
                id="code"
                placeholder="Paste your code here..."
                className="min-h-[200px] font-mono text-sm"
                value={newSnippet.code}
                onChange={(e) => setNewSnippet({...newSnippet, code: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSnippet}>Save Snippet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Snippet Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Code Snippet</DialogTitle>
            <DialogDescription>Update your code snippet</DialogDescription>
          </DialogHeader>
          {editSnippet && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input 
                  id="edit-title" 
                  value={editSnippet.title}
                  onChange={(e) => setEditSnippet({...editSnippet, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input 
                  id="edit-description" 
                  value={editSnippet.description || ""}
                  onChange={(e) => setEditSnippet({...editSnippet, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-language">Language</Label>
                  <Select value={editSnippet.language} onValueChange={(value) => setEditSnippet({...editSnippet, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={editSnippet.category || ""} onValueChange={(value) => setEditSnippet({...editSnippet, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
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
                <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                <Input 
                  id="edit-tags" 
                  value={editSnippet.tags?.join(", ") || ""}
                  onChange={(e) => setEditSnippet({
                    ...editSnippet, 
                    tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">Code</Label>
                <Textarea
                  id="edit-code"
                  className="min-h-[200px] font-mono text-sm"
                  value={editSnippet.code}
                  onChange={(e) => setEditSnippet({...editSnippet, code: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateSnippet(editSnippet)}>
                  Update Snippet
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
