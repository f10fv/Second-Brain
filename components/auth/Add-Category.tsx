"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Loader2, Package, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface Category {
  id: string
  name: string
  status: string
  ProductCount?: number
  _count?: {
    products: number
  }
}

interface AddCategoryProps {
  value: string
  onValueChange: (value: string) => void
  required?: boolean
}

export default function AddCategory({
  value,
  onValueChange,
  required = false,
}: AddCategoryProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryStatus, setNewCategoryStatus] = useState("active")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const fetchCategories = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data)
    } catch (err: any) {
      console.error("Error fetching categories:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async () => {
    if (!newCategoryName.trim()) return

    setCreating(true)
    setError("")

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          status: newCategoryStatus,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create category")
      }

      const newCategory = await response.json()

      setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)))
      onValueChange(newCategory.id)

      setNewCategoryName("")
      setNewCategoryStatus("active")
      setDialogOpen(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const getPlaceholderText = () => {
    if (loading) return "Loading categories..."
    if (categories.length === 0) return "No categories available"
    return "Select a category"
  }

  const selectedCategory = categories.find((cat) => cat.id === value)

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Package className="h-4 w-4" />
        Category {required && <span className="text-black">*</span>}
      </Label>

      <div className="flex gap-2">
        <div className="flex-1">
          <Select value={value} onValueChange={onValueChange} required={required} disabled={loading}>
            <SelectTrigger className={`${categories.length === 0 && !loading ? "border-orange-200 bg-orange-50" : ""}`}>
              <SelectValue placeholder={getPlaceholderText()} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.name}</span>
                      {category.status === "inactive" && (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground ml-4">
                      {category._count?.products || category.ProductCount || 0} products
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {categories.length === 0 && !loading && (
            <div className="flex items-center gap-2 mt-1 text-sm text-orange-600">
              <AlertCircle className="h-4 w-4" />
              <span>Create your first category to get started</span>
            </div>
          )}

          {selectedCategory && (
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>Selected: {selectedCategory.name}</span>
              <Badge variant="outline" className="text-xs">
                {selectedCategory._count?.products || selectedCategory.ProductCount || 0} products
              </Badge>
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="icon" className="flex-shrink-0" title="Create new category">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Category
              </DialogTitle>
              <DialogDescription>
                Add a new category to organize your products. Categories help you group similar items together.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name *</Label>
                <Input
                  id="categoryName"
                  placeholder="e.g., Electronics, Clothing, Books"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      createCategory()
                    }
                  }}
                  className={error ? "border-red-300" : ""}
                />
                <p className="text-xs text-muted-foreground">Choose a descriptive name for your category</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryStatus">Status</Label>
                <Select value={newCategoryStatus} onValueChange={setNewCategoryStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        Inactive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Active categories are available for new products</p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  setError("")
                  setNewCategoryName("")
                  setNewCategoryStatus("active")
                }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={createCategory} disabled={creating || !newCategoryName.trim()}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {creating ? "Creating..." : "Create Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
