"use client"

import { useState, useEffect } from "react"
import { Calculator, Plus, Wallet, TrendingUp, TrendingDown, DollarSign, PieChart, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AddFinanceDialog } from "@/components/dialogs/add-finance-dialog"
import { EditFinanceDialog } from "@/components/dialogs/edit-finance-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function FinancePage() {
  const [financeDialogOpen, setFinanceDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null)
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/finance")
      const data = await res.json()
      if (res.ok && data.success) {
        setRecords(data.data)
      } else {
        setError(data.error || "Failed to fetch records")
      }
    } catch (err) {
      setError("Failed to fetch records")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return
    try {
      await fetch(`/api/finance/${id}`, { method: "DELETE" })
      setRecords(records => records.filter(r => r.id !== id))
    } catch (err) {
      alert("Failed to delete record")
    }
  }

  // Calculate financial data from records
  const incomeRecords = records.filter(r => r.type === "INCOME")
  const expenseRecords = records.filter(r => r.type === "EXPENSE")
  
  const monthlyIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0)
  const totalExpenses = expenseRecords.reduce((sum, r) => sum + Math.abs(r.amount), 0)
  const remainingBudget = monthlyIncome - totalExpenses // Actual remaining budget

  // Calculate budget categories
  const needsRecords = expenseRecords.filter(r => r.budgetCategory === "NEEDS")
  const wantsRecords = expenseRecords.filter(r => r.budgetCategory === "WANTS")
  const savingsRecords = expenseRecords.filter(r => r.budgetCategory === "SAVINGS")
  
  const needsSpent = needsRecords.reduce((sum, r) => sum + Math.abs(r.amount), 0)
  const wantsSpent = wantsRecords.reduce((sum, r) => sum + Math.abs(r.amount), 0)
  const savingsSpent = savingsRecords.reduce((sum, r) => sum + Math.abs(r.amount), 0)
  
  // Calculate savings (actual amount spent on savings)
  const savings = savingsSpent

  // Calculate spending by description for each budget category
  const needsByDescription = needsRecords.reduce((acc, record) => {
    const description = record.description || record.title || 'Other'
    acc[description] = (acc[description] || 0) + Math.abs(record.amount)
    return acc
  }, {} as Record<string, number>)

  const wantsByDescription = wantsRecords.reduce((acc, record) => {
    const description = record.description || record.title || 'Other'
    acc[description] = (acc[description] || 0) + Math.abs(record.amount)
    return acc
  }, {} as Record<string, number>)

  const savingsByDescription = savingsRecords.reduce((acc, record) => {
    const description = record.description || record.title || 'Other'
    acc[description] = (acc[description] || 0) + Math.abs(record.amount)
    return acc
  }, {} as Record<string, number>)

  // Budget allocation (55% needs, 35% wants, 10% savings)
  const needsBudget = monthlyIncome * 0.55
  const wantsBudget = monthlyIncome * 0.35
  const savingsBudget = monthlyIncome * 0.1

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance Tracker</h1>
          <p className="text-muted-foreground">Track your income, expenses and savings with the 55/35/10 budget rule</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button onClick={() => setFinanceDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${monthlyIncome.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${savings.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">${remainingBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Allocation - 55/35/10 Rule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Budget Allocation (55/35/10 Rule)
          </CardTitle>
          <CardDescription>
            55% for needs, 35% for wants, 10% for savings - Track your spending against your budget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Needs - 55% */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="font-medium">Needs (55%)</span>
                </div>
                <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  Essential
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Spent: ${needsSpent.toLocaleString()}</span>
                  <span>Budget: ${needsBudget.toLocaleString()}</span>
                </div>
                <Progress value={(needsSpent / needsBudget) * 100} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round((needsSpent / needsBudget) * 100)}% used</span>
                  <span>${(needsBudget - needsSpent).toLocaleString()} remaining</span>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                {Object.entries(needsByDescription).length > 0 ? (
                  Object.entries(needsByDescription)
                    .sort((a, b) => (a[1] as number) - (b[1] as number))
                    .reverse()
                    .slice(0, 5)
                    .map(([description, amount]) => (
                      <div key={description} className="flex justify-between">
                        <span className="truncate max-w-[120px]">{description}</span>
                        <span>${(amount as number).toLocaleString()}</span>
                      </div>
                    ))
                ) : (
                  <div className="text-muted-foreground text-center py-2">No needs expenses yet</div>
                )}
              </div>
            </div>

            {/* Wants - 35% */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="font-medium">Wants (35%)</span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                >
                  Lifestyle
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Spent: ${wantsSpent.toLocaleString()}</span>
                  <span>Budget: ${wantsBudget.toLocaleString()}</span>
                </div>
                <Progress value={(wantsSpent / wantsBudget) * 100} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round((wantsSpent / wantsBudget) * 100)}% used</span>
                  <span>${(wantsBudget - wantsSpent).toLocaleString()} remaining</span>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                {Object.entries(wantsByDescription).length > 0 ? (
                  Object.entries(wantsByDescription)
                    .sort((a, b) => (a[1] as number) - (b[1] as number))
                    .reverse()
                    .slice(0, 5)
                    .map(([description, amount]) => (
                      <div key={description} className="flex justify-between">
                        <span className="truncate max-w-[120px]">{description}</span>
                        <span>${(amount as number).toLocaleString()}</span>
                      </div>
                    ))
                ) : (
                  <div className="text-muted-foreground text-center py-2">No wants expenses yet</div>
                )}
              </div>
            </div>

            {/* Savings - 10% */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="font-medium">Savings (10%)</span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                >
                  Future
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Saved: ${savings.toLocaleString()}</span>
                  <span>Goal: ${savingsBudget.toLocaleString()}</span>
                </div>
                <Progress value={(savings / savingsBudget) * 100} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round((savings / savingsBudget) * 100)}% of goal</span>
                  <span>
                    {savings > savingsBudget
                      ? `+$${(savings - savingsBudget).toLocaleString()} over goal!`
                      : `$${(savingsBudget - savings).toLocaleString()} to go`}
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                {Object.entries(savingsByDescription).length > 0 ? (
                  Object.entries(savingsByDescription)
                    .sort((a, b) => (a[1] as number) - (b[1] as number))
                    .reverse()
                    .slice(0, 5)
                    .map(([description, amount]) => (
                      <div key={description} className="flex justify-between">
                        <span className="truncate max-w-[120px]">{description}</span>
                        <span>${(amount as number).toLocaleString()}</span>
                      </div>
                    ))
                ) : (
                  <div className="text-muted-foreground text-center py-2">No savings expenses yet</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest income and expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
              ) : records.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No transactions yet. Add your first transaction!</div>
              ) : (
                records.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          transaction.type === "INCOME"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-red-100 dark:bg-red-900/30"
                        }`}
                      >
                        {transaction.type === "INCOME" ? (
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {transaction.category && <Badge variant="outline">{transaction.category}</Badge>}
                          {transaction.category && <span>•</span>}
                          {transaction.budgetCategory && (
                            <>
                              <Badge variant="secondary" className={
                                transaction.budgetCategory === "NEEDS" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                transaction.budgetCategory === "WANTS" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              }>
                                {transaction.budgetCategory}
                              </Badge>
                              <span>•</span>
                            </>
                          )}
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-lg font-semibold ${
                          transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}${Math.abs(transaction.amount).toLocaleString()}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedRecord(transaction); setEditDialogOpen(true); }}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(transaction.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

        <AddFinanceDialog open={financeDialogOpen} onOpenChange={setFinanceDialogOpen} onCreated={fetchRecords} />
        <EditFinanceDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} record={selectedRecord} onUpdated={(updated) => {
          setRecords(prev => prev.map(r => r.id === updated.id ? updated : r))
        }} />
    </div>
  )
}
