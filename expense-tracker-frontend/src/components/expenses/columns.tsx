"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Calendar, DollarSign, FileText, FolderOpen } from "lucide-react"

import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Checkbox } from "../ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Expense } from "../../types/Expense"

// Category color mapping for consistent theming
const getCategoryVariant = (category: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    FOOD: "secondary",
    TRANSPORTATION: "default",
    ENTERTAINMENT: "outline",
    HEALTHCARE: "destructive",
    SHOPPING: "default",
    BILLS: "secondary",
    UTILITIES: "secondary",
    OTHER: "outline",
  }
  return variants[category] || "outline"
}

// Format category name for display
const formatCategoryName = (category: string) => {
  return category
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Format date for display
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

// Format currency for display
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const createColumns = (onDelete?: (id: number) => void): ColumnDef<Expense>[] => [
  // Row selection column
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all expenses"
        className="ml-2"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select expense"
        className="ml-2"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  
  // Date column with sorting
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {formatDate(row.getValue("date"))}
        </div>
      )
    },
  },

  // Description column with sorting
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          <FileText className="mr-2 h-4 w-4" />
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const description = row.getValue("description") as string
      return (
        <div className="max-w-[200px]">
          <div className="truncate font-medium" title={description}>
            {description}
          </div>
        </div>
      )
    },
  },

  // Category column with sorting and badges
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const category = row.getValue("category") as string
      return (
        <Badge variant={getCategoryVariant(category)} className="font-medium">
          {formatCategoryName(category)}
        </Badge>
      )
    },
  },

  // Amount column with sorting and currency formatting
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number
      return (
        <div className="text-right font-mono font-semibold">
          {formatCurrency(amount)}
        </div>
      )
    },
  },

  // Actions column
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const expense = row.original

      return (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  if (expense.id) {
                    navigator.clipboard.writeText(expense.id.toString())
                  }
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Copy expense ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                // TODO: Implement edit functionality
                console.log('Edit expense:', expense.id)
              }}>
                <FileText className="mr-2 h-4 w-4" />
                Edit expense
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  // TODO: Implement view details
                  console.log('View details:', expense.id)
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (onDelete && expense.id) {
                    onDelete(expense.id)
                  }
                }}
                className="text-destructive focus:text-destructive"
              >
                <FileText className="mr-2 h-4 w-4" />
                Delete expense
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]

export type { Expense }