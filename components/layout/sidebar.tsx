'use client'

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Sparkles, 
  Bell, 
  UserCog, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Building
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Properties", icon: Building2, href: "/properties" },
  { label: "Clients", icon: Users, href: "/clients" },
  { label: "Smart Matches", icon: Sparkles, href: "/matches" },
  { label: "Notifications", icon: Bell, href: "/notifications", badge: 3 },
]

const secondaryNavItems = [
  { label: "Team", icon: UserCog, href: "/team" },
  { label: "Settings", icon: Settings, href: "/settings" },
]

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside 
      className={cn(
        "hidden lg:flex flex-col h-screen bg-slate-900 text-slate-400 transition-all duration-300 ease-in-out border-r border-slate-800 shrink-0",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo Area */}
      <div className="h-[60px] flex items-center px-4 shrink-0 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
            <Building className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-white tracking-tight animate-in fade-in duration-500">
              PropDesk
            </span>
          )}
        </div>
      </div>

      <Separator className="bg-slate-800" />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1">
        {navItems.map((item) => (
          <NavItem 
            key={item.label} 
            item={item} 
            isCollapsed={isCollapsed} 
            isActive={pathname === item.href} 
          />
        ))}
        
        <div className="px-4 py-2">
          <Separator className="bg-slate-800" />
        </div>

        {secondaryNavItems.map((item) => (
          <NavItem 
            key={item.label} 
            item={item} 
            isCollapsed={isCollapsed} 
            isActive={pathname === item.href} 
          />
        ))}
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 mt-auto border-t border-slate-800 space-y-4">
        <div className={cn(
          "flex items-center gap-3 group relative transition-all duration-300",
          isCollapsed ? "justify-center" : "px-2 pb-2"
        )}>
          <Avatar className="w-8 h-8 border-2 border-emerald-500/20 cursor-pointer">
            <AvatarFallback className="bg-emerald-600 text-white text-xs font-bold">JD</AvatarFallback>
          </Avatar>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0 animate-in slide-in-from-left-2 duration-300">
              <p className="text-sm font-medium text-slate-200 truncate leading-none mb-1">Jane Doe</p>
              <p className="text-xs text-slate-500 truncate">Admin</p>
            </div>
          )}

          {!isCollapsed && (
            <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {isCollapsed && (
             <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                Jane Doe (Admin)
             </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <div className="flex justify-start">
           <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full h-10 hover:bg-slate-800 hover:text-white text-slate-500"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : (
              <div className="flex items-center gap-2 px-2 w-full">
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Collapse</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </aside>
  )
}

function NavItem({ item, isCollapsed, isActive }: { 
  item: typeof navItems[0], 
  isCollapsed: boolean,
  isActive: boolean 
}) {
  const { icon: Icon, label, href, badge } = item

  const content = (
    <Link
      href={href}
      className={cn(
        "flex items-center h-11 transition-all duration-200 group mx-3 rounded-lg relative",
        isActive 
          ? "bg-emerald-500/10 text-emerald-400 font-medium" 
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
        isCollapsed ? "justify-center px-0 mx-3" : "px-3"
      )}
    >
      {isActive && !isCollapsed && (
        <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-500 rounded-r-full" />
      )}
      
      <Icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", isActive && "text-emerald-400")} />
      
      {!isCollapsed && (
        <span className="ml-3 text-sm flex-1 truncate transition-all duration-300">
          {label}
        </span>
      )}

      {!isCollapsed && badge && (
        <Badge className="ml-auto bg-emerald-500 hover:bg-emerald-600 text-[10px] px-1.5 py-0 h-5 min-w-5 flex items-center justify-center border-none">
          {badge}
        </Badge>
      )}

      {isCollapsed && badge && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900" />
      )}
    </Link>
  )

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger>
          {content}
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
          {label} {badge && `(${badge})`}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}
