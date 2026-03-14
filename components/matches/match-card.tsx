'use client'

import React from "react"
import Link from "next/link"
import { 
  Building2, 
  User, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  MoreVertical, 
  Eye, 
  XCircle,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MatchCardProps {
  match: {
    id: string
    score: number
    date: string
    status: 'New' | 'Reviewed' | 'Contacted'
    client: {
      name: string
      budget: string
      requirements: string[]
    }
    property: {
      name: string
      price: string
      specs: string[]
      image?: string
    }
  }
}

export function MatchCard({ match }: MatchCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-emerald-500 text-white"
    if (score >= 75) return "bg-amber-400 text-white"
    return "bg-slate-400 text-white"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent match"
    if (score >= 75) return "Good match"
    return "Fair match"
  }

  return (
    <Card className="overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
      {/* Score Badge Strip */}
      <Tooltip>
        <TooltipTrigger render={
          <div className={cn("px-4 py-1.5 flex justify-between items-center cursor-help", getScoreColor(match.score))}>
            <span className="text-sm font-bold">{match.score}% match</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">{getScoreLabel(match.score)}</span>
          </div>
        } />
        <TooltipContent className="bg-slate-900 border-none p-3 shadow-xl rounded-xl">
          <div className="space-y-1.5">
            <p className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1">Score breakdown</p>
            <div className="grid grid-cols-[1fr_auto] gap-x-8 text-[11px]">
              <span>Budget match</span> <span className="text-emerald-400 font-bold">+40pts</span>
              <span>Type match</span> <span className="text-emerald-400 font-bold">+20pts</span>
              <span>Location match</span> <span className="text-emerald-400 font-bold">+20pts</span>
              <span>Bedrooms</span> <span className="text-emerald-400 font-bold">+10pts</span>
              <span>Area</span> <span className="text-emerald-400 font-bold">+10pts</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      <div className="p-4 flex flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 w-full">
          {/* Client Panel */}
          <div className="space-y-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Client</span>
            <div className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8 text-xs font-bold rounded-full bg-slate-100 text-slate-600">
                <AvatarFallback>{match.client.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-bold text-slate-800 truncate">{match.client.name}</span>
            </div>
            <div className="space-y-2">
               <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-600 text-[10px] py-0 px-2 rounded-md">
                {match.client.budget}
              </Badge>
              <div className="flex flex-wrap gap-1.5">
                {match.client.requirements.slice(0, 2).map((req, i) => (
                  <span key={i} className="text-[10px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    {req}
                  </span>
                ))}
                {match.client.requirements.length > 2 && (
                  <span className="text-[10px] text-slate-400 font-bold">+{match.client.requirements.length - 2} more</span>
                )}
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block w-px bg-slate-50 h-full self-stretch" />

          {/* Property Panel */}
          <div className="space-y-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Property</span>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-slate-300" />
              </div>
              <span className="text-sm font-bold text-slate-800 truncate">{match.property.name}</span>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-bold text-emerald-600 block">{match.property.price}</span>
              <div className="flex flex-wrap gap-1.5">
                {match.property.specs.map((spec, i) => (
                  <span key={i} className="text-[10px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{match.date}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="h-8 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 px-2">
            Mark reviewed
          </Button>
          <Link href={`/matches/${match.id}`}>
            <Button variant="outline" className="h-8 text-xs font-bold text-slate-600 border-slate-200 rounded-lg px-3">
              View details
            </Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 rounded-lg">
                <MoreVertical className="w-4 h-4" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem className="text-red-500 font-bold text-xs p-2.5 cursor-pointer">
                <XCircle className="w-3.5 h-3.5 mr-2" />
                Dismiss match
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  )
}
