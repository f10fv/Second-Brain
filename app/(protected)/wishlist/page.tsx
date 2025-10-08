"use client"

import { useState, useEffect } from "react"
import { Plus, ShoppingCart, Star, Edit, Trash2, Search, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddWishlistDialog } from "@/components/dialogs/add-wishlist-dialog"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function WishlistPage() {
  const [wishlistDialogOpen, setWishlistDialogOpen] = useState(false)
  const [wishlistItems, setWishlistItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<any>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const fetchWishlistItems = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/wishlist')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setWishlistItems(result.data)
      } else {
        setError(result.error || 'Failed to fetch wishlist items')
      }
    } catch (error) {
      console.error('Error fetching wishlist items:', error)
      setError('Failed to fetch wishlist items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlistItems()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    
    try {
      const response = await fetch(`/api/wishlist/${id}`, { method: "DELETE" })
      if (response.ok) {
        setWishlistItems(items => items.filter(item => item.id !== id))
        toast.success("Item deleted successfully")
      } else {
        toast.error("Failed to delete item")
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error("Failed to delete item")
    }
  }

  const handleEdit = async (item: any) => {
    setEditItem(item)
    setEditDialogOpen(true)
  }

  const handleUpdateItem = async (updatedItem: any) => {
    try {
      const response = await fetch(`/api/wishlist/${updatedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      })
      
      if (response.ok) {
        setWishlistItems(items => 
          items.map(item => item.id === updatedItem.id ? updatedItem : item)
        )
        setEditDialogOpen(false)
        setEditItem(null)
        toast.success("Item updated successfully")
      } else {
        toast.error("Failed to update item")
      }
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error("Failed to update item")
    }
  }

  const handleTogglePurchased = async (item: any) => {
    try {
      const response = await fetch(`/api/wishlist/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, purchased: !item.purchased }),
      })
      
      if (response.ok) {
        setWishlistItems(items => 
          items.map(i => i.id === item.id ? { ...i, purchased: !i.purchased } : i)
        )
        toast.success(item.purchased ? "Marked as not purchased" : "Marked as purchased")
      } else {
        toast.error("Failed to update item")
      }
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error("Failed to update item")
    }
  }

  // Filter items based on search term, category, and priority
  const filteredItems = wishlistItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    const matchesPriority = !selectedPriority || item.priority === selectedPriority
    return matchesSearch && matchesCategory && matchesPriority
  })

  // Get unique categories and priorities
  const categories = Array.from(new Set(wishlistItems.map(item => item.category).filter(Boolean)))
  const priorities = Array.from(new Set(wishlistItems.map(item => item.priority).filter(Boolean)))
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = wishlistItems.filter(item => item.category === category).length
    return acc
  }, {} as Record<string, number>)

  const purchasedItems = wishlistItems.filter(item => item.purchased)
  const unpurchasedItems = wishlistItems.filter(item => !item.purchased)
  const highPriorityItems = wishlistItems.filter(item => item.priority === "HIGH")

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

  const formatCurrency = (price: string) => {
    if (!price) return "N/A"
    return price.startsWith("EGP") ? price : `${price} EGP`
  }

  const getTotalValue = () => {
    return wishlistItems.reduce((sum, item) => {
      const price = item.price ? parseFloat(item.price.replace(/[$,]/g, "")) : 0
      return sum + price
    }, 0)
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
          <h1 className="text-3xl font-bold tracking-tight">Wishlist</h1>
          <p className="text-muted-foreground">Keep track of things you want to buy or achieve</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search items..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedPriority || "all"} onValueChange={(value) => setSelectedPriority(value === "all" ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {priorities.map(priority => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className={`cursor-pointer hover:shadow-md transition-shadow ${item.purchased ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {item.purchased && (
                    <Badge variant="secondary" className="bg-green-100 text-green-600 mb-2">
                      Purchased
                    </Badge>
                  )}
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-lg font-semibold text-primary">
                    {formatCurrency(item.price)}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(item)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTogglePurchased(item)}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {item.purchased ? "Mark as not purchased" : "Mark as purchased"}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              )}
                <Badge
                  variant="outline"
                  className={
                    item.priority === "HIGH"
                      ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      : item.priority === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  }
                >
                  {item.priority}
                </Badge>
                <Badge className="ml-2" variant="outline">{item.category || "Uncategorized"}</Badge>

              
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Added {formatDate(item.createdAt)}</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTogglePurchased(item)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                  {item.url && (
                    <Button size="sm" asChild>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        Buy Now
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-full p-6">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Add New Item</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">Add something new to your wishlist</p>
            <Button onClick={() => setWishlistDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wishlist Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{wishlistItems.length}</div>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{getTotalValue().toLocaleString()} EGP</div>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{highPriorityItems.length}</div>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{purchasedItems.length}</div>
              <p className="text-sm text-muted-foreground">Purchased</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Item Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Wishlist Item</DialogTitle>
            <DialogDescription>Update your wishlist item</DialogDescription>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input 
                  id="edit-title" 
                  value={editItem.title}
                  onChange={(e) => setEditItem({...editItem, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input 
                  id="edit-description" 
                  value={editItem.description || ""}
                  onChange={(e) => setEditItem({...editItem, description: e.target.value})}
                  placeholder="Optional description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price</Label>
                  <Input 
                    id="edit-price" 
                    value={editItem.price || ""}
                    onChange={(e) => setEditItem({...editItem, price: e.target.value})}
                    placeholder="$0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Input 
                    id="edit-category" 
                    value={editItem.category || ""}
                    onChange={(e) => setEditItem({...editItem, category: e.target.value})}
                    placeholder="e.g., Tech, Office, Health"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select value={editItem.priority} onValueChange={(value) => setEditItem({...editItem, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-url">URL (optional)</Label>
                  <Input 
                    id="edit-url" 
                    value={editItem.url || ""}
                    onChange={(e) => setEditItem({...editItem, url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateItem(editItem)}>
                  Update Item
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddWishlistDialog 
        open={wishlistDialogOpen} 
        onOpenChange={setWishlistDialogOpen}
        onItemCreated={fetchWishlistItems}
      />
    </div>
  )
}
