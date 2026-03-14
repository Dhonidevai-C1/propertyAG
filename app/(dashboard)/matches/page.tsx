'use client'

import React, { useState, useMemo } from "react"
import { 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter,
  ArrowUpDown,
  TrendingUp,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MatchCard } from "@/components/matches/match-card"

const SAMPLE_MATCHES = [
  {
    id: "m1",
    score: 94,
    date: "2 hours ago",
    status: "New" as const,
    client: { name: "Priya Sharma", budget: "₹60L – ₹1.2Cr", requirements: ["3BHK", "Vaishali Nagar", "Semi-furnished"] },
    property: { name: "Luxury 3BHK Apartment", price: "₹85,00,000", specs: ["3BHK", "1450 sqft", "Vaishali Nagar"] }
  },
  {
    id: "m2",
    score: 88,
    date: "1 day ago",
    status: "Reviewed" as const,
    client: { name: "Anil Chandra", budget: "₹40L – ₹60L", requirements: ["2BHK", "Mansarovar", "Balcony"] },
    property: { name: "Green View Residency", price: "₹48,00,000", specs: ["2BHK", "1100 sqft", "Mansarovar"] }
  },
  {
    id: "m3",
    score: 72,
    date: "2 days ago",
    status: "New" as const,
    client: { name: "Sneha Kapoor", budget: "₹1.5Cr – ₹2.5Cr", requirements: ["Villa", "Bani Park", "Garden"] },
    property: { name: "Royal Heritage Villa", price: "₹2.2Cr", specs: ["4BHK", "3200 sqft", "Bani Park"] }
  },
  {
    id: "m4",
    score: 91,
    date: "2 days ago",
    status: "Contacted" as const,
    client: { name: "Rahul Singh", budget: "₹30L – ₹45L", requirements: ["1BHK", "Jagatpura", "Immediate"] },
    property: { name: "Sky Heights Annex", price: "₹32,50,000", specs: ["1BHK", "650 sqft", "Jagatpura"] }
  },
  {
    id: "m5",
    score: 65,
    date: "3 days ago",
    status: "New" as const,
    client: { name: "Vikram Mehra", budget: "₹80L – ₹1.5Cr", requirements: ["Independent House", "Malviya Nagar"] },
    property: { name: "Modern Duplex House", price: "₹1.1Cr", specs: ["3BHK", "1800 sqft", "Malviya Nagar"] }
  },
  {
    id: "m6",
    score: 82,
    date: "4 days ago",
    status: "Reviewed" as const,
    client: { name: "Meera Gupta", budget: "₹50L – ₹70L", requirements: ["Apartment", "C-Scheme", "East Facing"] },
    property: { name: "Elite Square Apt", price: "₹68,00,000", specs: ["3BHK", "1350 sqft", "C-Scheme"] }
  },
  {
    id: "m7",
    score: 78,
    date: "5 days ago",
    status: "New" as const,
    client: { name: "Rajesh Khanna", budget: "₹2Cr+", requirements: ["Penthouse", "Tonk Road", "Pool"] },
    property: { name: "The Skyloft Penthouse", price: "₹2.8Cr", specs: ["4BHK", "4500 sqft", "Tonk Road"] }
  },
  {
    id: "m8",
    score: 96,
    date: "1 week ago",
    status: "Contacted" as const,
    client: { name: "Kiran Bedi", budget: "₹1Cr – ₹1.5Cr", requirements: ["Independent floor", "Raja Park"] },
    property: { name: "Premium Ground Floor", price: "₹1.25Cr", specs: ["3BHK", "2100 sqft", "Raja Park"] }
  }
]

export default function SmartMatchesPage() {
  const [search, setSearch] = useState("")
  const [minScore, setMinScore] = useState(50)
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortBy, setSortBy] = useState("Highest match")

  const filteredMatches = useMemo(() => {
    return SAMPLE_MATCHES.filter(m => {
      const matchesSearch = 
        m.client.name.toLowerCase().includes(search.toLowerCase()) || 
        m.property.name.toLowerCase().includes(search.toLowerCase())
      const matchesScore = m.score >= minScore
      const matchesStatus = statusFilter === "All" || m.status === statusFilter
      return matchesSearch && matchesScore && matchesStatus
    }).sort((a, b) => {
      if (sortBy === "Highest match") return b.score - a.score
      if (sortBy === "Newest first") return 0 // Mocking sort logic
      if (sortBy === "Client name") return a.client.name.localeCompare(b.client.name)
      if (sortBy === "Property price") return b.property.price.localeCompare(a.property.price)
      return 0
    })
  }, [search, minScore, statusFilter, sortBy])

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Smart matches</h1>
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/20" />
          </div>
          <p className="text-sm text-slate-500 font-medium">Properties matched to client requirements by the matching engine</p>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-600 text-white border-none rounded-xl h-11 px-6 flex items-center gap-2 font-bold shadow-lg shadow-amber-100">
          <RefreshCw className="w-4 h-4" />
          Run match for all
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="flex flex-wrap gap-4">
        <StatPill icon={<Sparkles className="w-4 h-4" />} color="amber" label="24 total matches" />
        <StatPill icon={<CheckCircle2 className="w-4 h-4" />} color="emerald" label="8 high confidence (90%+)" />
        <StatPill icon={<Clock className="w-4 h-4" />} color="slate" label="5 unreviewed" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          {/* Search */}
          <div className="lg:col-span-4 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Search</label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input 
                placeholder="Client or property name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-emerald-50 transition-all font-medium"
              />
            </div>
          </div>

          {/* Score Slider */}
          <div className="lg:col-span-3 space-y-3 px-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min match score</label>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{minScore}%+</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="100" 
              value={minScore} 
              onChange={(e) => setMinScore(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Sort By */}
          <div className="lg:col-span-3 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sort by</label>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as string)}>
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-transparent font-medium">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Highest match">Highest match</SelectItem>
                <SelectItem value="Newest first">Newest first</SelectItem>
                <SelectItem value="Client name">By client name</SelectItem>
                <SelectItem value="Property price">By property price</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-2">
             <Button 
               variant="ghost" 
               className="h-11 w-full text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-wider"
               onClick={() => {
                 setSearch("")
                 setMinScore(50)
                 setStatusFilter("All")
                 setSortBy("Highest match")
               }}
             >
               Clear filters
             </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
          <div className="flex flex-wrap gap-2">
            {["All", "New", "Reviewed", "Contacted"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                  statusFilter === s 
                    ? "bg-slate-800 text-white border-slate-800 shadow-md" 
                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Match Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-10 h-10 text-slate-200" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800">No matches found</h3>
              <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">Try adjusting the minimum score filter or add more clients.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatPill({ icon, label, color }: { icon: React.ReactNode, label: string, color: 'amber' | 'emerald' | 'slate' }) {
  const colors = {
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100"
  }

  return (
    <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold", colors[color])}>
      {icon}
      {label}
    </div>
  )
}
