'use client'

import React from "react"
import { Search, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface PropertyFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  viewMode: "grid" | "list"
  setViewMode: (mode: "grid" | "list") => void
  onFilterChange: (key: string, value: string) => void
  filters: {
    type: string
    status: string
    bedrooms: string
    price: string
  }
  onReset: () => void
}

export function PropertyFilters({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  onFilterChange,
  filters,
  onReset
}: PropertyFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(v => v !== "all") || searchQuery !== ""

  return (
    <Card className="border-none shadow-sm md:rounded-xl p-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, location, type..."
            className="pl-9 bg-slate-50 border-none h-11 text-sm focus-visible:ring-emerald-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-9 w-9 p-0 rounded-md transition-all",
              viewMode === "grid" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-9 w-9 p-0 rounded-md transition-all",
              viewMode === "list" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar pb-1">
        <Select value={filters.type} onValueChange={(v) => onFilterChange("type", v || "all")}>
          <SelectTrigger className="w-auto min-w-[120px] h-9 bg-white border-slate-200 text-slate-600 text-xs rounded-lg focus:ring-emerald-500">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Apartment">Apartment</SelectItem>
            <SelectItem value="Villa">Villa</SelectItem>
            <SelectItem value="Plot">Plot</SelectItem>
            <SelectItem value="Commercial">Commercial</SelectItem>
            <SelectItem value="Farmhouse">Farmhouse</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(v) => onFilterChange("status", v || "all")}>
          <SelectTrigger className="w-auto min-w-[120px] h-9 bg-white border-slate-200 text-slate-600 text-xs rounded-lg focus:ring-emerald-500">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Sold">Sold</SelectItem>
            <SelectItem value="Rented">Rented</SelectItem>
            <SelectItem value="Reserved">Reserved</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.bedrooms} onValueChange={(v) => onFilterChange("bedrooms", v || "all")}>
          <SelectTrigger className="w-auto min-w-[100px] h-9 bg-white border-slate-200 text-slate-600 text-xs rounded-lg focus:ring-emerald-500">
            <SelectValue placeholder="Bedrooms" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">Any BHK</SelectItem>
            <SelectItem value="1">1 BHK</SelectItem>
            <SelectItem value="2">2 BHK</SelectItem>
            <SelectItem value="3">3 BHK</SelectItem>
            <SelectItem value="4">4 BHK</SelectItem>
            <SelectItem value="5">5+ BHK</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.price} onValueChange={(v) => onFilterChange("price", v || "all")}>
          <SelectTrigger className="w-auto min-w-[140px] h-9 bg-white border-slate-200 text-slate-600 text-xs rounded-lg focus:ring-emerald-500">
            <SelectValue placeholder="Price range" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">Any Price</SelectItem>
            <SelectItem value="under-50l">Under ₹50L</SelectItem>
            <SelectItem value="50l-1cr">₹50L–1Cr</SelectItem>
            <SelectItem value="1cr-2cr">₹1Cr–2Cr</SelectItem>
            <SelectItem value="above-2cr">Above ₹2Cr</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs h-8 px-2"
          >
            Reset filters
          </Button>
        )}
      </div>
    </Card>
  )
}

