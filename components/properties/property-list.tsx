'use client'

import React, { useState, useMemo, useTransition } from "react"
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
import { useRouter } from "next/navigation"
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
}

export function PropertyList({ initialProperties }: PropertyListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [searchValue, setSearchValue] = useState("")
  const [typeFilter, setTypeFilter] = useState("any")
  const [statusFilter, setStatusFilter] = useState("any")
  const [listingTypeFilter, setListingTypeFilter] = useState("any")
  const [approvalFilter, setApprovalFilter] = useState("any")
  const [bedroomsFilter, setBedroomsFilter] = useState("any")
  const [priceFilter, setPriceFilter] = useState("any")

  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null)

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
          p.group,
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
        const filterBhk = Number(bedroomsFilter)
        const propertyBhks = p.bhk || []

        if (filterBhk === 5) {
          // 5+ BHK: check if any value in the array is >= 5
          if (!propertyBhks.some(val => val >= 5)) return false
        } else {
          // Specific BHK: check if the array contains the filtered value
          if (!propertyBhks.includes(filterBhk)) return false
        }
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
                    <TableHead className="w-12 h-10 px-4">
                      <Checkbox
                        checked={selectedProperties.length > 0 && selectedProperties.length === filtered.length}
                        onCheckedChange={handleSelectAll}
                        className="border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none"
                      />
                    </TableHead>
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
    </div>
  )
}
