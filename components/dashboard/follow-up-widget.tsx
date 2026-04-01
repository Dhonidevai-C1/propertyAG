import React from "react"
import Link from "next/link"
import { Phone, CalendarClock, MessageCircle, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, formatCurrency } from "@/lib/utils"
import { Client } from "@/lib/types/database"

export function FollowUpWidget({ followUps }: { followUps: Client[] }) {
  if (followUps.length === 0) {
    return (
      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden h-full flex flex-col items-center justify-center p-8 text-center bg-white">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
          <CalendarClock className="w-6 h-6" />
        </div>
        <h3 className="text-slate-900 font-bold mb-1">No follow-ups due</h3>
        <p className="text-sm text-slate-500 max-w-[200px]">You are all caught up for today!</p>
      </Card>
    )
  }

  return (
    <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-50 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-emerald-500" />
          Follow-ups due ({followUps.length})
        </h2>
        <Link href="/clients" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50 max-h-[300px]">
        {followUps.slice(0, 5).map(client => {
          const propertyType = client.property_types?.[0]?.replace(/_/g, " ") || "Property"
          const budgetText = client.budget_max ? formatCurrency(client.budget_max) : "Open budget"
          
          return (
             <div key={client.id} className="p-4 hover:bg-slate-50 transition-colors group flex items-start justify-between gap-4">
               <div>
                 <Link href={`/clients/${client.id}`} className="font-bold text-slate-900 hover:text-emerald-600 transition-colors text-sm">
                   {client.full_name}
                 </Link>
                 <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs font-medium text-slate-500">
                   <span className="capitalize">{propertyType}</span>
                   <span className="text-slate-300">•</span>
                   <span>{budgetText}</span>
                   {client.follow_up_date && (
                     <>
                       <span className="text-slate-300">•</span>
                       <span className={cn(
                         "font-bold",
                         new Date(client.follow_up_date) < new Date(new Date().toDateString()) ? "text-red-500" : "text-amber-500"
                       )}>
                         {new Date(client.follow_up_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                       </span>
                     </>
                   )}
                 </div>
               </div>
               
               <div className="flex items-center gap-2 shrink-0">
                 {client.phone && (
                   <>
                     <a
                       href={`tel:${client.phone}`}
                       className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                       title="Call client"
                     >
                       <Phone className="w-3.5 h-3.5" />
                     </a>
                     <a
                       href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="w-8 h-8 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-600 flex items-center justify-center transition-colors shadow-sm"
                       title="WhatsApp client"
                     >
                       <MessageCircle className="w-4 h-4" />
                     </a>
                   </>
                 )}
               </div>
             </div>
          )
        })}
      </div>
    </Card>
  )
}
