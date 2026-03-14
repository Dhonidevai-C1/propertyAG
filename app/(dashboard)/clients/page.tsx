'use client'

import React, { useState, useEffect } from "react"
import {
  UserPlus,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  UserX,
  Trash2,
  X,
  Plus
} from "lucide-react"
import Router from "next/router"
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
import { Client, ClientRow, ClientStatus } from "@/components/clients/client-row"
import { ClientCard } from "@/components/clients/client-card"
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
import Link from "next/link"

const sampleClients: Client[] = [
  {
    id: "c1",
    name: "Anil Sharma",
    phone: "+91 98290 12345",
    email: "anil.sharma@example.com",
    addedDate: "2 days ago",
    budget: "₹80L – ₹1.2Cr",
    requirements: ["3BHK", "Bani Park", "West Facing"],
    status: "Matched",
    matchCount: 3,
  },
  {
    id: "c2",
    name: "Megha Gupta",
    phone: "+91 94140 54321",
    email: "megha.g@outlook.com",
    addedDate: "3 days ago",
    budget: "₹50L – ₹75L",
    requirements: ["2BHK", "Malviya Nagar", "Semi-furnished"],
    status: "Active",
    matchCount: 5,
  },
  {
    id: "c3",
    name: "Vikram Singh",
    phone: "+91 95090 99887",
    email: "v.singh@gmail.com",
    addedDate: "1 week ago",
    budget: "₹2Cr – ₹3.5Cr",
    requirements: ["4BHK", "Vaishali Nagar", "Villa"],
    status: "Active",
    matchCount: 2,
  },
  {
    id: "c4",
    name: "Deepak Verma",
    phone: "+91 91160 11223",
    email: "deepak.verma@company.com",
    addedDate: "5 days ago",
    budget: "₹30L – ₹45L",
    requirements: ["1BHK", "Jagatpura", "Plot"],
    status: "Matched",
    matchCount: 1,
  },
  {
    id: "c5",
    name: "Sanjay Mishra",
    phone: "+91 98877 66554",
    email: "sanjay.mishra@live.in",
    addedDate: "2 weeks ago",
    budget: "Above ₹5Cr",
    requirements: ["Luxury", "Farmhouse", "Agra Road"],
    status: "Closed",
    matchCount: 0,
  },
  {
    id: "c6",
    name: "Ritu Khandelwal",
    phone: "+91 70140 33445",
    email: "ritu.k@gmail.com",
    addedDate: "1 day ago",
    budget: "₹60L – ₹90L",
    requirements: ["3BHK", "Mansarovar", "Parking"],
    status: "Matched",
    matchCount: 4,
  },
  {
    id: "c7",
    name: "Rahul Bajaj",
    phone: "+91 93140 88776",
    email: "rbajaj@hotmail.com",
    addedDate: "4 days ago",
    budget: "₹1.5Cr – ₹2.2Cr",
    requirements: ["Office", "C-Scheme", "Furnished"],
    status: "Active",
    matchCount: 2,
  },
  {
    id: "c8",
    name: "Pooja Roy",
    phone: "+91 82290 55443",
    email: "pooja.roy@example.com",
    addedDate: "10 days ago",
    budget: "₹40L – ₹55L",
    requirements: ["2BHK", "Raja Park", "Ready to Move"],
    status: "Active",
    matchCount: 6,
  },
]

export default function ClientsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    budget: "any",
    type: "any",
    status: "all",
  })

  const filteredClients = sampleClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
    const matchesStatus = filters.status === "all" || client.status === filters.status
    const matchesType = filters.type === "any" || client.requirements.some(req => req.includes(filters.type))

    // Budget filter logic (mocked)
    let matchesBudget = true
    if (filters.budget !== "any") {
      if (filters.budget === "under-30l") matchesBudget = client.budget.includes("₹30L") || client.budget.includes("₹40L")
      // ... simplified for demo
    }

    return matchesSearch && matchesStatus && matchesType && matchesBudget
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(filteredClients.map(c => c.id))
    } else {
      setSelectedClients([])
    }
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

  const confirmDelete = () => {
    toast.success("Client deleted successfully")
    setIsDeleteDialogOpen(false)
    setClientToDelete(null)
  }

  const bulkDelete = () => {
    toast.success(`${selectedClients.length} clients deleted`)
    setSelectedClients([])
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clients</h1>
          <p className="text-sm text-slate-500 font-medium">Your buyer and renter database</p>
        </div>
        <Link className="cursor-pointer" href={`/clients/new`}>
          <Button
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl h-11 px-6 flex items-center gap-2 font-semibold">
            <UserPlus className="w-5 h-5" />
            Add client
          </Button>
        </Link>
      </div>

      {/* Bulk Actions Bar */}
      {selectedClients.length > 0 && (
        <div className="sticky top-0 z-20 bg-white border border-slate-100 shadow-lg rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 ml-2">
            <span className="text-sm font-bold text-slate-900">{selectedClients.length} clients selected</span>
            <Separator orientation="vertical" className="h-4 bg-slate-200" />
            <button
              onClick={() => setSelectedClients([])}
              className="text-sm text-emerald-600 font-bold hover:text-emerald-700"
            >
              Clear selection
            </button>
          </div>
          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold"
            onClick={bulkDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete selected
          </Button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Search by name, phone, email…"
              className="pl-9 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 transition-all text-sm h-11 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className={cn(
                "h-9 w-9 rounded-lg transition-all",
                viewMode === "list" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"
              )}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={cn(
                "h-9 w-9 rounded-lg transition-all",
                viewMode === "grid" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select onValueChange={(v) => setFilters(f => ({ ...f, budget: v as string }))} value={filters.budget}>
            <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs bg-white border-slate-200 rounded-lg">
              <SelectValue placeholder="Budget range" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="any">Any Budget</SelectItem>
              <SelectItem value="under-30l">Under ₹30L</SelectItem>
              <SelectItem value="30-60l">₹30L – ₹60L</SelectItem>
              <SelectItem value="60-1cr">₹60L – ₹1Cr</SelectItem>
              <SelectItem value="above-1cr">Above ₹1Cr</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => setFilters(f => ({ ...f, type: v as string }))} value={filters.type}>
            <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs bg-white border-slate-200 rounded-lg">
              <SelectValue placeholder="Looking for" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="any">Any type</SelectItem>
              <SelectItem value="Apartment">Apartment</SelectItem>
              <SelectItem value="Villa">Villa</SelectItem>
              <SelectItem value="Plot">Plot</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => setFilters(f => ({ ...f, status: v as string }))} value={filters.status}>
            <SelectTrigger className="w-full sm:w-[130px] h-9 text-xs bg-white border-slate-200 rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Matched">Matched</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {(filters.status !== "all" || filters.type !== "any" || filters.budget !== "any" || searchQuery) && (
            <Button
              variant="ghost"
              onClick={() => {
                setFilters({ status: "all", type: "any", budget: "any" })
                setSearchQuery("")
              }}
              className="h-9 text-xs text-slate-500 px-2"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Results Section */}
      {filteredClients.length > 0 ? (
        viewMode === "list" ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-100 hover:bg-slate-50">
                    <TableHead className="w-12 h-10 px-4">
                      <Checkbox
                        checked={selectedClients.length === filteredClients.length}
                        onCheckedChange={handleSelectAll}
                        className="border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none"
                      />
                    </TableHead>
                    <TableHead className="h-10 text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">Client</TableHead>
                    <TableHead className="h-10 text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">Contact</TableHead>
                    <TableHead className="h-10 text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">Budget</TableHead>
                    <TableHead className="h-10 text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">Requirements</TableHead>
                    <TableHead className="h-10 text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">Status</TableHead>
                    <TableHead className="h-10 text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">Matches</TableHead>
                    <TableHead className="h-10 text-right pr-6 text-[10px] sm:text-xs text-slate-400 uppercase font-bold tracking-wider">Actions</TableHead>
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
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-50/50">
            <UserX className="w-12 h-12 text-slate-200" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No clients found</h2>
          <p className="text-slate-500 text-center max-w-sm mb-10 text-sm font-medium">
            Try adjusting your search or filters, or add a new client to your database.
          </p>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl h-11 px-8 font-bold flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add your first client
          </Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white rounded-2xl max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 pt-1">
              This will permanently delete this client from your records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 sm:justify-start pt-4">
            <AlertDialogCancel className="flex-1 border-slate-200 rounded-xl" onClick={() => { setIsDeleteDialogOpen(false); setClientToDelete(null); }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none rounded-xl" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Separator({ orientation, className }: { orientation: "vertical" | "horizontal", className?: string }) {
  return (
    <div className={cn(
      className,
      orientation === "vertical" ? "w-px h-full mx-1" : "h-px w-full my-1"
    )} />
  )
}
