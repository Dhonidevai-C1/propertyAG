'use client'

import React, { useState, useMemo, useTransition } from "react"
import { useDebounce } from "use-debounce"
import { ChevronLeft, ChevronRight, Building2, LayoutGrid, List, Plus, Search, X, Filter, Download, Zap, Star, ShieldCheck } from "lucide-react"
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
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { PropertyRow } from "@/components/properties/property-row"
import { PropertyCard } from "@/components/properties/property-card"
import { Property } from "@/lib/types/database"
import { exportToExcel } from "@/lib/utils/export-utils"
import { deleteProperty } from "@/lib/actions/properties"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PropertyListProps {
  initialProperties: Property[]
  totalCount: number
}

export function PropertyList({ initialProperties, totalCount }: PropertyListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  // ── Unified Server-Driven Filters ──
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "")
  const [typeFilter, setTypeFilter] = useState(searchParams.get("property_type") || "any")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "any")
  const [listingTypeFilter, setListingTypeFilter] = useState(searchParams.get("listing_type") || "any")
  const [approvalFilter, setApprovalFilter] = useState(searchParams.get("approval_type") || "any")
  const [bedroomsFilter, setBedroomsFilter] = useState(searchParams.get("bhk") || "any")
  const currentPage = parseInt(searchParams.get("page") || "1")

  const [debouncedSearch] = useDebounce(searchValue, 400)

  // Sync state to URL
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (debouncedSearch) params.set("search", debouncedSearch)
    else params.delete("search")

    if (typeFilter !== "any") params.set("property_type", typeFilter)
    else params.delete("property_type")

    if (statusFilter !== "any") params.set("status", statusFilter)
    else params.delete("status")

    if (listingTypeFilter !== "any") params.set("listing_type", listingTypeFilter)
    else params.delete("listing_type")

    if (approvalFilter !== "any") params.set("approval_type", approvalFilter)
    else params.delete("approval_type")

    if (bedroomsFilter !== "any") params.set("bhk", bedroomsFilter)
    else params.delete("bhk")

    // Reset page on filter change
    const hasFilterChanged =
      debouncedSearch !== (searchParams.get("search") || "") ||
      typeFilter !== (searchParams.get("property_type") || "any") ||
      statusFilter !== (searchParams.get("status") || "any") ||
      listingTypeFilter !== (searchParams.get("listing_type") || "any") ||
      approvalFilter !== (searchParams.get("approval_type") || "any") ||
      bedroomsFilter !== (searchParams.get("bhk") || "any")

    if (hasFilterChanged) {
      params.set("page", "1")
    }

    router.push(`/properties?${params.toString()}`, { scroll: false })
  }, [debouncedSearch, typeFilter, statusFilter, listingTypeFilter, approvalFilter, bedroomsFilter])

  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null)

  const filtered = initialProperties
  const totalPages = Math.ceil(totalCount / 30)

  const hasActiveFilters = searchValue || typeFilter !== "any" || statusFilter !== "any" || listingTypeFilter !== "any" || approvalFilter !== "any" || bedroomsFilter !== "any"

  const resetFilters = () => {
    setSearchValue("")
    setTypeFilter("any")
    setStatusFilter("any")
    setListingTypeFilter("any")
    setApprovalFilter("any")
    setBedroomsFilter("any")
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`/properties?${params.toString()}`, { scroll: true })
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedProperties(checked ? filtered.map(p => p.id) : [])
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProperties(prev => [...prev, id])
    } else {
      setSelectedProperties(prev => prev.filter(pId => pId !== id))
    }
  }

  const handleDeleteProperty = (id: string) => {
    setPropertyToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!propertyToDelete) return
    const { error } = await deleteProperty(propertyToDelete)
    if (error) {
      toast.error(error)
    } else {
      toast.success("Property moved to trash")
      startTransition(() => router.refresh())
    }
    setIsDeleteDialogOpen(false)
    setPropertyToDelete(null)
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
      'Plot Group': p.group || 'N/A',
      'Contact Type': p.contact_type || 'client',
      'Seller Name': p.seller_name || 'N/A',
      'Seller Phone': p.seller_phone || 'N/A',
      'BHK': Array.isArray(p.bhk) ? p.bhk.sort((a, b) => a - b).join(', ') : (p.bhk || p.bedrooms),
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
      <div className="bg-white rounded-[2rem] border border-slate-300 p-6 shadow-lg space-y-5">
        {/* Search + view toggle */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Search by title, seller, locality, type…"
              className={cn(
                "pl-11 pr-11 bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800 transition-all h-12 rounded-2xl",
                isPending && "opacity-70 animate-pulse"
              )}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
            />
            {isPending && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {searchValue && !isPending && (
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
              listingTypeFilter !== "any" ? "bg-emerald-100 text-emerald-700" : "bg-emerald-100 text-emerald-700 hover:bg-slate-200"
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
              approvalFilter !== "any" ? "bg-blue-100 text-blue-700 font-black" : "bg-emerald-100 text-emerald-700 hover:bg-slate-200"
            )}>
              <SelectValue>
                {approvalFilter === "any" ? "Approval Type" :
                  approvalFilter.toUpperCase()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white font-bold">
              <SelectItem value="any">All Approvals</SelectItem>
              <SelectItem value="JDA">JDA Approved</SelectItem>
              <SelectItem value="HB">HB Approved</SelectItem>
              <SelectItem value="Society">Society</SelectItem>
              <SelectItem value="90B">90B</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={v => setTypeFilter(v ?? "any")} value={typeFilter}>
            <SelectTrigger className={cn(
              "h-10 px-4 text-xs font-bold rounded-xl transition-all border-none",
              typeFilter !== "any" ? "bg-emerald-100 text-emerald-700" : "bg-emerald-100 text-emerald-700 hover:bg-slate-200"
            )}>
              <SelectValue>
                {typeFilter === "any" ? "Property Type" :
                  typeFilter === "apartment" ? "Apartment" :
                    typeFilter === "villa" ? "Villa" :
                      typeFilter === "independent_house" ? "Ind. House" :
                        typeFilter === "commercial" ? "Commercial" :
                          typeFilter === "plot" ? "Plot" :
                            typeFilter === "farmhouse" ? "Farmhouse" :
                              typeFilter === "farmer_land" ? "Agriculture Land" : "Farmer Land"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white ">
              <SelectItem value="any" className="font-medium">All Types</SelectItem>
              <SelectItem value="apartment" className="font-medium">Apartment</SelectItem>
              <SelectItem value="villa" className="font-medium">Villa</SelectItem>
              <SelectItem value="independent_house" className="font-medium ">Independent House</SelectItem>
              <SelectItem value="commercial" className="font-medium">Commercial</SelectItem>
              <SelectItem value="plot" className="font-medium">Plot</SelectItem>
              <SelectItem value="farmhouse" className="font-medium">Farmhouse</SelectItem>
              <SelectItem value="farmer_land" className="font-medium">Agriculture Land</SelectItem>
              <SelectItem value="penthouse" className="font-medium">Penthouse</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={v => setStatusFilter(v ?? "any")} value={statusFilter}>
            <SelectTrigger className={cn(
              "h-10 px-4 text-xs font-bold rounded-xl transition-all border-none",
              statusFilter !== "any" ? "bg-emerald-100 text-emerald-700" : "bg-emerald-100 text-emerald-700 hover:bg-slate-200"
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
              bedroomsFilter !== "any" ? "bg-emerald-100 text-emerald-700" : "bg-emerald-100 text-emerald-700  hover:bg-slate-200"
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
              className="flex items-center gap-1 h-9 px-3 text-xs text-red-500 font-bold rounded-xl border-2 border-red-100 bg-red-50 hover:bg-red-100 transition-all cursor-pointer"
            >
              <X className="w-3 h-3" />
              Reset
            </button>
          )}

          <span className="ml-auto text-xs text-slate-500 font-semibold italic">
            Showing page {currentPage} of {totalPages || 1} ({totalCount} total)
          </span>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────── */}
      {filtered.length > 0 ? (
        viewMode === "list" ? (
          <div className="bg-white rounded-[2rem] border border-slate-300 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-200 hover:bg-slate-50">
                    <TableHead className="h-10 text-right pr-6 text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Actions</TableHead>
                    <TableHead className="h-10 text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Property</TableHead>
                    <TableHead className="h-10 text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Status</TableHead>
                    <TableHead className="h-10 text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Price</TableHead>
                    <TableHead className="h-10 text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Type</TableHead>
                    <TableHead className="h-10 text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((property) => (
                    <PropertyRow
                      key={property.id}
                      property={property}
                      isSelected={selectedProperties.includes(property.id)}
                      onSelect={handleSelectOne}
                      onDelete={handleDeleteProperty}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(property => (
              <PropertyCard key={property.id} property={property} viewMode="grid" />
            ))}
          </div>
        )
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

      {/* ── Delete Confirmation ────────────────────── */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white rounded-3xl max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Move to trash?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 pt-1">
              This property will be moved to trash and hidden from public searches.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 pt-4">
            <AlertDialogCancel className="flex-1 border-slate-200 rounded-2xl" onClick={() => { setIsDeleteDialogOpen(false); setPropertyToDelete(null); }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none rounded-2xl" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Pagination Footer ─────────────────────── */}
      <div className="flex items-center justify-between gap-4 mt-8 pb-10 border-t border-slate-100 pt-6">
        <div className="flex-1 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-xl border-2 border-slate-200 font-bold text-slate-600 disabled:opacity-50 h-10 px-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-xl border-2 border-slate-200 font-bold text-slate-600 disabled:opacity-50 h-10 px-4"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current
            let pageNum = currentPage
            if (totalPages <= 5) pageNum = i + 1
            else if (currentPage <= 3) pageNum = i + 1
            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
            else pageNum = currentPage - 2 + i

            if (pageNum <= 0 || pageNum > totalPages) return null

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageChange(pageNum)}
                className={cn(
                  "h-10 w-10 rounded-xl font-bold transition-all",
                  currentPage === pageNum
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg shadow-emerald-100"
                    : "border-2 border-slate-200 text-slate-600 hover:border-slate-300"
                )}
              >
                {pageNum}
              </Button>
            )
          })}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="text-slate-400 font-bold px-2">...</span>
          )}
        </div>

        <div className="flex-1 flex justify-end">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </p>
        </div>
      </div>
    </div>
  )
}
