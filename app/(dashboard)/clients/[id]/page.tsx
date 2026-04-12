import React from "react"
import Link from "next/link"
import {
  ChevronLeft,
  Pencil,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  Sparkles,
  Building2,
  User,
  Plus,
  MapPin,
  IndianRupee,
  BedDouble,
  Ruler,
  Sofa,
  Clock,
  Tag,
  UserCheck,
  AlertCircle,
  Home,
  Handshake,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getClient } from "@/lib/actions/clients"
import { getMatchesForClient } from "@/lib/actions/matches"
import { notFound } from "next/navigation"
import { formatRelativeTime, formatBudgetRange } from "@/lib/utils/format"
import { ClientActionsDropdown } from "@/components/clients/client-actions-dropdown"
import { ClientRunMatchButton } from "@/components/clients/client-run-match-button"
import { ShownPropertiesSection } from "@/components/clients/shown-properties-section"

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [client, clientMatches] = await Promise.all([
    getClient(id),
    getMatchesForClient(id),
  ])
  if (!client) notFound()

  const initials = client.full_name?.substring(0, 2).toUpperCase() || "C"

  const priorityConfig = {
    high: { label: "High Priority", cls: "bg-red-100 text-red-700", dot: "bg-red-500" },
    medium: { label: "Medium Priority", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
    low: { label: "Low Priority", cls: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  }
  const priority = priorityConfig[(client.priority as keyof typeof priorityConfig) || "medium"]

  const statusConfig = {
    active: "bg-emerald-100 text-emerald-700",
    matched: "bg-amber-100 text-amber-700",
    closed: "bg-slate-100 text-slate-600",
  }
  const statusClass = statusConfig[(client.status as keyof typeof statusConfig)] || "bg-slate-100 text-slate-600"

  // preferred_bhks — the column exists as int4[]
  const preferredBhks: number[] = (client as any).preferred_bhks || []

  const isTodayOrPast = client.follow_up_date && new Date(client.follow_up_date) <= new Date()

  const sourcedBrokerRelation = (client as any).broker_relations?.find((r: any) => r.relation_type === 'sourced')
  const sourcedBroker = sourcedBrokerRelation?.broker

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link
          href="/clients"
          className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors group w-fit"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          Back to Leads
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 text-lg font-bold rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 text-purple-700 shrink-0">
              <AvatarFallback className="rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 text-purple-700 font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{client.full_name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn("border-none rounded-full px-3 py-0.5 text-xs font-bold capitalize", statusClass)}>
                  {client.status}
                </Badge>
                <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full", priority.cls)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", priority.dot)} />
                  {priority.label}
                </span>
                {client.source && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                    <Tag className="w-3 h-3" />
                    {client.source}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/clients/${id}/edit`}>
              <button className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:border-slate-300 hover:bg-slate-50 transition-all">
                <Pencil className="w-4 h-4" />
                Edit
              </button>
            </Link>
            <ClientActionsDropdown clientId={client.id} clientName={client.full_name} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Column ─────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Contact & Personal Info */}
          <SectionCard title="Contact information" icon={<User className="w-4 h-4 text-blue-500" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow icon={<Phone className="w-4 h-4 text-emerald-500" />} label="Phone">
                <a href={`tel:${client.phone}`} className="font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                  {client.phone}
                </a>
              </InfoRow>
              <InfoRow icon={<Mail className="w-4 h-4 text-blue-500" />} label="Email">
                {client.email ? (
                  <a href={`mailto:${client.email}`} className="font-bold text-slate-900 hover:text-emerald-600 transition-colors truncate block">
                    {client.email}
                  </a>
                ) : <span className="text-slate-400 font-medium italic">Not provided</span>}
              </InfoRow>
              <InfoRow icon={<Tag className="w-4 h-4 text-violet-500" />} label="Lead source">
                <span className="font-bold text-slate-900">{client.source || "Unknown"}</span>
              </InfoRow>
              <InfoRow icon={<UserCheck className="w-4 h-4 text-slate-500" />} label="Assigned agent">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600">
                      {client.assignee?.full_name?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-bold text-slate-900">{client.assignee?.full_name || "Unassigned"}</span>
                </div>
              </InfoRow>
              <InfoRow icon={<Tag className="w-4 h-4 text-emerald-500" />} label="Contact Type">
                <span className="font-bold capitalize text-emerald-600">{client.contact_type || "Client"}</span>
              </InfoRow>
              <InfoRow icon={<CalendarIcon className="w-4 h-4 text-slate-400" />} label="Added">
                <span className="font-semibold text-slate-700">{formatRelativeTime(client.created_at)}</span>
              </InfoRow>
              <InfoRow icon={<CalendarIcon className="w-4 h-4 text-slate-400" />} label="Last updated">
                <span className="font-semibold text-slate-700">{formatRelativeTime(client.updated_at)}</span>
              </InfoRow>
            </div>

            {client.notes && (
              <div className="mt-5 pt-5 border-t border-slate-50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </SectionCard>

          {/* Broker Source Info */}
          {sourcedBroker && (
            <Card className="bg-indigo-50 border-none rounded-[1.5rem] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
                <Handshake className="w-7 h-7 text-indigo-600" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Sourced from Broker</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                  <h3 className="text-xl font-bold text-slate-900">{sourcedBroker.full_name}</h3>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <Phone className="w-3.5 h-3.5" />
                    {sourcedBroker.phones?.[0] || "No phone"}
                  </div>
                </div>
              </div>
              <Link href={`/brokers/${sourcedBroker.id}`}>
                <Button className="h-11 px-4 cursor-pointer rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2">
                  View Broker
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </Card>
          )}

          {/* Property Requirements */}
          <SectionCard title="Property requirements" icon={<Sparkles className="w-4 h-4 text-amber-500" />}>
            {/* Intent row */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-sm text-lg shrink-0">
                {client.looking_for === "rent" ? "🔑" : "🏠"}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Intent</p>
                <p className="text-sm font-bold text-slate-900 capitalize">{client.looking_for === "rent" ? "Renting" : "Buying"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <ReqCard icon={<Home className="w-4 h-4 text-blue-500" />} label="Property types">
                {client.property_types?.length ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {client.property_types.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-bold capitalize">
                        {t.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                ) : <span className="text-sm font-bold text-slate-700 mt-1">Any</span>}
              </ReqCard>

              <ReqCard icon={<MapPin className="w-4 h-4 text-emerald-500" />} label="Preferred locations">
                {client.preferred_locations?.length ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {client.preferred_locations.map(l => (
                      <span key={l} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[11px] font-bold">
                        {l}
                      </span>
                    ))}
                  </div>
                ) : <span className="text-sm font-bold text-slate-700 mt-1">Any</span>}
              </ReqCard>

              <ReqCard icon={<IndianRupee className="w-4 h-4 text-emerald-500" />} label="Budget">
                <span className="text-sm font-bold text-slate-900 mt-1">
                  {formatBudgetRange(client.budget_min, client.budget_max)}
                </span>
              </ReqCard>

              <ReqCard icon={<BedDouble className="w-4 h-4 text-violet-500" />} label="Preferred BHK">
                {preferredBhks.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {preferredBhks.sort((a, b) => a - b).map(bhk => (
                      <span key={bhk} className="w-8 h-7 bg-violet-50 text-violet-700 rounded-lg text-[11px] font-bold flex items-center justify-center">
                        {bhk === 5 ? "5+" : bhk}
                      </span>
                    ))}
                    <span className="text-[11px] text-slate-400 font-medium self-center">BHK</span>
                  </div>
                ) : <span className="text-sm font-bold text-slate-700 mt-1">Any</span>}
              </ReqCard>

              <ReqCard icon={<BedDouble className="w-4 h-4 text-slate-400" />} label="Min bedrooms">
                <span className="text-sm font-bold text-slate-900 mt-1">
                  {!client.min_bedrooms || client.min_bedrooms === 0 ? "Any" : client.min_bedrooms === 5 ? "5+" : `${client.min_bedrooms}+`}
                </span>
              </ReqCard>

              <ReqCard icon={<Ruler className="w-4 h-4 text-slate-400" />} label="Min area">
                <span className="text-sm font-bold text-slate-900 mt-1">
                  {client.min_area_sqft ? `${client.min_area_sqft.toLocaleString()} ${(client.min_area_unit || 'sqft').replace('sq', 'sq. ')}` : "Any"}
                </span>
              </ReqCard>

              <ReqCard icon={<Sofa className="w-4 h-4 text-slate-400" />} label="Furnishing">
                <span className="text-sm font-bold text-slate-900 mt-1">
                  {client.furnishing_preference || "Any"}
                </span>
              </ReqCard>

              <ReqCard icon={<Clock className="w-4 h-4 text-slate-400" />} label="Timeline">
                <span className="text-sm font-bold text-slate-900 mt-1">
                  {client.possession_timeline || "Flexible"}
                </span>
              </ReqCard>
            </div>


          </SectionCard>

          {/* Shown Properties History */}
          <ShownPropertiesSection clientId={client.id} />

        </div>

        {/* ── Right Column ──────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Follow-up */}
          <SectionCard title="Follow-up" icon={<CalendarIcon className="w-4 h-4 text-violet-500" />}>
            {client.follow_up_date ? (
              <div className={cn(
                "flex items-start gap-3 p-3 rounded-xl border",
                isTodayOrPast ? "bg-red-50 border-red-100" : "bg-violet-50 border-violet-100"
              )}>
                <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", isTodayOrPast ? "bg-red-100" : "bg-violet-100")}>
                  {isTodayOrPast
                    ? <AlertCircle className="w-4 h-4 text-red-600" />
                    : <CalendarIcon className="w-4 h-4 text-violet-600" />
                  }
                </div>
                <div>
                  <p className={cn("text-[11px] font-bold uppercase tracking-wider", isTodayOrPast ? "text-red-500" : "text-violet-500")}>
                    {isTodayOrPast ? "Overdue!" : "Scheduled"}
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {new Date(client.follow_up_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-400 font-medium italic">No follow-up scheduled</p>
                <Link href={`/clients/${id}/edit`}>
                  <button className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 text-sm font-bold hover:border-emerald-300 hover:text-emerald-600 transition-all">
                    <Plus className="w-4 h-4" />
                    Schedule one
                  </button>
                </Link>
              </div>
            )}
          </SectionCard>
          {/* Quick Actions */}
          <SectionCard title="Quick actions" noPadding>
            <div className="flex flex-col p-2">
              <Link href={`/clients/${id}/edit`} className="w-full">
                <button className="w-full flex items-center gap-3 h-11 px-4 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors">
                  <Pencil className="w-4 h-4" />
                  Edit requirements
                </button>
              </Link>
              <ClientRunMatchButton clientId={id} />
              <Link href={`tel:${client.phone}`} className="w-full">
                <button className="w-full flex items-center gap-3 h-11 px-4 text-emerald-600 font-bold text-sm rounded-xl hover:bg-emerald-50 transition-colors">
                  <Phone className="w-4 h-4" />
                  Call client
                </button>
              </Link>
            </div>
          </SectionCard>

          {/* Matched Properties */}
          <SectionCard
            title="Matched properties"
            icon={<Sparkles className="w-4 h-4 text-amber-500" />}
            badge={String(clientMatches.length)}
          >
            {clientMatches.length > 0 ? (
              <div className="space-y-3">
                {clientMatches.slice(0, 5).map(match => (
                  <Link key={match.id} href={`/matches/${match.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-slate-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{match.property?.title}</p>
                        <p className="text-[10px] text-slate-500">{[match.property?.locality, match.property?.city].filter(Boolean).join(', ')}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                match.score >= 80 ? "bg-emerald-500" : match.score >= 60 ? "bg-amber-400" : "bg-slate-400"
                              )}
                              style={{ width: `${match.score}%` }}
                            />
                          </div>
                          <span className={cn(
                            "text-[10px] font-black shrink-0",
                            match.score >= 80 ? "text-emerald-600" : match.score >= 60 ? "text-amber-600" : "text-slate-500"
                          )}>{match.score}%</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {clientMatches.length > 5 && (
                  <Link href={`/matches?search=${encodeURIComponent(client.full_name)}`}>
                    <p className="text-xs font-bold text-emerald-600 text-center pt-1 hover:underline">
                      View all {clientMatches.length} matches →
                    </p>
                  </Link>
                )}
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Building2 className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-700">No matches yet</p>
                <p className="text-xs text-slate-400 font-medium mt-1 max-w-[180px]">Run the smart match engine to find properties</p>
              </div>
            )}
          </SectionCard>



        </div>
      </div>
    </div>
  )
}

function SectionCard({ title, icon, children, badge, noPadding }: {
  title?: string
  icon?: React.ReactNode
  children: React.ReactNode
  badge?: string
  noPadding?: boolean
}) {
  return (
    <Card className="border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden">
      {title && (
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">{icon}</div>}
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
          </div>
          {badge !== undefined && (
            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[10px] font-bold">{badge}</span>
          )}
        </div>
      )}
      <div className={cn(!noPadding && "p-5")}>
        {children}
      </div>
    </Card>
  )
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="space-y-0.5 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}

function ReqCard({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">{label}</p>
      </div>
      {children}
    </div>
  )
}
