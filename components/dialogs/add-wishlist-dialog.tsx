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
import { toast } from "sonner"

interface AddWishlistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemCreated?: () => void
}

export function AddWishlistDialog({ open, onOpenChange, onItemCreated }: AddWishlistDialogProps) {
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error("Item name is required")
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          price: price || null,
          category: category || null,
          priority: priority ? priority.toUpperCase() : "MEDIUM",
          description: description || null,
          url: url || null,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("Item added to wishlist!")
        
        // Reset form
        setTitle("")
        setPrice("")
        setCategory("")
        setPriority("")
        setDescription("")
        setUrl("")
        
        // Close dialog
        onOpenChange(false)
        
        // Call callback if provided
        if (onItemCreated) {
          onItemCreated()
        }
      } else {
        toast.error(result.error || "Failed to add item to wishlist")
      }
    } catch (error) {
      console.error('Error creating wishlist item:', error)
      toast.error("Failed to add item to wishlist")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Wishlist</DialogTitle>
          <DialogDescription>Add a new item to your wishlist to track things you want to buy.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="wishlist-title">Item Name *</Label>
              <Input
                id="wishlist-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., MacBook Pro M3"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wishlist-price">Price</Label>
                <Input
                  id="wishlist-price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="$1,999"
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
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="How important is this?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High - Need it soon</SelectItem>
                  <SelectItem value="medium">Medium - Would be nice</SelectItem>
                  <SelectItem value="low">Low - Someday maybe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wishlist-url">Product URL</Label>
              <Input 
                id="wishlist-url" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="https://..." 
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wishlist-notes">Notes</Label>
              <Textarea
                id="wishlist-notes"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why do you want this? Any specific requirements..."
                rows={3}
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add to Wishlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
