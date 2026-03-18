'use client'

import React, { useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  UserPlus,
  Sparkles,
  Building2,
  Users,
  Bell,
  CheckCheck,
  X,
  ArrowRight,
  Inbox,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useNotifications } from "@/components/notifications/notification-provider"
import { Notification } from "@/lib/types/database"
import { formatRelativeTime } from "@/lib/utils/format"

const TABS = [
  { label: "All", type: null },
  { label: "New clients", type: "new_client" },
  { label: "Matches", type: "match_found" },
  { label: "System", type: "system" },
]

function dateGroup(createdAt: string): 'Today' | 'Yesterday' | 'Earlier this week' | 'Older' {
  const d = new Date(createdAt)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays <= 7) return 'Earlier this week'
  return 'Older'
}

export default function NotificationsPage() {
  const router = useRouter()
  const { notifications, setNotifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [activeTab, setActiveTab] = React.useState("All")

  const filteredNotifications = useMemo(() => {
    const tabType = TABS.find(t => t.label === activeTab)?.type
    if (!tabType) return notifications
    return notifications.filter(n => n.type === tabType)
  }, [notifications, activeTab])

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {
      Today: [],
      Yesterday: [],
      'Earlier this week': [],
      Older: [],
    }
    filteredNotifications.forEach(n => {
      const g = dateGroup(n.created_at)
      groups[g].push(n)
    })
    return groups
  }, [filteredNotifications])

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) await markRead(n.id)
    const link =
      n.reference_type === 'client' ? `/clients/${n.reference_id}` :
      n.reference_type === 'property' ? `/properties/${n.reference_id}` :
      n.reference_type === 'match' ? `/matches/${n.reference_id}` :
      '/notifications'
    router.push(link)
  }

  const dismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center animate-in zoom-in-95">
          <Inbox className="w-10 h-10 text-slate-200" />
        </div>
        <div className="space-y-1 text-center">
          <h3 className="text-xl font-bold text-slate-800">You're all caught up!</h3>
          <p className="text-slate-500 text-sm font-medium">No notifications to show.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="text-emerald-600 hover:text-emerald-700 font-bold text-sm h-9 px-3"
            onClick={markAllRead}
          >
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8 overflow-x-auto no-scrollbar">
        {TABS.map(tab => {
          const isActive = activeTab === tab.label
          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={cn(
                "pb-4 text-sm font-bold transition-all relative whitespace-nowrap",
                isActive
                  ? "text-emerald-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.label === "All" && unreadCount > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-in zoom-in-50">
                    {unreadCount}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* Notification List */}
      <div className="space-y-8 pt-2">
        {Object.entries(groupedNotifications).map(([group, list]) => {
          if (list.length === 0) return null
          return (
            <div key={group} className="space-y-4">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                {group}
              </h2>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 divide-y divide-slate-50">
                {list.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onToggleRead={async (e) => {
                      e.stopPropagation()
                      if (!notification.is_read) await markRead(notification.id)
                    }}
                    onDismiss={(e) => dismiss(notification.id, e)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-6 text-center">
        <Link href="/settings" className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors inline-flex items-center gap-2">
          Manage notification preferences
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

function NotificationItem({
  notification,
  onClick,
  onToggleRead,
  onDismiss,
}: {
  notification: Notification
  onClick: () => void
  onToggleRead: (e: React.MouseEvent) => void
  onDismiss: (e: React.MouseEvent) => void
}) {
  const Icon = {
    new_client: UserPlus,
    match_found: Sparkles,
    property_update: Building2,
    team_member: Users,
    system: Bell,
  }[notification.type] ?? Bell

  const iconColors = {
    new_client: "bg-purple-50 text-purple-600",
    match_found: "bg-amber-50 text-amber-600",
    property_update: "bg-blue-50 text-blue-600",
    team_member: "bg-teal-50 text-teal-600",
    system: "bg-slate-50 text-slate-600",
  }[notification.type] ?? "bg-slate-50 text-slate-600"

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex gap-4 p-4 cursor-pointer transition-all group relative",
        !notification.is_read
          ? "bg-emerald-50/20 border-l-2 border-emerald-400"
          : "hover:bg-slate-50 border-l-2 border-transparent"
      )}
    >
      <div className={cn("w-11 h-11 rounded-full flex items-center justify-center shrink-0", iconColors)}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 space-y-0.5">
        <p className={cn("text-sm font-bold", notification.is_read ? "text-slate-600" : "text-slate-900")}>
          {notification.title}
        </p>
        <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight block pt-1">
          {formatRelativeTime(notification.created_at)}
        </span>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        {!notification.is_read && (
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse mt-1" />
        )}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-white/80 backdrop-blur px-1 py-1 rounded-lg border border-slate-100 shadow-sm">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600 rounded-md" onClick={onToggleRead}>
                  <CheckCheck className="w-4 h-4" />
                </Button>
              } />
              <TooltipContent className="bg-slate-800 text-white border-none py-1 px-2 rounded-md">
                <p className="text-[10px] font-bold">Mark as read</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 rounded-md" onClick={onDismiss}>
                  <X className="w-4 h-4" />
                </Button>
              } />
              <TooltipContent className="bg-red-500 text-white border-none py-1 px-2 rounded-md">
                <p className="text-[10px] font-bold">Dismiss</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
