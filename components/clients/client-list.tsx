'use client'

import React, { useState, useMemo, useTransition } from "react"
import { Search, LayoutGrid, List, UserX, Plus, X, Filter, Download } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { ClientRow } from "@/components/clients/client-row"
import { ClientCard } from "@/components/clients/client-card"
import { BulkDeleteButton } from "@/components/clients/bulk-delete-button"
import { toast } from "sonner"
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
import { deleteClient, ClientWithAssignee } from "@/lib/actions/clients"
import Link from "next/link"
import { exportToExcel } from "@/lib/utils/export-utils"

interface ClientListProps {
  initialClients: ClientWithAssignee[]
}

export function ClientList({ initialClients }: ClientListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

  // ── Client-side instant search/filter state ──
  const [searchValue, setSearchValue] = useState("")
  const [budgetFilter, setBudgetFilter] = useState<string>("any")
  const [typeFilter, setTypeFilter] = useState<string>("any")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [lookingForFilter, setLookingForFilter] = useState<string>("any")

  // ── Pure client-side filtering — no server round-trips ──
  const filteredClients = useMemo(() => {
    const q = searchValue.toLowerCase().trim()

    return initialClients.filter(client => {
      // Search across all text-like attributes
      if (q) {
        const haystack = [
          client.full_name,
          client.phone,
          client.email,
          client.source,
          client.notes,
          client.status,
          client.priority,
          ...(client.preferred_locations || []),
          ...(client.property_types || []),
        ].filter(Boolean).join(" ").toLowerCase()

        if (!haystack.includes(q)) return false
      }

      // Budget filter — client's budget_max must be >= min threshold
      if (budgetFilter !== "any") {
        const threshold = parseInt(budgetFilter)
        if (client.budget_max && client.budget_max > threshold) return false
      }

      // Property type filter
      if (typeFilter !== "any") {
        if (!client.property_types?.includes(typeFilter as any)) return false
      }

      // Status filter
      if (statusFilter !== "all") {
        if (client.status !== statusFilter) return false
      }

      // Looking For filter
      if (lookingForFilter !== "any") {
        if (client.looking_for !== lookingForFilter) return false
      }

      return true
    })
  }, [initialClients, searchValue, budgetFilter, typeFilter, statusFilter])

  const hasActiveFilters = searchValue || budgetFilter !== "any" || typeFilter !== "any" || statusFilter !== "all" || lookingForFilter !== "any"

  const resetFilters = () => {
    setSearchValue("")
    setBudgetFilter("any")
    setTypeFilter("any")
    setStatusFilter("all")
    setLookingForFilter("any")
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedClients(checked ? filteredClients.map(c => c.id) : [])
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedClients(prev => [...prev, id])
    } else {
      setSelectedClients(prev => prev.filter(clientId => clientId !== id))
    }
  }

  const handleDeleteClient = (id: string) => {
    setClientToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!clientToDelete) return
    setIsDeletingId(clientToDelete)
    const { error } = await deleteClient(clientToDelete)
    if (error) {
      toast.error(error)
    } else {
      toast.success("Client deleted successfully")
      startTransition(() => router.refresh())
    }
    setIsDeleteDialogOpen(false)
    setClientToDelete(null)
    setIsDeletingId(null)
  }

  const handleExport = () => {
    const dataToExport = filteredClients.map(c => ({
      'Full Name': c.full_name,
      'Phone': c.phone,
      'Email': c.email || 'N/A',
      'Contact Type': c.contact_type || 'client',
      'Status': c.status,
      'Priority': c.priority,
      'Looking For': c.looking_for || 'Any',
      'Property Types': (c.property_types || []).join(', '),
      'Preferred BHKs': (c.preferred_bhks || []).join(', '),
      'Preferred Locations': (c.preferred_locations || []).join(', '),
      'Budget Min (₹)': c.budget_min || 0,
      'Budget Max (₹)': c.budget_max || 0,
      'Min Bedrooms': c.min_bedrooms || 0,
      'Min Area': c.min_area_sqft || 0,
      'Min Area Unit': c.min_area_unit,
      'Furnishing Preference': c.furnishing_preference || 'Any',
      'Possession Timeline': c.possession_timeline || 'Flexible',
      'Lead Source': c.source || 'N/A',
      'Assigned To': c.assignee?.full_name || 'Unassigned',
      'Notes': c.notes || '',
      'Follow-up Date': c.follow_up_date ? new Date(c.follow_up_date).toLocaleDateString() : 'None',
      'Created At': new Date(c.created_at).toLocaleString(),
      'Last Updated': new Date(c.updated_at).toLocaleString(),
    }))
    exportToExcel(dataToExport, `clients_full_export_${new Date().toISOString().split('T')[0]}`)
  }

  return (
    <>
      <BulkDeleteButton
        selectedIds={selectedClients}
        onClearSelection={() => setSelectedClients([])}
      />

      {/* ── Filter Bar ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Instant search */}
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Search by name, phone, email, location…"
              className="pl-9 pr-9 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 transition-all text-sm h-11 rounded-xl"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
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
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="h-11 px-4 rounded-xl cursor-pointer border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className={cn("h-9 w-9 rounded-lg transition-all", viewMode === "list" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={cn("h-9 w-9 rounded-lg transition-all", viewMode === "grid" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />

          {/* Budget filter */}
          <Select onValueChange={(v) => setBudgetFilter(v ?? "any")} value={budgetFilter}>
            <SelectTrigger className={cn(
              "h-9 px-3 text-sm font-semibold bg-white border-2 rounded-xl transition-all gap-2",
              budgetFilter !== "any"
                ? "border-emerald-400 text-emerald-700 bg-emerald-50"
                : "border-slate-200 text-slate-700 hover:border-slate-300"
            )}>
              <SelectValue>
                {budgetFilter === "any" ? "Budget" :
                  budgetFilter === "3000000" ? "Under ₹30L" :
                    budgetFilter === "6000000" ? "Up to ₹60L" : "Up to ₹1Cr"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="any" className="font-medium">Any Budget</SelectItem>
              <SelectItem value="3000000" className="font-medium">Under ₹30L</SelectItem>
              <SelectItem value="6000000" className="font-medium">Up to ₹60L</SelectItem>
              <SelectItem value="10000000" className="font-medium">Up to ₹1Cr</SelectItem>
            </SelectContent>
          </Select>

          {/* Property type filter */}
          <Select onValueChange={(v) => setTypeFilter(v ?? "any")} value={typeFilter}>
            <SelectTrigger className={cn(
              "h-9 px-3 text-sm font-semibold bg-white border-2 rounded-xl transition-all gap-2",
              typeFilter !== "any"
                ? "border-emerald-400 text-emerald-700 bg-emerald-50"
                : "border-slate-200 text-slate-700 hover:border-slate-300"
            )}>
              <SelectValue>
                {typeFilter === "any" ? "Property Type" :
                  typeFilter === "apartment" ? "Apartment" :
                    typeFilter === "villa" ? "Villa" :
                      typeFilter === "independent_house" ? "Ind. House" :
                        typeFilter === "plot" ? "Plot" : "Commercial"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="any" className="font-medium">Any Type</SelectItem>
              <SelectItem value="apartment" className="font-medium">Apartment</SelectItem>
              <SelectItem value="villa" className="font-medium">Villa</SelectItem>
              <SelectItem value="independent_house" className="font-medium">Independent House</SelectItem>
              <SelectItem value="plot" className="font-medium">Plot</SelectItem>
              <SelectItem value="commercial" className="font-medium">Commercial</SelectItem>
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select onValueChange={(v) => setStatusFilter(v ?? "all")} value={statusFilter}>
            <SelectTrigger className={cn(
              "h-9 px-3 text-sm font-semibold bg-white border-2 rounded-xl transition-all gap-2",
              statusFilter !== "all"
                ? "border-emerald-400 text-emerald-700 bg-emerald-50"
                : "border-slate-200 text-slate-700 hover:border-slate-300"
            )}>
              <SelectValue>
                {statusFilter === "all" ? "Status" :
                  statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all" className="font-medium">All Status</SelectItem>
              <SelectItem value="active" className="font-medium">Active</SelectItem>
              <SelectItem value="matched" className="font-medium">Matched</SelectItem>
              <SelectItem value="closed" className="font-medium">Closed</SelectItem>
            </SelectContent>
          </Select>

          {/* Looking For filter */}
          {/* <Select onValueChange={(v) => setLookingForFilter(v ?? "any")} value={lookingForFilter}>
            <SelectTrigger className={cn(
              "h-9 px-3 text-sm font-semibold bg-white border-2 rounded-xl transition-all gap-2",
              lookingForFilter !== "any"
                ? "border-blue-400 text-blue-700 bg-blue-50"
                : "border-slate-200 text-slate-700 hover:border-slate-300"
            )}>
              <SelectValue>
                {lookingForFilter === "any" ? "Requirement" :
                  lookingForFilter === "buy" ? "Buying" : "Renting"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="any" className="font-medium">Any Requirement</SelectItem>
              <SelectItem value="buy" className="font-medium">🏠 Buying</SelectItem>
              <SelectItem value="rent" className="font-medium">🔑 Renting</SelectItem>
            </SelectContent>
          </Select> */}

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
            {filteredClients.length} of {initialClients.length} clients
          </span>
        </div>
      </div>

      {/* ── Results ────────────────────────────────── */}
      {filteredClients.length > 0 ? (
        viewMode === "list" ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-100 hover:bg-slate-50">
                    <TableHead className="w-12 h-10 px-4">
                      <Checkbox
                        checked={selectedClients.length > 0 && selectedClients.length === filteredClients.length}
                        onCheckedChange={handleSelectAll}
                        className="border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none"
                      />
                    </TableHead>
                    <TableHead className="h-10 text-[10px] text-slate-400 uppercase font-bold tracking-wider">Client</TableHead>
                    <TableHead className="h-10 text-[10px] text-slate-400 uppercase font-bold tracking-wider">Contact</TableHead>
                    <TableHead className="h-10 text-[10px] text-slate-400 uppercase font-bold tracking-wider">Budget</TableHead>
                    <TableHead className="h-10 text-[10px] text-slate-400 uppercase font-bold tracking-wider">Type</TableHead>
                    <TableHead className="h-10 text-[10px] text-slate-400 uppercase font-bold tracking-wider">Requirements</TableHead>
                    <TableHead className="h-10 text-right pr-6 text-[10px] text-slate-400 uppercase font-bold tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <ClientRow
                      key={client.id}
                      client={client}
                      isSelected={selectedClients.includes(client.id)}
                      onSelect={handleSelectOne}
                      onDelete={handleDeleteClient}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} onDelete={handleDeleteClient} />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 border-dashed">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-50/50">
            <UserX className="w-10 h-10 text-slate-200" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {hasActiveFilters ? "No clients match your search" : "No clients found"}
          </h2>
          <p className="text-slate-500 text-center max-w-sm mb-8 text-sm font-medium">
            {hasActiveFilters ? "Try different keywords or clear the filters." : "Add a new client to get started."}
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
            <Link href="/clients/new">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl h-11 px-8 font-bold flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add your first client
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* ── Delete Confirmation ────────────────────── */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white rounded-2xl max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Delete client?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 pt-1">
              This will permanently remove this client from your records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 pt-4">
            <AlertDialogCancel className="flex-1 border-slate-200 rounded-xl" onClick={() => { setIsDeleteDialogOpen(false); setClientToDelete(null); }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none rounded-xl" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
