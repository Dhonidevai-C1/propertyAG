'use client'

import React, { useState, useMemo } from "react"
import {
  Plus,
  Search,
  Filter,
  X,
  Handshake,
  LayoutGrid,
  List,
  Download,
  MapPin,
  Star
} from "lucide-react"
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
import { BrokerCard } from "@/components/brokers/broker-card"
import { Broker } from "@/lib/types/database"
import { exportToExcel } from "@/lib/utils/export-utils"

interface BrokerListProps {
  initialBrokers: Broker[]
}

const COMMON_SPECIALTIES = [
  "Plots", "Luxury Apartments", "Villas", "Commercial Office",
  "Retail Space", "Industrial", "Agriculture Land", "Farmhouses",
  "Rentals", "Resale"
]

export function BrokerList({ initialBrokers }: BrokerListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchValue, setSearchValue] = useState("")
  const [typeFilter, setTypeFilter] = useState("any")
  const [specialtyFilter, setSpecialtyFilter] = useState("any")

  const filtered = useMemo(() => {
    const q = searchValue.toLowerCase().trim()

    return initialBrokers.filter(b => {
      // Search logic
      if (q) {
        const haystack = [
          b.full_name,
          b.company_name,
          b.area,
          b.email,
          ...(b.phones || []),
          ...(b.specialties || []),
          b.notes
        ].filter(Boolean).join(" ").toLowerCase()
        if (!haystack.includes(q)) return false
      }

      // Filter logic
      if (typeFilter !== "any" && b.broker_type !== typeFilter) return false
      if (specialtyFilter !== "any" && !b.specialties?.includes(specialtyFilter)) return false

      return true
    })
  }, [initialBrokers, searchValue, typeFilter, specialtyFilter])

  const resetFilters = () => {
    setSearchValue("")
    setTypeFilter("any")
    setSpecialtyFilter("any")
  }

  const handleExport = () => {
    const dataToExport = filtered.map(b => ({
      'Full Name': b.full_name,
      'Type': b.broker_type,
      'Rating': `${b.rating}/5`,
      'Phones': b.phones?.join(", "),
      'Email': b.email || 'N/A',
      'Agency': b.company_name || 'N/A',
      'Operating Area': b.area || 'N/A',
      'Specialties': b.specialties?.join(", "),
      'Created At': new Date(b.created_at).toLocaleDateString(),
    }))
    exportToExcel(dataToExport, `brokers_export_${new Date().toISOString().split('T')[0]}`)
  }

  const hasActiveFilters = searchValue || typeFilter !== "any" || specialtyFilter !== "any"

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-xl shadow-slate-200/40 space-y-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-600 transition-colors" />
            <Input
              placeholder="Search by name, phone, area or agency..."
              className="pl-11 h-12 bg-slate-50 border-none rounded-2xl focus:bg-white transition-all text-slate-800"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              className="h-12 px-6 rounded-2xl border-2 border-slate-500 text-slate-600 cursor-pointer font-bold hover:bg-slate-500 hover:text-slate-100 transition-all gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>

            <Link href="/brokers/new">
              <Button className="h-12 cursor-pointer px-6 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all gap-2">
                <Plus className="w-4 h-4" />
                <span>Add Broker</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
          <div className="flex items-center gap-2 mr-1">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
              <Filter className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filters</span>
          </div>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v || "any")}>
            <SelectTrigger className={cn(
              "h-10 px-4 text-xs font-bold rounded-xl border-none transition-all",
              typeFilter !== "any" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}>
              <SelectValue placeholder="Broker Type" />
            </SelectTrigger>
            <SelectContent className="bg-white font-bold">
              <SelectItem value="any">All Types</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
              <SelectItem value="agency">Agency Based</SelectItem>
            </SelectContent>
          </Select>

          <Select value={specialtyFilter} onValueChange={(v) => setSpecialtyFilter(v || "any")}>
            <SelectTrigger className={cn(
              "h-10 px-4 text-xs font-bold rounded-xl border-none transition-all",
              specialtyFilter !== "any" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}>
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent className="bg-white font-bold max-h-[300px]">
              <SelectItem value="any">Any Specialty</SelectItem>
              {COMMON_SPECIALTIES.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 h-10 px-4 text-xs text-red-600 font-bold rounded-xl bg-red-50 hover:bg-red-100 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <div className="ml-auto text-[10px] font-black uppercase tracking-widest text-slate-400">
            {filtered.length} of {initialBrokers.length} Brokers
          </div>
        </div>
      </div>

      {/* Grid of Brokers */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(broker => (
            <BrokerCard key={broker.id} broker={broker} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-2 border-slate-100 border-dashed">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-50/50">
            <Handshake className="w-12 h-12 text-slate-200" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
            {hasActiveFilters ? "No matches found" : "No brokers yet"}
          </h2>
          <p className="text-slate-500 text-center max-w-sm mb-8 font-medium">
            {hasActiveFilters ? "Try adjusting your search or filters." : "Start building your network by adding your first broker."}
          </p>
          {hasActiveFilters && (
            <Button
              onClick={resetFilters}
              variant="outline"
              className="h-12 px-8 rounded-2xl border-2 border-slate-100 text-slate-700 font-black text-sm"
            >
              Clear Selection
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
