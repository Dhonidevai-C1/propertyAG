'use client'

import React from "react"
import { Bell, Menu, Search, User } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/properties": "Properties",
  "/clients": "Clients",
  "/matches": "Smart Matches",
  "/notifications": "Notifications",
  "/team": "Team Management",
  "/settings": "Settings",
}

interface TopbarProps {
  onOpenMobileMenu: () => void
}

export function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const pathname = usePathname()
  const title = routeTitles[pathname] || "PropDesk"

  return (
    <header className="h-[60px] bg-white border-b border-slate-100 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden" 
          onClick={onOpenMobileMenu}
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </Button>
        <h1 className="text-lg font-semibold text-slate-900 hidden sm:block">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end max-w-sm md:max-w-md ml-4">
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search tasks, properties..." 
            className="pl-9 bg-slate-50 border-none h-9 text-sm focus-visible:ring-emerald-500 w-full"
          />
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-emerald-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full p-0" />}>
              <Avatar className="h-9 w-9 border-2 border-slate-50">
                <AvatarFallback className="bg-emerald-600 text-white text-xs font-bold">JD</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Jane Doe</p>
                  <p className="text-xs leading-none text-slate-500">jane.doe@propdesk.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
