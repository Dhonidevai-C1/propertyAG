import React from "react"
import Link from "next/link"
import {
  Building2,
  Users,
  Sparkles,
  Clock,
  TrendingUp,
  UserPlus,
  ArrowRight,
  Bed,
  Bath,
  MapPin,
  IndianRupee,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getDashboardStats, getRecentNotifications } from "@/lib/actions/matches"
import { getRecentActivities, Activity } from "@/lib/actions/activities"
import { getProperties } from "@/lib/actions/properties"
import { requireProfile } from "@/lib/auth/get-session"
import { Notification } from "@/lib/types/database"
import { formatRelativeTime, formatPrice } from "@/lib/utils/format"
import { getTodaysFollowUps } from "@/lib/actions/clients"
import { ensureDailyFollowUpNotification } from "@/lib/actions/matches"
import { FollowUpWidget } from "@/components/dashboard/follow-up-widget"

function activityIcon(type: string) {
  const map: Record<string, typeof Building2> = {
    upload: UserPlus,
    update: Building2,
    delete: Clock,
    match: Sparkles,
  }
  return map[type] ?? Clock
}

function activityColor(type: string) {
  const map: Record<string, string> = {
    upload: "bg-emerald-100 text-emerald-600",
    update: "bg-blue-100 text-blue-600",
    delete: "bg-red-100 text-red-600",
    match: "bg-amber-100 text-amber-600",
  }
  return map[type] ?? "bg-slate-100 text-slate-600"
}

function notificationIcon(type: string) {
  const map: Record<string, typeof Building2> = {
    new_client: UserPlus,
    match_found: Sparkles,
    property_update: Building2,
    team_member: Users,
    system: Clock,
  }
  return map[type] ?? Clock
}

function notificationColor(type: string) {
  const map: Record<string, string> = {
    new_client: "bg-purple-100 text-purple-600",
    match_found: "bg-amber-100 text-amber-600",
    property_update: "bg-blue-100 text-blue-600",
    team_member: "bg-emerald-100 text-emerald-600",
    system: "bg-slate-100 text-slate-600",
  }
  return map[type] ?? "bg-slate-100 text-slate-600"
}

// Quick action button styles — plain strings, no client-only function call
const quickActions = [
  {
    label: "Add property",
    icon: Building2,
    href: "/properties/new",
    cls: "bg-emerald-500 hover:bg-emerald-600 text-white",
  },
  {
    label: "Add client",
    icon: UserPlus,
    href: "/clients/new",
    cls: "bg-slate-900 hover:bg-slate-800 text-white",
  },
  {
    label: "View matches",
    icon: Sparkles,
    href: "/matches",
    cls: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200",
  },
]

export default async function DashboardPage() {
  const [profile, stats, notifications, recentActivities, recentProperties, followUpsRes] = await Promise.all([
    requireProfile(),
    getDashboardStats(),
    getRecentNotifications(4),
    getRecentActivities(6),
    getProperties({ limit: 3 } as any),
    getTodaysFollowUps()
  ])

  const followUps = followUpsRes && Array.isArray(followUpsRes) ? followUpsRes : (followUpsRes as any)?.data || []

  if (followUps.length > 0) {
    // Run asynchronously without blocking the render
    ensureDailyFollowUpNotification(followUps.length).catch(console.error)
  }

  const statCards = [
    {
      label: "Properties",
      value: stats.properties,
      icon: Building2,
      sub: "total listings",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active clients",
      value: stats.clients,
      icon: Users,
      sub: "seeking property",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Matches",
      value: stats.matchesThisWeek,
      icon: Sparkles,
      sub: "this week",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Follow-ups due",
      value: followUps.length,
      icon: Clock,
      sub: "need attention",
      color: followUps.length > 0 ? "text-red-500" : "text-emerald-600",
      bg: followUps.length > 0 ? "bg-red-50" : "bg-emerald-50",
    },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const firstName = profile.full_name.split(" ")[0]

  return (
    <div className="space-y-8 pb-10">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here's what's happening with your agency today.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(stat => (
          <Card key={stat.label} className="border-slate-100/60 bg-green-50 backdrop-blur-xl shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden relative group">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-slate-200 to-transparent group-hover:via-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-sm font-semibold text-slate-700 mt-2">{stat.label}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent activity</h2>
            <Link href="/notifications" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
              View all →
            </Link>
          </div>
          <Card className="border-slate-100/60 bg-white/60 backdrop-blur-xl shadow-sm rounded-3xl overflow-hidden">
            {recentActivities.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentActivities.map(activity => {
                  const Icon = activityIcon(activity.action_type)
                  const href =
                    (activity.action_type === 'delete') ? null :
                      activity.entity_type === "client" ? `/clients/${activity.entity_id}` :
                        activity.entity_type === "property" ? `/properties/${activity.entity_id}` :
                          activity.entity_type === "match" ? `/matches/${activity.entity_id}` :
                            "/dashboard"

                  const actionText =
                    activity.action_type === 'upload' ? 'added new' :
                      activity.action_type === 'update' ? 'updated' :
                        activity.action_type === 'delete' ? 'removed' : 'found match for'

                  const content = (
                    <div className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-all duration-300 group">
                      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", activityColor(activity.action_type))}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          <span className="font-bold text-slate-900 drop-shadow-sm">{activity.profiles?.full_name}</span>
                          {" "}<span className="text-slate-500">{actionText}</span>{" "}
                          <span className="font-bold text-slate-800">
                            {activity.metadata?.title || activity.entity_type}
                          </span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(activity.created_at)}
                        </p>
                      </div>
                      {href && <ArrowRight className="w-4 h-4 text-emerald-400 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 shrink-0" />}
                    </div>
                  )

                  if (!href) return <div key={activity.id}>{content}</div>

                  return (
                    <Link key={activity.id} href={href} className="block">
                      {content}
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="p-16 text-center">
                <Clock className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 text-sm font-bold">No activity yet</p>
                <p className="text-slate-400 text-xs mt-1">Activity from your team will appear here</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Follow Ups & Quick Actions */}
        <div className="space-y-8">
          <div className="h-[300px]">
            <FollowUpWidget followUps={followUps} />
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">Quick actions</h2>
            <div className="flex flex-col gap-3">
              {quickActions.map(action => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={cn(
                    "flex items-center gap-3 h-14 px-4 rounded-xl text-sm font-bold transition-all active:scale-[0.98] shadow-sm",
                    action.cls
                  )}
                >
                  <action.icon className="w-5 h-5 shrink-0" />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Properties */}
      {recentProperties.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent properties</h2>
            <Link href="/properties" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProperties.map(property => (
              <Link key={property.id} href={`/properties/${property.id}`}>
                <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group cursor-pointer">
                  <div className="aspect-video w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {property.cover_image_url ? (
                      <img src={property.cover_image_url} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Building2 className="w-10 h-10 text-slate-200" />
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors text-sm truncate">
                          {property.title}
                        </h3>
                        <span className="text-sm font-black text-emerald-600 shrink-0">
                          {formatPrice(property.price)}
                        </span>
                      </div>
                      <div className="flex items-center text-slate-400 text-xs mt-1">
                        <MapPin className="w-3 h-3 mr-1 shrink-0" />
                        {[property.locality, property.city].filter(Boolean).join(", ")}
                      </div>
                    </div>
                    <Separator className="bg-slate-50" />
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-slate-300" />
                        {property.bedrooms} Bed
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-slate-300" />
                        {property.bathrooms} Bath
                      </div>
                      <Badge className={cn(
                        "ml-auto text-[10px] font-bold border-none capitalize",
                        property.status === "available" ? "bg-emerald-50 text-emerald-600" :
                          property.status === "sold" ? "bg-red-50 text-red-600" :
                            "bg-slate-50 text-slate-500"
                      )}>
                        {property.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
