'use client'

import React from "react"
import { 
  Sparkles, 
  Pencil, 
  Trash2,
  Phone,
  Mail,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Client, ClientStatus } from "./client-row"
import Link from "next/link"

interface ClientCardProps {
  client: Client
  onDelete: (id: string) => void
}

export function ClientCard({ client, onDelete }: ClientCardProps) {
  const getAvatarColor = (name: string) => {
    const firstLetter = name.charAt(0).toUpperCase()
    const colors: Record<string, string> = {
      A: "bg-purple-100 text-purple-700",
      B: "bg-blue-100 text-blue-700",
      C: "bg-emerald-100 text-emerald-700",
      D: "bg-amber-100 text-amber-700",
      E: "bg-rose-100 text-rose-700",
      F: "bg-indigo-100 text-indigo-700",
      G: "bg-cyan-100 text-cyan-700",
      H: "bg-orange-100 text-orange-700",
    }
    return colors[firstLetter] || "bg-slate-100 text-slate-700"
  }

  const statusColors: Record<ClientStatus, string> = {
    Active: "bg-green-100 text-green-700",
    Matched: "bg-amber-100 text-amber-700",
    Closed: "bg-slate-100 text-slate-500",
  }

  return (
    <Card className="p-4 border-slate-100 shadow-sm bg-white hover:border-emerald-100 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className={cn("h-10 w-10 border-none font-bold", getAvatarColor(client.name))}>
            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 leading-tight">{client.name}</span>
            <span className="text-xs text-slate-400 font-medium">Added {client.addedDate}</span>
          </div>
        </div>
        <Badge className={cn("border-none px-2 py-0 text-[10px] font-bold", statusColors[client.status])}>
          {client.status}
        </Badge>
      </div>

      <div className="space-y-2.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Phone className="w-3.5 h-3.5" />
          <span>{client.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium truncate">
          <Mail className="w-3.5 h-3.5" />
          <span>{client.email}</span>
        </div>
        <div className="pt-1">
          <span className="text-sm font-bold text-slate-900">Budget: {client.budget}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-4">
        {client.requirements.map((req, i) => (
          <span 
            key={i} 
            className="px-2.5 py-0.5 bg-slate-50 text-slate-500 text-xs font-semibold rounded-full border border-slate-100 whitespace-nowrap"
          >
            {req}
          </span>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-amber-600 font-bold group-hover:scale-105 transition-transform origin-left">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs">{client.matchCount} fits</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/clients/${client.id}`}>
            <Button size="sm" variant="outline" className="h-8 px-3 text-xs border-slate-200 text-slate-600 rounded-lg">
              View
            </Button>
          </Link>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 rounded-lg"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
