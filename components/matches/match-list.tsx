'use client'

import React, { useState, useMemo, useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Clock,
  Search,
  ArrowUpDown,
  X,
  Loader2,
} from "lucide-react"
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
import { MatchWithDetails } from "@/lib/types/database"
import { MatchCard } from "@/components/matches/match-card"
import { toast } from "sonner"

interface MatchListProps {
  initialMatches: MatchWithDetails[]
  initialFilters: {
    minScore?: number
    status?: string
    search?: string
    sortBy?: string
  }
}

export function MatchList({ initialMatches, initialFilters }: MatchListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [isRunning, setIsRunning] = useState(false)

  const [search, setSearch] = useState(initialFilters.search ?? "")
  const [minScore, setMinScore] = useState(initialFilters.minScore ?? 60)
  const [statusFilter, setStatusFilter] = useState(initialFilters.status ?? "All")
  const [sortBy, setSortBy] = useState(initialFilters.sortBy ?? "Highest match")

  const filteredMatches = useMemo(() => {
    return initialMatches
      .filter(m => {
        const matchesSearch =
          !search ||
          m.client?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          m.property?.title?.toLowerCase().includes(search.toLowerCase())
        const matchesScore = m.score >= minScore
        const matchesStatus =
          statusFilter === "All" ||
          m.status === statusFilter.toLowerCase()
        return matchesSearch && matchesScore && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === "Highest match") return b.score - a.score
        if (sortBy === "Newest first")
          return new Date(b.matched_at).getTime() - new Date(a.matched_at).getTime()
        if (sortBy === "Client name")
          return (a.client?.full_name ?? "").localeCompare(b.client?.full_name ?? "")
        if (sortBy === "Property price")
          return (b.property?.price ?? 0) - (a.property?.price ?? 0)
        return 0
      })
  }, [initialMatches, search, minScore, statusFilter, sortBy])

  const highConfidence = filteredMatches.filter(m => m.score >= 90).length
  const unreviewed = filteredMatches.filter(m => m.status === "new").length

  const runMatchForAll = async () => {
    setIsRunning(true)
    try {
      const res = await fetch("/api/matches/run", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        toast.success(`Match engine complete — ${data.totalMatches ?? data.matchCount} matches found`)
        startTransition(() => router.refresh())
      } else {
        toast.error(data.error || "Match engine failed")
      }
    } catch {
      toast.error("Failed to run match engine")
    } finally {
      setIsRunning(false)
    }
  }

  const resetFilters = () => {
    setSearch("")
    setMinScore(60)
    setStatusFilter("All")
    setSortBy("Highest match")
  }

  return (
    <div className="space-y-6">
      {/* Run Match + Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <StatPill
            icon={<Sparkles className="w-4 h-4" />}
            color="amber"
            label={`${filteredMatches.length} matches`}
          />
          <StatPill
            icon={<CheckCircle2 className="w-4 h-4" />}
            color="emerald"
            label={`${highConfidence} high confidence (90%+)`}
          />
          <StatPill
            icon={<Clock className="w-4 h-4" />}
            color="slate"
            label={`${unreviewed} unreviewed`}
          />
        </div>
        <Button
          onClick={runMatchForAll}
          disabled={isRunning}
          className="bg-amber-500 hover:bg-amber-600 text-white border-none rounded-xl h-11 px-6 flex items-center gap-2 font-bold shadow-lg shadow-amber-100 shrink-0"
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {isRunning ? "Running…" : "Run match for all"}
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* Search */}
          <div className="lg:col-span-4 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Search
            </label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                placeholder="Client or property name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 transition-all font-medium"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Score Slider */}
          <div className="lg:col-span-3 space-y-3 px-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Min match score
              </label>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {minScore}%+
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={e => setMinScore(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Sort */}
          <div className="lg:col-span-3 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Sort by
            </label>
            <Select value={sortBy} onValueChange={v => setSortBy(v ?? "Highest match")}>
              <SelectTrigger className="h-11 rounded-xl bg-slate-500 border-transparent font-medium">
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
              onClick={resetFilters}
            >
              Clear filters
            </Button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Status:
          </span>
          <div className="flex flex-wrap gap-2">
            {["All", "New", "Reviewed", "Contacted"].map(s => (
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

      {/* Match Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMatches.length > 0 ? (
          filteredMatches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-slate-200" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800">No matches found</h3>
              <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">
                Try adjusting the minimum score filter or run the match engine.
              </p>
            </div>
            <Button
              onClick={runMatchForAll}
              disabled={isRunning}
              className="bg-amber-500 hover:bg-amber-600 text-white gap-2 rounded-xl px-6"
            >
              <RefreshCw className="w-4 h-4" />
              Run match engine
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatPill({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode
  label: string
  color: "amber" | "emerald" | "slate"
}) {
  const colors = {
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
  }
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold",
        colors[color]
      )}
    >
      {icon}
      {label}
    </div>
  )
}
