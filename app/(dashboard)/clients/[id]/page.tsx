'use client'

import React, { use } from "react"
import Link from "next/link"
import { 
  ChevronLeft, 
  MoreVertical, 
  Pencil, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon, 
  Sparkles, 
  History,
  Building2,
  Clock,
  User,
  ArrowRight,
  Plus,
  CheckCircle2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const clientData = {
  id: "c101",
  name: "Priya Sharma",
  status: "Active",
  avatar: null,
  phone: "+91 98290 88776",
  email: "priya.sharma@example.com",
  source: "Walk-in customer",
  addedDate: "January 15, 2025",
  assignedAgent: {
    name: "Ravi Kumar",
    avatar: null
  },
  notes: "Looking for a quiet neighborhood near Vaishali Nagar. Prefers west-facing if possible. Flexible on floor but needs good ventilation.",
  requirements: {
    lookingFor: "Buy",
    type: "Apartment, Villa",
    location: "Vaishali Nagar, Bani Park",
    budget: "₹60L – ₹1.2Cr",
    bedrooms: "3+",
    area: "1200+ sq ft",
    furnishing: "Semi-furnished",
    timeline: "Within 3 months"
  },
  activity: [
    { title: "Client added by Ravi Kumar", time: "10 days ago", type: "added" },
    { title: "Smart match run", time: "10 days ago", subtitle: "4 matches found", type: "match" },
    { title: "Match viewed: 3BHK Bani Park", time: "8 days ago", type: "view" },
    { title: "Follow-up scheduled", time: "5 days ago", type: "followup" },
  ],
  matchedProperties: [
    { id: "p1", name: "Luxury 3BHK Apartment", price: "₹85,00,000", score: "88%", image: null },
    { id: "p2", name: "Modern Villa in Bani Park", price: "₹1,25,00,000", score: "82%", image: null },
    { id: "p3", name: "Semi-furnished 2BHK", price: "₹55,00,000", score: "75%", image: null },
  ],
  nextFollowUp: {
    date: "March 20, 2025",
    time: "10:30 AM",
    agent: "Ravi Kumar"
  }
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/clients" 
          className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors group w-fit"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          Back to clients
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{clientData.name}</h1>
            <Badge className="bg-emerald-100 text-emerald-700 border-none rounded-full px-3 py-0.5 text-xs font-bold">
              {clientData.status}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href={`/clients/${id}/edit`}>
              <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-slate-600 font-bold px-5">
                <Pencil className="w-4 h-4 mr-2" />
                Edit client
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 border border-slate-100 rounded-xl">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="bg-white min-w-[160px]">
                <DropdownMenuItem className="cursor-pointer font-medium">Mark as closed</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem className="text-red-500 cursor-pointer font-medium focus:text-red-500">Delete client</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Client Info Card */}
          <SectionCard>
            <div className="flex flex-col sm:flex-row gap-6">
              <Avatar className="h-16 w-16 text-xl font-bold rounded-2xl bg-purple-100 text-purple-700">
                <AvatarFallback>{clientData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  <InfoItem icon={<Phone className="w-4 h-4" />} label="Phone">
                    <a href={`tel:${clientData.phone}`} className="hover:text-emerald-600 transition-colors">
                      {clientData.phone}
                    </a>
                  </InfoItem>
                  <InfoItem icon={<Mail className="w-4 h-4" />} label="Email">
                    <span className="truncate block">{clientData.email}</span>
                  </InfoItem>
                  <InfoItem icon={<User className="w-4 h-4" />} label="Source">
                    {clientData.source}
                  </InfoItem>
                  <InfoItem icon={<CalendarIcon className="w-4 h-4" />} label="Added">
                    {clientData.addedDate}
                  </InfoItem>
                </div>
                
                <div className="pt-4 border-t border-slate-50 flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Assigned Agent</span>
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full">
                    <Avatar className="h-5 w-5 bg-slate-200">
                      <AvatarFallback className="text-[10px]">{clientData.assignedAgent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-bold text-slate-700">{clientData.assignedAgent.name}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Notes</span>
                  <p className="text-sm text-slate-500 italic leading-relaxed">
                    {clientData.notes || "No notes added"}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Requirements Card */}
          <SectionCard title="Property requirements" icon={<Sparkles className="w-5 h-5 text-amber-500" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-12">
              <ReqGridItem label="Looking for" value={clientData.requirements.lookingFor} />
              <ReqGridItem label="Property type" value={clientData.requirements.type} />
              <ReqGridItem label="Location" value={clientData.requirements.location} />
              <ReqGridItem label="Budget" value={clientData.requirements.budget} />
              <ReqGridItem label="Bedrooms" value={clientData.requirements.bedrooms} />
              <ReqGridItem label="Minimum Area" value={clientData.requirements.area} />
              <ReqGridItem label="Furnishing" value={clientData.requirements.furnishing} />
              <ReqGridItem label="Timeline" value={clientData.requirements.timeline} />
            </div>
          </SectionCard>

          {/* Activity Timeline */}
          <SectionCard title="Client activity" icon={<History className="w-5 h-5 text-emerald-500" />}>
            <div className="relative space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {clientData.activity.map((item, idx) => (
                <div key={idx} className="relative pl-8">
                  <div className={cn(
                    "absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm ring-2 ring-transparent",
                    item.type === 'added' ? "bg-slate-300" : 
                    item.type === 'match' ? "bg-amber-400" :
                    item.type === 'view' ? "bg-blue-400" : "bg-emerald-400"
                  )} />
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-800">{item.title}</p>
                    {item.subtitle && <p className="text-xs text-slate-500 font-medium">{item.subtitle}</p>}
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions */}
          <SectionCard title="Quick actions" noPadding>
            <div className="flex flex-col p-2">
              <Link href={`/clients/${id}/edit`} className="w-full">
                <Button variant="ghost" className="w-full justify-start h-12 px-4 text-slate-600 font-bold hover:bg-slate-50 rounded-xl">
                  <Pencil className="w-4 h-4 mr-3" />
                  Edit requirements
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start h-12 px-4 text-amber-600 font-bold hover:bg-amber-50 rounded-xl">
                <Sparkles className="w-4 h-4 mr-3" />
                Run match now
              </Button>
              <Button variant="ghost" className="w-full justify-start h-12 px-4 text-slate-600 font-bold hover:bg-slate-50 rounded-xl">
                <Phone className="w-4 h-4 mr-3" />
                Log follow-up
              </Button>
            </div>
          </SectionCard>

          {/* Matched Properties */}
          <SectionCard 
            title="Matched properties" 
            badge={clientData.matchedProperties.length.toString()}
            noPadding
          >
            <div className="divide-y divide-slate-50">
              {clientData.matchedProperties.map((prop) => (
                <Link key={prop.id} href={`/properties/${prop.id}`}>
                  <div className="p-4 hover:bg-slate-50 transition-colors group flex items-center gap-3">
                    <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-slate-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-emerald-600">{prop.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{prop.price}</p>
                    </div>
                    <Badge className="bg-amber-50 text-amber-600 border-none px-2 py-0 text-[10px] font-bold">
                      {prop.score} match
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
            <div className="p-4 border-t border-slate-50">
              <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                View all matches
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </SectionCard>

          {/* Next Follow-up */}
          <SectionCard title="Next follow-up">
            {clientData.nextFollowUp ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <CalendarIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">{clientData.nextFollowUp.date}</p>
                    <p className="text-xs text-slate-500 font-medium">{clientData.nextFollowUp.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">RK</AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] font-bold text-slate-600">Assigned to Ravi Kumar</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-emerald-600">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-2 space-y-3">
                <p className="text-sm text-slate-400 font-medium italic">No follow-up scheduled</p>
                <Button variant="outline" className="w-full rounded-xl border-dashed border-2 py-6 text-emerald-600 hover:bg-emerald-50">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule one
                </Button>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

function SectionCard({ title, icon, children, badge, noPadding }: { title?: string, icon?: React.ReactNode, children: React.ReactNode, badge?: string, noPadding?: boolean }) {
  return (
    <Card className="border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
          </div>
          {badge && (
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
              {badge}
            </span>
          )}
        </div>
      )}
      <div className={cn(!noPadding && "p-6")}>
        {children}
      </div>
    </Card>
  )
}

function InfoItem({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-slate-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm font-semibold text-slate-700">
        {children}
      </div>
    </div>
  )
}

function ReqGridItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold text-slate-700 leading-tight">{value}</span>
    </div>
  )
}
