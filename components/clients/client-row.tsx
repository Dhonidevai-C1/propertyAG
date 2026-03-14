'use client'

import React from "react"
import { 
  MoreVertical, 
  Copy, 
  Sparkles, 
  Eye, 
  Pencil, 
  Trash2,
  Phone,
  Mail
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { TableRow, TableCell } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import Link from "next/link"

export type ClientStatus = "Active" | "Matched" | "Closed"

export interface Client {
  id: string
  name: string
  phone: string
  email: string
  addedDate: string
  budget: string
  requirements: string[]
  status: ClientStatus
  matchCount: number
}

interface ClientRowProps {
  client: Client
  isSelected: boolean
  onSelect: (id: string, checked: boolean) => void
  onDelete: (id: string) => void
}

export function ClientRow({ client, isSelected, onSelect, onDelete }: ClientRowProps) {
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

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${type} copied to clipboard`)
  }

  return (
    <TableRow className="group hover:bg-slate-50/50 transition-colors">
      <TableCell className="w-12">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(client.id, !!checked)}
          className="border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none"
        />
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className={cn("h-9 w-9 border-none font-bold", getAvatarColor(client.name))}>
            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-slate-800">{client.name}</span>
            <span className="text-xs text-slate-400">Added {client.addedDate}</span>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex flex-col space-y-0.5 group/contact max-w-[200px]">
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <span>{client.phone}</span>
            <button 
              onClick={() => copyToClipboard(client.phone, "Phone number")}
              className="opacity-0 group-hover/contact:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
            >
              <Copy className="w-3 h-3 text-slate-400" />
            </button>
          </div>
          <span className="text-xs text-slate-500 truncate">{client.email}</span>
        </div>
      </TableCell>
      
      <TableCell>
        <span className="text-sm font-medium text-slate-700">{client.budget}</span>
      </TableCell>
      
      <TableCell>
        <div className="flex flex-wrap gap-1.5 max-w-[250px]">
          {client.requirements.map((req, i) => (
            <span 
              key={i} 
              className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] sm:text-xs font-medium rounded-full whitespace-nowrap"
            >
              {req}
            </span>
          ))}
        </div>
      </TableCell>
      
      <TableCell>
        <Badge className={cn("border-none px-2.5 py-0.5 text-[11px] font-semibold rounded-full", statusColors[client.status])}>
          {client.status}
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-1.5 text-amber-600 font-medium">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">{client.matchCount} matches</span>
        </div>
      </TableCell>
      
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Link href={`/clients/${client.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <MoreVertical className="w-4 h-4" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="bg-white min-w-[120px]">
              <DropdownMenuItem className="cursor-pointer">
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem 
                className="text-red-500 cursor-pointer focus:text-red-500"
                onClick={() => onDelete(client.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}
