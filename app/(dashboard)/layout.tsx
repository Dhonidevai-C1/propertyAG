'use client'

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  UserCog, 
  Settings, 
  LogOut,
  ChevronRight,
  Bell,
  Sparkles,
  Users,
  Building2,
  LayoutDashboard
} from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const hiddenNavItems = [
  { label: "Team", icon: UserCog, href: "/team" },
  { label: "Settings", icon: Settings, href: "/settings" },
]

const allNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Properties", icon: Building2, href: "/properties" },
  { label: "Clients", icon: Users, href: "/clients" },
  { label: "Smart Matches", icon: Sparkles, href: "/matches" },
  { label: "Notifications", icon: Bell, href: "/notifications" },
  { label: "Team", icon: UserCog, href: "/team" },
  { label: "Settings", icon: Settings, href: "/settings" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex bg-white h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 lg:pb-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav onOpenMenu={() => setIsMobileMenuOpen(true)} />
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl h-auto max-h-[80vh] px-0 pb-10">
          <SheetHeader className="px-6 pb-4">
            <SheetTitle className="text-left text-lg font-bold">Main Menu</SheetTitle>
            <SheetDescription className="hidden">Navigate through PropDesk</SheetDescription>
          </SheetHeader>
          
          <div className="px-2 space-y-1">
            {allNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all",
                    isActive 
                      ? "bg-emerald-500/10 text-emerald-600 font-semibold" 
                      : "text-slate-600 hover:bg-slate-50 active:scale-[0.98]"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    isActive ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="flex-1 text-base">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>
              )
            })}

            <div className="px-4 py-2">
              <Separator className="bg-slate-100" />
            </div>

            <button
              className="w-full flex items-center gap-4 px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
               <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <LogOut className="w-5 h-5" />
               </div>
               <span className="text-base font-medium">Log out</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
