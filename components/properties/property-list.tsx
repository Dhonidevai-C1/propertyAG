'use client'

import React, { useState, useMemo } from "react"
import { Building2, LayoutGrid, List, Plus, Search, X, Filter, Download, Zap, Star, ShieldCheck } from "lucide-react"
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
import { exportToExcel } from "@/lib/utils/export-utils"

interface PropertyListProps {
  initialProperties: Property[]
}

export function PropertyList({ initialProperties }: PropertyListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchValue, setSearchValue] = useState("")
  const [typeFilter, setTypeFilter] = useState("any")
  const [statusFilter, setStatusFilter] = useState("any")
  const [listingTypeFilter, setListingTypeFilter] = useState("any")
  const [approvalFilter, setApprovalFilter] = useState("any")
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
          p.seller_name,
          p.seller_phone,
          p.approval_type,
          String(p.bhk || ""),
          String(p.price || ""),
        ].filter(Boolean).join(" ").toLowerCase()
        if (!haystack.includes(q)) return false
      }

      if (typeFilter !== "any" && p.property_type !== typeFilter) return false
      if (statusFilter !== "any" && p.status !== statusFilter) return false
      if (listingTypeFilter !== "any" && p.listing_type !== listingTypeFilter) return false
      if (approvalFilter !== "any" && p.approval_type !== approvalFilter) return false

      if (bedroomsFilter !== "any") {
        const bhk = Number(bedroomsFilter)
        const checkBhk = p.bhk ?? p.bedrooms
        if (bhk === 5 ? checkBhk < 5 : checkBhk !== bhk) return false
      }

      if (priceFilter !== "any") {
        const max = parseInt(priceFilter)
        if (p.price > max) return false
      }

      return true
    })
  }, [initialProperties, searchValue, typeFilter, statusFilter, listingTypeFilter, approvalFilter, bedroomsFilter, priceFilter])

  const hasActiveFilters = searchValue || typeFilter !== "any" || statusFilter !== "any" || listingTypeFilter !== "any" || approvalFilter !== "any" || bedroomsFilter !== "any" || priceFilter !== "any"

  const resetFilters = () => {
    setSearchValue("")
    setTypeFilter("any")
    setStatusFilter("any")
    setListingTypeFilter("any")
    setApprovalFilter("any")
    setBedroomsFilter("any")
    setPriceFilter("any")
  }

  const handleExport = () => {
    const dataToExport = filtered.map(p => ({
      'Title': p.title,
      'Listing Type': p.listing_type,
      'Property Type': p.property_type,
      'Status': p.status,
      'Price (₹)': p.price,
      'Price Negotiable': p.price_negotiable ? 'Yes' : 'No',
      'Approval Type': p.approval_type || 'N/A',
      'Seller Name': p.seller_name || 'N/A',
      'Seller Phone': p.seller_phone || 'N/A',
      'BHK': p.bhk || p.bedrooms,
      'Bedrooms': p.bedrooms,
      'Bathrooms': p.bathrooms,
      'Area': p.area_sqft || 0,
      'Area Unit': p.area_unit || 'sqft',
      'Amenities': (p.amenities || []).join(', '),
      'Is Featured': p.is_featured ? 'Yes' : 'No',
      'Is New': p.is_new ? 'Yes' : 'No',
      'Facing': p.facing || 'N/A',
      'Furnishing': p.furnishing || 'N/A',
      'Parking': p.parking || 'N/A',
      'Floor Number': p.floor_number || 'N/A',
      'Total Floors': p.total_floors || 'N/A',
      'Road Info': p.road_info || 'N/A',
      'Locality': p.locality || 'N/A',
      'City': p.city || 'N/A',
      'Pincode': p.pincode || 'N/A',
      'Address': p.address || 'N/A',
      'Description': p.description || '',
      'Slug': p.slug || '',
      'Cover Image': p.cover_image_url || '',
      'Created At': new Date(p.created_at).toLocaleString(),
    }))
    exportToExcel(dataToExport, `properties_full_export_${new Date().toISOString().split('T')[0]}`)
  }

  return (
    <div className="space-y-4">
      {/* ── Filter Bar ───────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-5">
        {/* Search + view toggle */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Search by title, seller, locality, type…"
              className="pl-11 pr-11 bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800 transition-all h-12 rounded-2xl"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              className="h-12 px-6 rounded-2xl border-2 border-slate-50 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-100 transition-all gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </Button>

            <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={cn("h-9 w-9 rounded-xl transition-all", viewMode === "grid" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                className={cn("h-9 w-9 rounded-xl transition-all", viewMode === "list" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <div className="flex items-center gap-2 mr-1">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Manage Results</span>
          </div>

          <Select onValueChange={v => setListingTypeFilter(v ?? "any")} value={listingTypeFilter}>
            <SelectTrigger className={cn(
              "h-10 px-4 text-xs font-bold rounded-xl transition-all border-none",
              listingTypeFilter !== "any" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}>
              <SelectValue>
                {listingTypeFilter === "any" ? "Sale/Rent" : 
                 listingTypeFilter === "sale" ? "For Sale" : "For Rent"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white font-bold">
              <SelectItem value="any">Any Listing</SelectItem>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
          </Select>

          {/* New Approval Type Filter */}
          <Select onValueChange={v => setApprovalFilter(v ?? "any")} value={approvalFilter}>
            <SelectTrigger className={cn(
              "h-10 px-4 text-xs font-bold rounded-xl transition-all border-none",
              approvalFilter !== "any" ? "bg-blue-100 text-blue-700 font-black" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}>
              <SelectValue>
                {approvalFilter === "any" ? "Approval Type" : 
                 approvalFilter.toUpperCase()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white font-bold">
              <SelectItem value="any">All Approvals</SelectItem>
              <SelectItem value="JDA">JDA Approved</SelectItem>
              <SelectItem value="HBA">HBA Approved</SelectItem>
              <SelectItem value="Society">Society</SelectItem>
              <SelectItem value="90B">90B</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={v => setTypeFilter(v ?? "any")} value={typeFilter}>
            <SelectTrigger className={cn(
              "h-10 px-4 text-xs font-bold rounded-xl transition-all border-none",
              typeFilter !== "any" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
              "h-10 px-4 text-xs font-bold rounded-xl transition-all border-none",
              statusFilter !== "any" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
              "h-10 px-4 text-xs font-bold rounded-xl transition-all border-none",
              bedroomsFilter !== "any" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 h-10 px-4 text-xs text-red-600 font-black rounded-xl bg-red-50 hover:bg-red-100 transition-all border border-red-100"
            >
              <X className="w-3.5 h-3.5" />
              Reset All
            </button>
          )}

          <span className="ml-auto text-[10px] text-slate-400 font-black uppercase tracking-wider">
            {filtered.length} of {initialProperties.length} Properties
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
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-slate-100 border-dashed">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-50/50">
            <Building2 className="w-12 h-12 text-slate-200" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
            {hasActiveFilters ? "No matches found" : "No properties yet"}
          </h2>
          <p className="text-slate-500 text-center max-w-sm mb-8 font-medium">
            {hasActiveFilters ? "Try adjusting your filters or search keywords." : "Upload your first property to get started."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 h-12 px-8 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-black text-sm hover:border-slate-200 transition-all shadow-sm"
            >
              <X className="w-4 h-4" />
              Clear Selection
            </button>
          )}
        </div>
      )}
    </div>
  )
}
