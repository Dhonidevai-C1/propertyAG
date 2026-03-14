'use client'

import React from "react"
import Link from "next/link"
import { 
  Building2, 
  Users, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  PencilLine, 
  UserPlus, 
  ArrowRight,
  Bed,
  Bath,
  MapPin
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const stats = [
  {
    label: "Total properties",
    value: "48",
    icon: Building2,
    trend: "+3 this month",
    trendIcon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    label: "Active clients",
    value: "31",
    icon: Users,
    trend: "+7 this month",
    trendIcon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    label: "Matches found",
    value: "12",
    icon: Sparkles,
    trend: "this week",
    trendIcon: Sparkles,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    label: "Pending follow-ups",
    value: "5",
    icon: Clock,
    trend: "need attention",
    trendIcon: Clock,
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
]

const activities = [
  {
    type: "client",
    content: "New client added: Priya Sharma",
    time: "2 hours ago",
    icon: Users,
    color: "bg-purple-100 text-purple-600",
  },
  {
    type: "property",
    content: "Property listed: 3BHK Bani Park",
    time: "4 hours ago",
    icon: Building2,
    color: "bg-blue-100 text-blue-600",
  },
  {
    type: "match",
    content: "Match found: Sharma ↔ Bani Park",
    time: "6 hours ago",
    icon: Sparkles,
    color: "bg-amber-100 text-amber-600",
  },
  {
    type: "update",
    content: "Property updated: 2BHK Vaishali Nagar",
    time: "Yesterday",
    icon: PencilLine,
    color: "bg-slate-100 text-slate-600",
  },
  {
    type: "client",
    content: "New client added: Ramesh Gupta",
    time: "Yesterday",
    icon: Users,
    color: "bg-purple-100 text-purple-600",
  },
  {
    type: "team",
    content: "Team member joined: Anil Singh",
    time: "2 days ago",
    icon: UserPlus,
    color: "bg-emerald-100 text-emerald-600",
  },
]

const quickActions = [
  { label: "Add property", icon: Building2, href: "/properties/new", className: "bg-emerald-500 text-white hover:bg-emerald-600" },
  { label: "Add client", icon: UserPlus, href: "/clients/new", className: "bg-slate-900 text-white hover:bg-slate-800" },
  { label: "View matches", icon: Sparkles, href: "/matches", className: "border-slate-200 text-slate-700 hover:bg-slate-50" },
  { label: "View team", icon: Users, href: "/team", className: "border-slate-200 text-slate-700 hover:bg-slate-50" },
]

const recentProperties = [
  {
    id: 1,
    name: "Luxury 3BHK Apartment",
    location: "Bani Park, Jaipur",
    price: "₹85,00,000",
    beds: 3,
    baths: 3,
    image: "bg-slate-200",
  },
  {
    id: 2,
    name: "Modern Villa with Garden",
    location: "Vaishali Nagar, Jaipur",
    price: "₹1,20,00,000",
    beds: 4,
    baths: 4,
    image: "bg-slate-200",
  },
  {
    id: 3,
    name: "Cozy 2BHK Flat",
    location: "Malviya Nagar, Jaipur",
    price: "₹45,00,000",
    beds: 2,
    baths: 2,
    image: "bg-slate-200",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm md:rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                {stat.label !== "Matches found" && stat.label !== "Pending follow-ups" && (
                  <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                    <stat.trendIcon className="w-3 h-3" />
                    <span>{stat.trend.split(" ")[0]}</span>
                  </div>
                )}
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <span className={cn(
                  "text-[10px] sm:text-xs",
                  stat.label === "Pending follow-ups" ? "text-red-500" : "text-slate-400"
                )}>
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 text-xs">
              View all
            </Button>
          </div>
          <Card className="border-none shadow-sm md:rounded-xl overflow-hidden">
            <div className="divide-y divide-slate-100">
              {activities.map((activity, idx) => (
                <div 
                  key={idx} 
                  className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", activity.color)}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-medium truncate group-hover:text-slate-900 transition-colors">
                      {activity.content}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={cn(
                  buttonVariants({ 
                    variant: action.className.includes("border") ? "outline" : "default"
                  }),
                  "h-14 justify-start px-4 rounded-xl text-sm font-medium transition-all active:scale-[0.98]",
                  action.className
                )}
              >
                <action.icon className="w-5 h-5 mr-3 shrink-0" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Properties Snapshot */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recently added properties</h2>
          <Link href="/properties" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex overflow-x-auto lg:grid lg:grid-cols-3 gap-4 pb-4 px-1 -mx-1 no-scrollbar sm:pb-0 sm:px-0 sm:mx-0">
          {recentProperties.map((property) => (
            <Card key={property.id} className="min-w-[280px] border-none shadow-sm md:rounded-xl overflow-hidden hover:shadow-md transition-shadow group cursor-pointer shrink-0">
              <div className={cn("aspect-video w-full relative", property.image)}>
                <Badge className="absolute top-3 right-3 bg-emerald-500 hover:bg-emerald-600 border-none font-bold">
                  {property.price}
                </Badge>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                    {property.name}
                  </h3>
                  <div className="flex items-center text-slate-500 text-xs">
                    <MapPin className="w-3 h-3 mr-1 shrink-0" />
                    {property.location}
                  </div>
                </div>
                
                <Separator className="bg-slate-100" />
                
                <div className="flex items-center gap-4 text-slate-600 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{property.beds} Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{property.baths} Baths</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
