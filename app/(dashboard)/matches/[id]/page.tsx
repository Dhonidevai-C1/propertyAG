import React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Sparkles,
  MoreVertical,
  Building2,
  Users,
  MapPin,
  CheckCircle2,
  TriangleAlert,
  Phone,
  Mail,
  CheckCheck,
  X,
  Copy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getMatch } from "@/lib/actions/matches"
import { formatBudget, formatRelativeTime } from "@/lib/utils/format"
import { MatchDetailActions } from "@/components/matches/match-detail-actions"

interface Props {
  params: Promise<{ id: string }>
}

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params
  const match = await getMatch(id)

  if (!match) notFound()

  const client = match.client
  const property = match.property
  const breakdown = match.score_breakdown as any

  const scoreItems = [
    { label: "Budget match", points: breakdown?.budget ?? 0, max: 40 },
    { label: "Location match", points: breakdown?.location ?? 0, max: 20 },
    { label: "Property type", points: breakdown?.property_type ?? 0, max: 20 },
    { label: "Bedrooms", points: breakdown?.bedrooms ?? 0, max: 10 },
    { label: "Area (sq ft)", points: breakdown?.area ?? 0, max: 10 },
  ]

  const getBarColor = (pts: number, max: number) => {
    const pct = pts / max
    if (pct >= 1) return "bg-emerald-500"
    if (pct >= 0.5) return "bg-amber-400"
    return "bg-red-400"
  }

  const clientRequirements = [
    { label: "Looking for", value: client?.looking_for === 'buy' ? 'Buy' : client?.looking_for === 'rent' ? 'Rent' : '—' },
    { label: "Property type", value: client?.property_types?.join(', ') || '—' },
    { label: "Preferred locations", value: client?.preferred_locations?.join(', ') || '—' },
    { label: "Budget", value: client?.budget_min && client?.budget_max ? `${formatBudget(client.budget_min)} – ${formatBudget(client.budget_max)}` : '—' },
    { label: "Min bedrooms", value: client?.min_bedrooms ? `${client.min_bedrooms}+` : '—' },
    { label: "Min area", value: client?.min_area_sqft ? `${client.min_area_sqft.toLocaleString()} sq ft` : '—' },
    { label: "Furnishing", value: client?.furnishing_preference || '—' },
    { label: "Timeline", value: client?.possession_timeline || '—' },
  ]

  const propertySpecs = [
    { label: "Bedrooms", value: String(property?.bedrooms ?? '—') },
    { label: "Bathrooms", value: String(property?.bathrooms ?? '—') },
    { label: "Area", value: property?.area_sqft ? `${property.area_sqft.toLocaleString()} sq ft` : '—' },
    { label: "Floor", value: property?.floor_number && property?.total_floors ? `${property.floor_number} of ${property.total_floors}` : property?.floor_number || '—' },
    { label: "Furnishing", value: property?.furnishing?.replace('_', ' ') || '—' },
    { label: "Parking", value: property?.parking || '—' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <header className="space-y-4">
        <Link href="/matches" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to matches
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center bg-emerald-100 text-emerald-700 font-black text-xl px-5 py-2.5 rounded-full shadow-sm ring-4 ring-emerald-50">
              <Sparkles className="w-5 h-5 mr-2" />
              {match.score}% match
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">Status</h1>
              <Badge variant="outline" className="mt-1.5 border-slate-200 text-slate-600 font-bold px-3 py-0.5 rounded-lg capitalize">
                {match.status}
              </Badge>
            </div>
          </div>

          <MatchDetailActions matchId={match.id} currentStatus={match.status} />
        </div>

        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
          Matched {formatRelativeTime(match.matched_at)} • <span className="text-emerald-500">Matched by smart engine</span>
        </p>
      </header>

      {/* Score Breakdown */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-8 overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Match score breakdown</h3>

        <div className="space-y-6">
          {scoreItems.map((item, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <span className="text-xs font-bold text-slate-500 w-32 shrink-0">{item.label}</span>
              <div className="flex-1 h-2.5 rounded-full bg-slate-50 overflow-hidden ring-1 ring-slate-100/50">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000 delay-300", getBarColor(item.points, item.max))}
                  style={{ width: item.max > 0 ? `${(item.points / item.max) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-[10px] font-black text-slate-400 w-20 text-right uppercase tracking-tighter">
                {item.points} / {item.max} pts
              </span>
            </div>
          ))}

          <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
            <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Total score</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-600">{match.score}</span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
          </div>
        </div>
      </section>

      {/* Side-by-side panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 -translate-x-1/2" />

        {/* Left — Property */}
        <section className="bg-white rounded-3xl shadow-sm border border-emerald-100 flex flex-col h-full overflow-hidden group">
          <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Property</span>
            </div>
            <Link href={`/properties/${property?.id}`} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50">
              View property →
            </Link>
          </div>

          <div className="aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden">
            {property?.cover_image_url ? (
              <img src={property.cover_image_url} alt={property.title} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-16 h-16 text-slate-200" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
          </div>

          <div className="px-6 py-8 flex-1 space-y-8">
            <div className="space-y-2">
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {property?.price ? formatBudget(property.price) : '—'}
              </p>
              <h3 className="text-lg font-bold text-slate-700">{property?.title}</h3>
              <div className="flex items-center text-slate-400 font-bold text-xs uppercase tracking-tight">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {[property?.locality, property?.city].filter(Boolean).join(', ')}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-6">
              {propertySpecs.map((spec, i) => (
                <div key={i} className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{spec.label}</span>
                  <p className="text-sm font-bold text-slate-700 capitalize">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right — Client */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
          <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client</span>
            </div>
            <Link href={`/clients/${client?.id}`} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50">
              View client →
            </Link>
          </div>

          <div className="px-6 py-8 flex-1 space-y-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-2xl border-none shadow-lg ring-4 ring-purple-50">
                <AvatarFallback className="bg-purple-100 text-purple-700 text-xl font-black">
                  {client?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{client?.full_name}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500">
                    {client?.looking_for === 'buy' ? 'Looking to buy' : 'Looking to rent'}
                  </span>
                  {client?.source && (
                    <Badge className="bg-slate-100 text-slate-500 border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-sm capitalize">
                      {client.source.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1 px-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Requirements</h3>
              <div className="grid gap-px bg-slate-50 border border-slate-50 rounded-2xl overflow-hidden shadow-sm">
                {clientRequirements.map((req, i) => (
                  <div key={i} className="flex justify-between items-center bg-white px-5 py-3.5 group hover:bg-slate-50/50 transition-colors">
                    <span className="text-xs font-bold text-slate-400 capitalize">{req.label}</span>
                    <span className="text-xs font-bold text-slate-700 text-right max-w-[180px] capitalize">{req.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {(client?.phone || client?.email) && (
              <div className="pt-8 border-t border-slate-50 space-y-5">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {client?.phone && (
                    <a href={`tel:${client.phone}`} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-white transition-all group">
                      <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-emerald-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{client.phone}</span>
                    </a>
                  )}
                  {client?.email && (
                    <a href={`mailto:${client.email}`} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-white transition-all group">
                      <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 truncate">{client.email}</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Action Footer */}
      <footer className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-slate-200" />
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Suggested</h4>
          <p className="text-sm font-bold text-slate-700 tracking-tight">What would you like to do next?</p>
        </div>

        <MatchDetailActions matchId={match.id} currentStatus={match.status} footer />
      </footer>
    </div>
  )
}
