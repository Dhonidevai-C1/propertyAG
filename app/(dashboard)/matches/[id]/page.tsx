'use client'

import React from "react"
import Link from "next/link"
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
  Share2,
  X,
  Copy
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// --- Mock Data ---
const MOCK_MATCH = {
  id: "match-123",
  score: 92,
  date: "January 20, 2025",
  status: "New",
  breakdown: [
    { label: "Budget match", points: 40, max: 40, color: "bg-emerald-500" },
    { label: "Location match", points: 20, max: 20, color: "bg-emerald-500" },
    { label: "Property type", points: 20, max: 20, color: "bg-emerald-500" },
    { label: "Bedrooms", points: 10, max: 10, color: "bg-emerald-500" },
    { label: "Area (sq ft)", points: 2, max: 10, color: "bg-amber-400" },
  ],
  property: {
    id: "prop-456",
    title: "3BHK Luxury Apartment",
    price: "₹85,00,000",
    location: "Bani Park, Jaipur",
    specs: [
      { label: "Bedrooms", value: "3" },
      { label: "Bathrooms", value: "2" },
      { label: "Area", value: "1450 sq ft" },
      { label: "Floor", value: "4th of 8" },
      { label: "Furnishing", value: "Semi-furnished" },
      { label: "Parking", value: "1 covered" },
    ],
    highlights: [
      { label: "Budget within range", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
      { label: "Preferred location", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
      { label: "3BHK as required", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
      { label: "Semi-furnished preferred", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
      { label: "Area slightly below preference", icon: TriangleAlert, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
    ]
  },
  client: {
    id: "client-789",
    name: "Priya Sharma",
    goal: "Looking to buy",
    source: "Walk-in",
    phone: "+91 98765 43210",
    email: "priya.sharma@email.com",
    requirements: [
      { label: "Looking for", value: "Buy" },
      { label: "Property type", value: "Apartment, Villa" },
      { label: "Location", value: "Vaishali Nagar, Bani Park" },
      { label: "Budget", value: "₹60L – ₹1.2Cr" },
      { label: "Bedrooms", value: "3+" },
      { label: "Min area", value: "1200 sq ft" },
      { label: "Furnishing", value: "Semi-furnished" },
      { label: "Timeline", value: "Within 3 months" },
    ]
  }
}

export default function MatchDetailPage() {
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${type} copied to clipboard`)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* --- Page Header --- */}
      <header className="space-y-4">
        <Link href="/matches" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to matches
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center bg-emerald-100 text-emerald-700 font-black text-xl px-5 py-2.5 rounded-full shadow-sm ring-4 ring-emerald-50">
              <Sparkles className="w-5 h-5 mr-2" />
              {MOCK_MATCH.score}% match
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">Status</h1>
              <Badge variant="outline" className="mt-1.5 border-slate-200 text-slate-600 font-bold px-3 py-0.5 rounded-lg active:scale-95 transition-transform cursor-default">
                {MOCK_MATCH.status}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <div className="sm:hidden">
              <Badge variant="outline" className="border-slate-200 text-slate-600 font-bold px-3 py-1 rounded-lg">
                {MOCK_MATCH.status}
              </Badge>
             </div>
             <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl shadow-sm">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="bg-white min-w-48 p-1.5 shadow-xl border-slate-100 rounded-xl">
                <DropdownMenuItem onClick={() => toast.success("Match marked as reviewed")} className="rounded-lg py-2.5 font-bold text-xs text-slate-600 cursor-pointer">
                  Mark as reviewed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success("Match marked as contacted")} className="rounded-lg py-2.5 font-bold text-xs text-slate-600 cursor-pointer">
                  Mark as contacted
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.error("Match dismissed")} className="rounded-lg py-2.5 font-bold text-xs text-red-500 cursor-pointer focus:text-red-600 focus:bg-red-50">
                  Dismiss match
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
          Matched on {MOCK_MATCH.date} • <span className="text-emerald-500">Matched by smart engine</span>
        </p>
      </header>

      {/* --- Score Breakdown Bar --- */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-8 overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Match score breakdown</h3>
        
        <div className="space-y-6">
          {MOCK_MATCH.breakdown.map((item, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <span className="text-xs font-bold text-slate-500 w-32 shrink-0">{item.label}</span>
              <div className="flex-1 h-2.5 rounded-full bg-slate-50 overflow-hidden ring-1 ring-slate-100/50">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000 delay-300", item.color)}
                  style={{ width: `${(item.points / item.max) * 100}%` }}
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
              <span className="text-2xl font-black text-emerald-600">{MOCK_MATCH.score}</span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- Main Content: Side-by-Side Panel --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Vertical Divider - Desktop Only */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 -translate-x-1/2" />

        {/* == LEFT PANEL — Property == */}
        <section className="bg-white rounded-3xl shadow-sm border border-emerald-100 flex flex-col h-full overflow-hidden group">
          <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Property</span>
            </div>
            <Link href={`/properties/${MOCK_MATCH.property.id}`} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50">
               View property →
            </Link>
          </div>
          
          <div className="aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden">
            <Building2 className="w-16 h-16 text-slate-200" />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
          </div>
          
          <div className="px-6 py-8 flex-1 space-y-8">
            <div className="space-y-2">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{MOCK_MATCH.property.price}</p>
              <h3 className="text-lg font-bold text-slate-700">{MOCK_MATCH.property.title}</h3>
              <div className="flex items-center text-slate-400 font-bold text-xs uppercase tracking-tight">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {MOCK_MATCH.property.location}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-10 gap-y-6">
              {MOCK_MATCH.property.specs.map((spec, i) => (
                <div key={i} className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{spec.label}</span>
                  <p className="text-sm font-bold text-slate-700">{spec.value}</p>
                </div>
              ))}
            </div>
            
            <div className="pt-8 border-t border-slate-50 space-y-5">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Why this matches</h3>
              <div className="flex flex-wrap gap-2">
                {MOCK_MATCH.property.highlights.map((h, i) => {
                  const Icon = h.icon
                  return (
                    <div key={i} className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-all hover:scale-105",
                      h.bg,
                      h.border || "border-slate-100"
                    )}>
                      <Icon className={cn("w-3.5 h-3.5", h.color)} />
                      <span className={cn("text-[10px] font-bold tracking-tight", h.color.replace('text-', 'text-slate-700'))}>
                        {h.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* == RIGHT PANEL — Client == */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
          <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client</span>
            </div>
            <Link href={`/clients/${MOCK_MATCH.client.id}`} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50">
               View client →
            </Link>
          </div>
          
          <div className="px-6 py-8 flex-1 space-y-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-2xl border-none shadow-lg ring-4 ring-purple-50">
                <AvatarFallback className="bg-purple-100 text-purple-700 text-xl font-black">PS</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{MOCK_MATCH.client.name}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500">{MOCK_MATCH.client.goal}</span>
                  <Badge className="bg-slate-100 text-slate-500 border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-sm">
                    {MOCK_MATCH.client.source}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-1 px-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Requirements</h3>
              <div className="grid gap-px bg-slate-50 border border-slate-50 rounded-2xl overflow-hidden shadow-sm">
                {MOCK_MATCH.client.requirements.map((req, i) => (
                  <div key={i} className="flex justify-between items-center bg-white px-5 py-3.5 group hover:bg-slate-50/50 transition-colors">
                    <span className="text-xs font-bold text-slate-400 capitalize">{req.label}</span>
                    <span className="text-xs font-bold text-slate-700 text-right max-w-[180px]">{req.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-50 space-y-5">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact information</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <button 
                   onClick={() => copyToClipboard(MOCK_MATCH.client.phone, "Phone")}
                   className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-white transition-all group"
                 >
                   <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-emerald-500">
                     <Phone className="w-4 h-4" />
                   </div>
                   <span className="text-xs font-bold text-slate-700">{MOCK_MATCH.client.phone}</span>
                   <Copy className="ml-auto w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </button>
                 
                 <button 
                    onClick={() => copyToClipboard(MOCK_MATCH.client.email, "Email")}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-white transition-all group"
                 >
                   <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500">
                     <Mail className="w-4 h-4" />
                   </div>
                   <span className="text-xs font-bold text-slate-500 truncate">{MOCK_MATCH.client.email}</span>
                   <Copy className="ml-auto w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </button>
               </div>
            </div>
          </div>
        </section>
      </div>

      {/* --- Action Footer --- */}
      <footer className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-slate-200" />
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Suggested</h4>
          <p className="text-sm font-bold text-slate-700 tracking-tight">What would you like to do next?</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => toast.success("Match marked as reviewed")}
            className="flex-1 sm:flex-none h-11 px-6 rounded-xl border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 hover:text-slate-900 shadow-sm"
          >
            <CheckCheck className="w-4 h-4 mr-2 text-emerald-500" />
            Mark as reviewed
          </Button>
          <Button 
            variant="outline" 
            onClick={() => toast.success("Contact logged successfully")}
            className="flex-1 sm:flex-none h-11 px-6 rounded-xl border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 hover:text-slate-900 shadow-sm"
          >
            <Phone className="w-4 h-4 mr-2 text-blue-500" />
            Log contact made
          </Button>
          <Button 
            variant="outline" 
            onClick={() => toast.success("Report link copied to clipboard")}
            className="flex-1 sm:flex-none h-11 px-6 rounded-xl border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 hover:text-slate-900 shadow-sm"
          >
            <Share2 className="w-4 h-4 mr-2 text-purple-500" />
            Share match report
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => toast.error("Match dismissed")}
            className="flex-1 sm:flex-none h-11 px-6 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-xs"
          >
            <X className="w-4 h-4 mr-2" />
            Dismiss match
          </Button>
        </div>
      </footer>
    </div>
  )
}
