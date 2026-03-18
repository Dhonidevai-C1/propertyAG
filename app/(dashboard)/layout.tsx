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
  { label: "Clients", icon: Users, href: "/clients" },
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
        <div className="flex bg-white h-screen overflow-hidden print:h-auto print:overflow-visible">
          {/* Desktop Sidebar */}
          <div className="print:hidden z-20">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0 bg-slate-50 overflow-y-auto print:bg-white">
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
          <SheetContent side="bottom" className="rounded-t-3xl h-auto max-h-[80vh] px-0 pb-10">
            <SheetHeader className="px-6 pb-4">
              <SheetTitle className="text-left text-lg font-bold">Menu</SheetTitle>
              <SheetDescription className="hidden">Navigate through PropDesk</SheetDescription>
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

              <div className="px-4">
                <LogoutButton className="w-full flex items-center gap-4 px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-xl h-auto font-medium">
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
