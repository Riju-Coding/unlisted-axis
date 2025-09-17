"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface ColumnFilter {
  key: string
  label: string
  type: "text" | "select" | "number" | "date" | "boolean"
  options?: FilterOption[]
  placeholder?: string
}

export interface ActiveFilter {
  column: string
  value: string
  label: string
}

interface AdvancedTableFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  columns: ColumnFilter[]
  activeFilters: ActiveFilter[]
  onFilterChange: (filters: ActiveFilter[]) => void
  totalResults: number
  filteredResults: number
}

export function AdvancedTableFilters({
  searchValue,
  onSearchChange,
  columns,
  activeFilters,
  onFilterChange,
  totalResults,
  filteredResults,
}: AdvancedTableFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchValue)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch)
    }, 300)

    return () => clearTimeout(timer)
  }, [localSearch, onSearchChange])

  const addFilter = (column: string, value: string, label: string) => {
    const existingFilterIndex = activeFilters.findIndex((f) => f.column === column)
    const newFilters = [...activeFilters]

    if (existingFilterIndex >= 0) {
      newFilters[existingFilterIndex] = { column, value, label }
    } else {
      newFilters.push({ column, value, label })
    }

    onFilterChange(newFilters)
  }

  const removeFilter = (column: string) => {
    onFilterChange(activeFilters.filter((f) => f.column !== column))
  }

  const clearAllFilters = () => {
    onFilterChange([])
    setLocalSearch("")
  }

  const hasActiveFilters = activeFilters.length > 0 || localSearch.length > 0

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search across all columns..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Column Filters */}
        <div className="flex items-center gap-2">
          {columns.map((column) => (
            <DropdownMenu key={column.key}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8",
                    activeFilters.some((f) => f.column === column.key) && "bg-primary text-primary-foreground",
                  )}
                >
                  <Filter className="mr-2 h-3 w-3" />
                  {column.label}
                  <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>{column.label} Filter</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {column.type === "select" && column.options ? (
                  <>
                    <DropdownMenuItem onClick={() => removeFilter(column.key)}>
                      <span className="text-muted-foreground">All {column.label}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {column.options.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => addFilter(column.key, option.value, option.label)}
                        className={cn(
                          activeFilters.some((f) => f.column === column.key && f.value === option.value) && "bg-accent",
                        )}
                      >
                        <span>{option.label}</span>
                        {option.count !== undefined && (
                          <span className="ml-auto text-xs text-muted-foreground">({option.count})</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </>
                ) : column.type === "boolean" ? (
                  <>
                    <DropdownMenuItem onClick={() => removeFilter(column.key)}>
                      <span className="text-muted-foreground">All</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => addFilter(column.key, "true", "Yes")}>Yes</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addFilter(column.key, "false", "No")}>No</DropdownMenuItem>
                  </>
                ) : (
                  <div className="p-2">
                    <Input
                      placeholder={column.placeholder || `Filter by ${column.label.toLowerCase()}...`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const value = e.currentTarget.value.trim()
                          if (value) {
                            addFilter(column.key, value, `${column.label}: ${value}`)
                            e.currentTarget.value = ""
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 px-2 lg:px-3">
              Clear
              <X className="ml-2 h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge key={`${filter.column}-${filter.value}`} variant="secondary" className="gap-1">
              {filter.label}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => removeFilter(filter.column)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredResults.toLocaleString()} of {totalResults.toLocaleString()} results
        {hasActiveFilters && filteredResults !== totalResults && (
          <span className="ml-1">({(totalResults - filteredResults).toLocaleString()} filtered out)</span>
        )}
      </div>
    </div>
  )
}
