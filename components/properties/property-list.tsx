'use client'

import React, { useState, useMemo } from "react"
import { Building2, LayoutGrid, List, Plus, Search, X, Filter } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PropertyCard } from "@/components/properties/property-card"
import { Property } from "@/lib/types/database"

interface PropertyListProps {
  initialProperties: Property[]
}

export function PropertyList({ initialProperties }: PropertyListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchValue, setSearchValue] = useState("")
  const [typeFilter, setTypeFilter] = useState("any")
  const [statusFilter, setStatusFilter] = useState("any")
  const [bedroomsFilter, setBedroomsFilter] = useState("any")
  const [priceFilter, setPriceFilter] = useState("any")

  // ── Pure client-side filtering ────────────────────────────
  const filtered = useMemo(() => {
    const q = searchValue.toLowerCase().trim()

    return initialProperties.filter(p => {
      if (q) {
        const haystack = [
          p.title,
          p.address,
          p.city,
          p.locality,
          p.description,
          p.property_type,
          p.status,
          p.pincode,
          String(p.bhk || ""),
          String(p.price || ""),
        ].filter(Boolean).join(" ").toLowerCase()
        if (!haystack.includes(q)) return false
      }

      if (typeFilter !== "any" && p.property_type !== typeFilter) return false

      if (statusFilter !== "any" && p.status !== statusFilter) return false

      if (bedroomsFilter !== "any") {
        const bhk = Number(bedroomsFilter)
        if (!p.bhk) return false
        if (bhk === 5 ? p.bhk < 5 : p.bhk !== bhk) return false
      }

      if (priceFilter !== "any") {
        const max = parseInt(priceFilter)
        if (p.price > max) return false
      }

      return true
    })
  }, [initialProperties, searchValue, typeFilter, statusFilter, bedroomsFilter, priceFilter])

  const hasActiveFilters = searchValue || typeFilter !== "any" || statusFilter !== "any" || bedroomsFilter !== "any" || priceFilter !== "any"

  const resetFilters = () => {
    setSearchValue("")
    setTypeFilter("any")
    setStatusFilter("any")
    setBedroomsFilter("any")
    setPriceFilter("any")
  }

  return (
    <div className="space-y-4">
      {/* ── Filter Bar ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
        {/* Search + view toggle */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Search by title, city, locality, type…"
              className="pl-9 pr-9 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 text-slate-800 transition-all text-sm h-11 rounded-xl"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={cn("h-9 w-9 rounded-lg transition-all", viewMode === "grid" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className={cn("h-9 w-9 rounded-lg transition-all", viewMode === "list" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filter row — pill style matching client list */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />

          <Select onValueChange={v => setTypeFilter(v ?? "any")} value={typeFilter}>
            <SelectTrigger className={cn(
              "h-9 px-3 text-sm font-semibold bg-white border-2 rounded-xl transition-all gap-2",
              typeFilter !== "any" ? "border-emerald-400 text-emerald-700 bg-emerald-50" : "border-slate-200 text-slate-700 hover:border-slate-300"
            )}>
              <SelectValue>
                {typeFilter === "any" ? "Property Type" :
                  typeFilter === "apartment" ? "Apartment" :
                    typeFilter === "villa" ? "Villa" :
                      typeFilter === "independent_house" ? "Ind. House" :
                        typeFilter === "commercial" ? "Commercial" :
                          typeFilter === "plot" ? "Plot" :
                            typeFilter === "farmhouse" ? "Farmhouse" : "Penthouse"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="any" className="font-medium">All Types</SelectItem>
              <SelectItem value="apartment" className="font-medium">Apartment</SelectItem>
              <SelectItem value="villa" className="font-medium">Villa</SelectItem>
              <SelectItem value="independent_house" className="font-medium">Independent House</SelectItem>
              <SelectItem value="commercial" className="font-medium">Commercial</SelectItem>
              <SelectItem value="plot" className="font-medium">Plot</SelectItem>
              <SelectItem value="farmhouse" className="font-medium">Farmhouse</SelectItem>
              <SelectItem value="penthouse" className="font-medium">Penthouse</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={v => setStatusFilter(v ?? "any")} value={statusFilter}>
            <SelectTrigger className={cn(
              "h-9 px-3 text-sm font-semibold bg-white border-2 rounded-xl transition-all gap-2",
              statusFilter !== "any" ? "border-emerald-400 text-emerald-700 bg-emerald-50" : "border-slate-200 text-slate-700 hover:border-slate-300"
            )}>
              <SelectValue>
                {statusFilter === "any" ? "Status" :
                  statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="any" className="font-medium">All Status</SelectItem>
              <SelectItem value="available" className="font-medium">Available</SelectItem>
              <SelectItem value="sold" className="font-medium">Sold</SelectItem>
              <SelectItem value="rented" className="font-medium">Rented</SelectItem>
              <SelectItem value="reserved" className="font-medium">Reserved</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={v => setBedroomsFilter(v ?? "any")} value={bedroomsFilter}>
            <SelectTrigger className={cn(
              "h-9 px-3 text-sm font-semibold bg-white border-2 rounded-xl transition-all gap-2",
              bedroomsFilter !== "any" ? "border-emerald-400 text-emerald-700 bg-emerald-50" : "border-slate-200 text-slate-700 hover:border-slate-300"
            )}>
              <SelectValue>
                {bedroomsFilter === "any" ? "BHK" :
                  bedroomsFilter === "5" ? "5+ BHK" : `${bedroomsFilter} BHK`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="any" className="font-medium">All BHKs</SelectItem>
              <SelectItem value="1" className="font-medium">1 BHK</SelectItem>
              <SelectItem value="2" className="font-medium">2 BHK</SelectItem>
              <SelectItem value="3" className="font-medium">3 BHK</SelectItem>
              <SelectItem value="4" className="font-medium">4 BHK</SelectItem>
              <SelectItem value="5" className="font-medium">5+ BHK</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={v => setPriceFilter(v ?? "any")} value={priceFilter}>
            <SelectTrigger className={cn(
              "h-9 px-3 text-sm font-semibold bg-white border-2 rounded-xl transition-all gap-2",
              priceFilter !== "any" ? "border-emerald-400 text-emerald-700 bg-emerald-50" : "border-slate-200 text-slate-700 hover:border-slate-300"
            )}>
              <SelectValue>
                {priceFilter === "any" ? "Price" :
                  priceFilter === "5000000" ? "Under ₹50L" :
                    priceFilter === "10000000" ? "Under ₹1Cr" :
                      priceFilter === "20000000" ? "Under ₹2Cr" : "Under ₹5Cr"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="any" className="font-medium">Any Price</SelectItem>
              <SelectItem value="5000000" className="font-medium">Under ₹50L</SelectItem>
              <SelectItem value="10000000" className="font-medium">Under ₹1Cr</SelectItem>
              <SelectItem value="20000000" className="font-medium">Under ₹2Cr</SelectItem>
              <SelectItem value="50000000" className="font-medium">Under ₹5Cr</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 h-9 px-3 text-xs text-red-500 font-bold rounded-xl border-2 border-red-100 bg-red-50 hover:bg-red-100 transition-all"
            >
              <X className="w-3 h-3" />
              Reset
            </button>
          )}

          <span className="ml-auto text-xs text-slate-500 font-semibold">
            {filtered.length} of {initialProperties.length} properties
          </span>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className={viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {filtered.map(property => (
            <PropertyCard key={property.id} property={property} viewMode={viewMode} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 border-dashed">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-50/50">
            <Building2 className="w-10 h-10 text-slate-200" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {hasActiveFilters ? "No properties match your search" : "No properties yet"}
          </h2>
          <p className="text-slate-500 text-center max-w-sm mb-8 text-sm font-medium">
            {hasActiveFilters ? "Try different keywords or clear the filters." : "Upload a property to get started."}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-slate-300 transition-all"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          ) : (
            <Link href="/properties/new">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl h-11 px-8 font-bold gap-2">
                <Plus className="w-5 h-5" />
                Add property
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
