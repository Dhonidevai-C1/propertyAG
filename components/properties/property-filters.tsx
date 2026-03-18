import React, { useCallback, useMemo, useTransition, useState, useEffect } from "react"
import { Search, LayoutGrid, List, Loader2, X } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useDebouncedCallback } from "use-debounce"

interface PropertyFiltersProps {
  viewMode: "grid" | "list"
  setViewMode: (mode: "grid" | "list") => void
  onPending?: (isPending: boolean) => void
}

export function PropertyFilters({
  viewMode,
  setViewMode,
  onPending,
}: PropertyFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentFilters = useMemo(() => ({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || "Types",
    status: searchParams.get('status') || "Status",
    bedrooms: searchParams.get('bedrooms') || "BHK",
    price_max: searchParams.get('price_max') || "Price",
  }), [searchParams])

  const [searchValue, setSearchValue] = useState(currentFilters.search)

  useEffect(() => {
    setSearchValue(currentFilters.search)
  }, [currentFilters.search])

  const createQueryString = useCallback(
    (params: Record<string, string | null | undefined>) => {
      const newParams = new URLSearchParams(searchParams.toString())

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === 'all' || value === '' || value === undefined) {
          newParams.delete(key)
        } else {
          newParams.set(key, value)
        }
      })

      return newParams.toString()
    },
    [searchParams]
  )

  const handleFilterChange = (key: string, value: string) => {
    const query = createQueryString({ [key]: value })
    onPending?.(true)
    startTransition(() => {
      router.push(`${pathname}?${query}`, { scroll: false })
      onPending?.(false)
    })
  }

  const debouncedSearch = useDebouncedCallback((value: string) => {
    const query = createQueryString({ search: value })
    onPending?.(true)
    startTransition(() => {
      router.push(`${pathname}?${query}`, { scroll: false })
      onPending?.(false)
    })
  }, 300)

  const onReset = () => {
    onPending?.(true)
    startTransition(() => {
      router.push(pathname, { scroll: false })
      onPending?.(false)
    })
  }

  const hasActiveFilters = searchParams.toString().length > 0

  return (
    <Card className="border-none shadow-sm md:rounded-xl p-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value)
              debouncedSearch(e.target.value)
            }}
            placeholder="Search tasks, properties..."
            className="pl-9 pr-9 bg-slate-50 border-none h-11 text-sm focus-visible:ring-emerald-500"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-600"
              onClick={() => {
                setSearchValue("")
                debouncedSearch("")
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-9 w-9 p-0 rounded-md transition-all",
              viewMode === "grid" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-9 w-9 p-0 rounded-md transition-all",
              viewMode === "list" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar pb-1">
        <Select value={currentFilters.type} onValueChange={(v) => handleFilterChange("type", v || "all")}>
          <SelectTrigger className="w-auto min-w-[120px] h-9 bg-white border-slate-200 text-slate-600 text-[11px] font-medium rounded-lg focus:ring-emerald-500 disabled:opacity-50" disabled={isPending}>
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="independent_house">Independent House</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="plot">Plot</SelectItem>
            <SelectItem value="farmhouse">Farmhouse</SelectItem>
            <SelectItem value="penthouse">Penthouse</SelectItem>
          </SelectContent>
        </Select>

        <Select value={currentFilters.status} onValueChange={(v) => handleFilterChange("status", v || "all")}>
          <SelectTrigger className="w-auto min-w-[120px] h-9 bg-white border-slate-200 text-slate-600 text-[11px] font-medium rounded-lg focus:ring-emerald-500 disabled:opacity-50" disabled={isPending}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="rented">Rented</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
          </SelectContent>
        </Select>

        <Select value={currentFilters.bedrooms} onValueChange={(v) => handleFilterChange("bedrooms", v || "all")}>
          <SelectTrigger className="w-auto min-w-[100px] h-9 bg-white border-slate-200 text-slate-600 text-[11px] font-medium rounded-lg focus:ring-emerald-500 disabled:opacity-50" disabled={isPending}>
            <SelectValue placeholder="BHK" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All BHKs</SelectItem>
            <SelectItem value="1">1 BHK</SelectItem>
            <SelectItem value="2">2 BHK</SelectItem>
            <SelectItem value="3">3 BHK</SelectItem>
            <SelectItem value="4">4 BHK</SelectItem>
            <SelectItem value="5">5+ BHK</SelectItem>
          </SelectContent>
        </Select>

        <Select value={currentFilters.price_max} onValueChange={(v) => handleFilterChange("price_max", v || "all")}>
          <SelectTrigger className="w-auto min-w-[140px] h-9 bg-white border-slate-200 text-slate-600 text-[11px] font-medium rounded-lg focus:ring-emerald-500 disabled:opacity-50" disabled={isPending}>
            <SelectValue placeholder="Budget" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="5000000">Under ₹50L</SelectItem>
            <SelectItem value="10000000">Under ₹1Cr</SelectItem>
            <SelectItem value="20000000">Under ₹2Cr</SelectItem>
            <SelectItem value="50000000">Under ₹5Cr</SelectItem>
          </SelectContent>
        </Select>

        {(hasActiveFilters || isPending) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={isPending}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs h-8 px-2 flex items-center gap-1.5"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Reset filters
          </Button>
        )}
      </div>
    </Card>
  )
}

