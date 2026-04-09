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
import { AuthProvider } from "@/lib/context/auth-context"
import { LogoutButton } from "@/components/auth/logout-button"
import { NotificationProvider } from "@/components/notifications/notification-provider"

const allNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Properties", icon: Building2, href: "/properties" },
  { label: "Leads", icon: Users, href: "/clients" },
  { label: "Smart Matches", icon: Sparkles, href: "/matches" },
  { label: "Notifications", icon: Bell, href: "/notifications" },
  { label: "Team", icon: UserCog, href: "/team" },
  { label: "Settings", icon: Settings, href: "/settings" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="flex bg-slate-100 h-screen overflow-hidden print:h-auto print:overflow-visible text-stone-800">
          {/* Desktop Sidebar */}
          <div className="print:hidden z-20">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          </div>

          {/* Main Content - Updated with Warm Professional Background */}
          <main className="flex-1 min-w-0 bg-slate-100 overflow-y-auto print:bg-white">
            <div className="p-4 md:p-6 pb-24 lg:pb-6 max-w-7xl mx-auto w-full print:p-0">
              {children}
            </div>
          </main>

          {/* Mobile Bottom Nav */}
          <div className="print:hidden">
            <MobileNav onOpenMenu={() => setIsMobileMenuOpen(true)} />
          </div>
        </div>

        {/* Mobile Menu Sheet */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="bottom" className="rounded-t-3xl h-auto max-h-[80vh] px-0 pb-10 bg-[#FDFCFB]">
            <SheetHeader className="px-6 pb-4 flex flex-row items-center gap-3">
              <img src="/logoprop.png" alt="Logo" className="w-10 h-10 object-contain" />
              <div className="flex flex-col text-left">
                <SheetTitle className="text-lg font-bold text-stone-900">PropDesk</SheetTitle>
                <SheetDescription className="text-xs text-stone-500">Manage your properties with ease</SheetDescription>
              </div>
            </SheetHeader>
            <div className="px-2 space-y-1">
              {allNavItems.map(item => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all",
                      isActive
                        // Warm premium accent (Amber/Copper) instead of Emerald
                        ? "bg-amber-600/10 text-amber-700 font-semibold"
                        // Warmer hover states using Stone instead of Slate
                        : "text-stone-600 hover:bg-stone-100 active:scale-[0.98]"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      // Matching the icon colors to the new warm theme
                      isActive ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-500"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-base">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-stone-300" />
                  </Link>
                )
              })}

              <div className="px-4 py-2">
                <Separator className="bg-stone-200" />
              </div>

              <div className="px-4">
                <LogoutButton className="w-full flex items-center gap-4 px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-xl h-auto font-medium transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="text-base">Log out</span>
                </LogoutButton>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </NotificationProvider>
    </AuthProvider>
  )
}