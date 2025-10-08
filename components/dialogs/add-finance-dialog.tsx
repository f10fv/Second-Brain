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
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface AddFinanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function AddFinanceDialog({ open, onOpenChange, onCreated }: AddFinanceDialogProps) {
  const [type, setType] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [budgetCategory, setBudgetCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [account, setAccount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: description || `${type} transaction`,
          amount: parseFloat(amount),
          type: type.toUpperCase(),
          category: category || null,
          budgetCategory: budgetCategory || null,
          description: description || null,
          date: date.toISOString(),
        }),
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setType("")
        setAmount("")
        setCategory("")
        setBudgetCategory("")
        setDescription("")
        setDate(new Date())
        setAccount("")
        onOpenChange(false)
        onCreated?.()
      } else {
        setError(result.error || "Failed to add finance record")
      }
    } catch (err) {
      setError("Failed to add finance record")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>Record a new income or expense transaction.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Transaction Type *</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">💰 Income</SelectItem>
                  <SelectItem value="EXPENSE">💸 Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="finance-amount">Amount *</Label>
                <Input
                  id="finance-amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Popover
                  open={calendarOpen} 
                  onOpenChange={setCalendarOpen}
                  modal={true}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                  <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => {
                        if (date) {
                          setDate(date);
                          setCalendarOpen(false);
                        }
                      }}
                      initialFocus
                    />                     
                    </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {type === "INCOME" ? (
                      <>
                        <SelectItem value="salary">Salary</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="bonus">Bonus</SelectItem>
                        <SelectItem value="other-income">Other Income</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="food">Food & Dining</SelectItem>
                        <SelectItem value="transport">Transportation</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="bills">Bills & Utilities</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other-expense">Other Expense</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Budget Category</Label>
                <Select value={budgetCategory} onValueChange={setBudgetCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEEDS">Needs (55%)</SelectItem>
                    <SelectItem value="WANTS">Wants (35%)</SelectItem>
                    <SelectItem value="SAVINGS">Savings (10%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Account</Label>
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking Account</SelectItem>
                  <SelectItem value="savings">Savings Account</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="finance-description">Description</Label>
              <Textarea
                id="finance-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What was this transaction for?"
                rows={3}
              />
            </div>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !type || !amount}>
              {isSubmitting ? "Adding..." : "Add Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
