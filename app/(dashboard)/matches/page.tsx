import React from "react"
import { Sparkles } from "lucide-react"
import { getMatches } from "@/lib/actions/matches"
import { MatchList } from "@/components/matches/match-list"

export default async function SmartMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ minScore?: string; status?: string; search?: string; sortBy?: string; page?: string }>
}) {
  const params = await searchParams
  const filters = {
    minScore: params.minScore ? parseInt(params.minScore) : 40, // Default to 40% after fuzzy logic update
    status: params.status,
    search: params.search,
    sortBy: params.sortBy,
    page: params.page ? parseInt(params.page) : 1,
  }

  const result = await getMatches(filters)

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Smart matches</h1>
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/20" />
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Properties matched to client requirements by the matching engine
          </p>
        </div>
      </div>

      <MatchList 
        initialMatches={result.data} 
        initialFilters={filters} 
        totalCount={result.count ?? 0}
        totalPages={result.totalPages ?? 0}
      />
    </div>
  )
}
