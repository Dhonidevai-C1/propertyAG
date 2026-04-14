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

  const isLandOrCommercial = ['plot', 'farmer_land', 'commercial', 'shop', 'office', 'showroom', 'commercial_land'].includes(property?.property_type || '')
  const bhkMax = isLandOrCommercial ? 0 : 15
  const areaMax = isLandOrCommercial ? 20 : 5

  const comparisonRows = [
    {
      label: "Property Type",
      client: client?.property_types?.join(', ') || 'Any',
      property: property?.property_type || '—',
      isMatch: breakdown?.property_type >= 10,
      points: breakdown?.property_type,
      max: 40
    },
    {
      label: "Listing Type",
      client: client?.looking_for === 'buy' ? 'Buy' : 'Rent',
      property: property?.listing_type === 'sale' ? 'Sale' : 'Rent',
      isMatch: (client?.looking_for === 'buy' && property?.listing_type === 'sale') || (client?.looking_for === 'rent' && property?.listing_type === 'rent'),
      points: null,
      max: null
    },
    {
      label: "Budget / Price",
      client: client?.budget_max ? `Max ${formatBudget(client.budget_max)}` : 'No Limit',
      property: property?.price ? formatBudget(property.price) : '—',
      isMatch: breakdown?.budget >= 15,
      points: breakdown?.budget,
      max: 30
    },
    {
      label: "BHK / Config",
      client: client?.preferred_bhks?.length ? `${client.preferred_bhks.join(', ')} BHK` : (client?.min_bedrooms ? `${client.min_bedrooms}+ BHK` : 'Any'),
      property: property?.bedrooms ? `${property.bedrooms} BHK` : '—',
      isMatch: breakdown?.bedrooms >= (isLandOrCommercial ? 0 : 10),
      points: breakdown?.bedrooms,
      max: bhkMax
    },
    {
      label: "Area (Sq Ft)",
      client: client?.min_area_sqft ? `${client.min_area_sqft.toLocaleString()}+` : 'Any',
      property: property?.area_sqft ? property.area_sqft.toLocaleString() : '—',
      isMatch: breakdown?.area >= (isLandOrCommercial ? 10 : 2),
      points: breakdown?.area,
      max: areaMax
    },
    {
      label: "Location",
      client: client?.preferred_locations?.length ? client.preferred_locations.join(', ') : 'Any',
      property: `${property?.locality || ''}, ${property?.city || ''}`,
      isMatch: breakdown?.location >= 10,
      points: breakdown?.location,
      max: 10
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 sm:px-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link href="/matches" className="inline-flex items-center text-xs font-black text-slate-400 uppercase tracking-[0.2em] hover:text-emerald-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to matches
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Match Intelligence</h1>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-3 py-1 rounded-full animate-pulse shadow-sm">
                Smart Match
              </Badge>
            </div>
            <p className="text-slate-500 font-medium tracking-tight">Detailed side-by-side comparison analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex flex-col items-end px-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Overall Compatibility</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-emerald-600">{match.score}%</span>
              <span className="text-xs font-bold text-slate-300">Match</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-100" />
          <MatchDetailActions matchId={match.id} currentStatus={match.status} />
        </div>
      </header>

      {/* Main Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 ring-1 ring-slate-100 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border-8 border-white">
        
        {/* Comparison Table (Left 8 cols) */}
        <div className="lg:col-span-8 p-6 md:p-10 space-y-10">
          <div className="flex items-center justify-between border-b border-slate-50 pb-6">
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-emerald-500" />
              Side-by-Side Comparison
            </h2>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              Score: {match.score} / 100
            </span>
          </div>

          <div className="space-y-1 relative">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50/50 rounded-xl mb-3">
              <div className="col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Feature</div>
              <div className="col-span-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Demands</div>
              <div className="col-span-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Offers</div>
              <div className="col-span-1 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Match</div>
            </div>

            {/* Rows */}
            {comparisonRows.map((row, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 items-center px-4 py-5 rounded-2xl hover:bg-slate-50/50 transition-all group relative border border-transparent hover:border-slate-100">
                <div className="col-span-3">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-tight pl-2 flex flex-col">
                    {row.label}
                    {row.max && (
                      <span className="text-[9px] text-slate-300 font-bold">({row.points}/{row.max} pts)</span>
                    )}
                  </span>
                </div>
                <div className="col-span-4">
                  <span className="text-sm font-bold text-slate-600 capitalize break-words">{row.client}</span>
                </div>
                <div className="col-span-4">
                  <span className="text-sm font-bold text-slate-900 capitalize break-words">{row.property}</span>
                </div>
                <div className="col-span-1 flex justify-center">
                  {row.max === 0 ? (
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 italic text-[10px] text-slate-300">
                      N/A
                    </div>
                  ) : row.isMatch ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm shadow-emerald-100/50">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center border border-red-100 shadow-sm shadow-red-100/50">
                      <X className="w-4 h-4 text-red-400" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats / Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10 border-t border-slate-50">
             <div className="p-5 rounded-[1.5rem] bg-emerald-50/30 border border-emerald-100/50 group hover:bg-emerald-50 transition-colors">
               <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Confidence Rating</h4>
               <p className="text-lg font-black text-emerald-800 tracking-tight">
                 {match.score >= 80 ? 'High Confidence' : match.score >= 50 ? 'Strong Potential' : 'Review Required'}
               </p>
               <p className="text-xs font-medium text-emerald-700/70 mt-1 italic">Based on {comparisonRows.length} weighted parameters</p>
             </div>
             <div className="p-5 rounded-[1.5rem] bg-indigo-50/30 border border-indigo-100/50 group hover:bg-indigo-50 transition-colors">
               <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Smart Engine Note</h4>
               <p className="text-sm font-bold text-indigo-800 leading-snug">
                 Matches {property?.property_type} in {property?.city} with {client?.full_name}'s {client?.looking_for} requirements.
               </p>
             </div>
          </div>
        </div>

        {/* Profile Summaries (Right 4 cols) */}
        <div className="lg:col-span-4 bg-slate-50/50 border-l border-slate-100 flex flex-col divide-y divide-slate-100">
          
          {/* Client Summary */}
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 rounded-2xl shadow-md ring-4 ring-white border-2 border-indigo-100">
                <AvatarFallback className="bg-indigo-500 text-white text-lg font-black">
                  {client?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-slate-900 tracking-tight truncate">{client?.full_name}</h3>
                <Link href={`/clients/${client?.id}`} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                  View full profile
                  <ArrowLeft className="w-3 h-3 rotate-180" />
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-xs">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                <p className="text-[11px] font-bold text-slate-700 truncate">{client?.email || 'N/A'}</p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-xs">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                <p className="text-[11px] font-bold text-slate-700 truncate">{client?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Property Summary */}
          <div className="p-8 flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl ring-4 ring-white border border-slate-200 relative group">
                {property?.cover_image_url ? (
                  <img src={property.cover_image_url} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-slate-200" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-slate-900/80 backdrop-blur-md text-white border-none font-black text-[9px] uppercase px-3 py-1 rounded-full">
                    {property?.status || 'Available'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">{property?.price ? formatBudget(property.price) : '—'}</h3>
                  <Badge variant="ghost" className="bg-blue-50 text-blue-600 font-bold rounded-lg text-xs pointer-events-none">
                    {property?.property_type}
                  </Badge>
                </div>
                <p className="text-sm font-bold text-slate-600 leading-snug line-clamp-2">{property?.title}</p>
                <div className="flex items-center text-slate-400 font-bold text-[11px] uppercase tracking-tight">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-300" />
                  {property?.locality}, {property?.city}
                </div>
              </div>
            </div>

            <Link href={`/properties/${property?.id}`} className="mt-8">
              <Button variant="outline" className="w-full h-12 rounded-2xl border-2 border-slate-200 font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all gap-2">
                Detailed Spec Sheet
                <Copy className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl shadow-slate-900/20 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-1000" />
        <div className="relative space-y-2 text-center md:text-left">
          <h4 className="text-xl font-black tracking-tight">Ready to close this deal?</h4>
          <p className="text-slate-400 font-medium text-sm">Suggested actions based on {match.status} status</p>
        </div>
        
        <div className="relative">
          <MatchDetailActions matchId={match.id} currentStatus={match.status} footer />
        </div>
      </footer>
    </div>
  )
}
