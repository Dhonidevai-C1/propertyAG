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
import { getRecentActivities, Activity } from "@/lib/actions/activities"
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
  const [activities, setActivities] = React.useState<Activity[]>([])

  React.useEffect(() => {
    getRecentActivities(20).then(setActivities)
  }, [])

  const mergedItems = useMemo(() => {
    const combined = [
      ...notifications.map(n => ({ ...n, itemType: 'notification' as const })),
      ...activities.map(a => ({ ...a, itemType: 'activity' as const }))
    ]
    return combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [notifications, activities])

  const filteredItems = useMemo(() => {
    const tabType = TABS.find(t => t.label === activeTab)?.type
    if (!tabType) return mergedItems
    return mergedItems.filter(item => (item as any).type === tabType)
  }, [mergedItems, activeTab])

  const groupedItems = useMemo(() => {
    const groups: Record<string, any[]> = {
      Today: [],
      Yesterday: [],
      'Earlier this week': [],
      Older: [],
    }
    filteredItems.forEach(item => {
      const g = dateGroup(item.created_at)
      groups[g].push(item)
    })
    return groups
  }, [filteredItems])

  const handleItemClick = async (item: any) => {
    if (item.itemType === 'notification') {
      const n = item as Notification
      if (!n.is_read) await markRead(n.id)
      const link =
        n.reference_type === 'client' ? `/clients/${n.reference_id}` :
        n.reference_type === 'property' ? `/properties/${n.reference_id}` :
        n.reference_type === 'match' ? `/matches/${n.reference_id}` :
        '/notifications'
      router.push(link)
    } else {
      const a = item as Activity
      if (a.action_type === 'delete') return // No link for deleted items
      const link =
        a.entity_type === "client" ? `/clients/${a.entity_id}` :
        a.entity_type === "property" ? `/properties/${a.entity_id}` :
        a.entity_type === "match" ? `/matches/${a.entity_id}` :
        "/notifications"
      router.push(link)
    }
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

      {/* Notification/Activity List */}
      <div className="space-y-8 pt-2">
        {Object.entries(groupedItems).map(([group, list]) => {
          if (list.length === 0) return null
          return (
            <div key={group} className="space-y-4">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                {group}
              </h2>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 divide-y divide-slate-50">
                {list.map(item => (
                  <ActivityOrNotificationItem
                    key={item.id}
                    item={item}
                    onClick={() => handleItemClick(item)}
                    onToggleRead={async (e) => {
                      e.stopPropagation()
                      if (item.itemType === 'notification' && !item.is_read) await markRead(item.id)
                    }}
                    onDismiss={(e) => dismiss(item.id, e)}
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

function ActivityOrNotificationItem({
  item,
  onClick,
  onToggleRead,
  onDismiss,
}: {
  item: any
  onClick: () => void
  onToggleRead: (e: React.MouseEvent) => void
  onDismiss: (e: React.MouseEvent) => void
}) {
  const isNotification = item.itemType === 'notification'

  const IconMap = {
    new_client: UserPlus,
    match_found: Sparkles,
    property_update: Building2,
    team_member: Users,
    system: Bell,
    upload: UserPlus,
    update: Building2,
    delete: Inbox,
    match: Sparkles,
  }

  const Icon = (IconMap as any)[item.type || item.action_type] ?? Bell

  const iconColorsMap = {
    new_client: "bg-purple-50 text-purple-600",
    match_found: "bg-amber-50 text-amber-600",
    property_update: "bg-blue-50 text-blue-600",
    team_member: "bg-teal-50 text-teal-600",
    system: "bg-slate-50 text-slate-600",
    upload: "bg-emerald-50 text-emerald-600",
    update: "bg-blue-50 text-blue-600",
    delete: "bg-red-50 text-red-600",
    match: "bg-amber-50 text-amber-600",
  }
  const iconColors = (iconColorsMap as any)[item.type || item.action_type] ?? "bg-slate-50 text-slate-600"

  const title = isNotification ? item.title : `${item.profiles?.full_name || 'System'}`
  const message = isNotification ? item.message : 
    `${item.action_type === 'upload' ? 'Added new' : item.action_type === 'update' ? 'Updated' : 'Removed'} ${item.metadata?.title || item.entity_type}`

  const isClickable = isNotification || item.action_type !== 'delete'

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={cn(
        "flex gap-4 p-4 transition-all group relative",
        isClickable ? "cursor-pointer" : "cursor-default",
        isNotification && !item.is_read
          ? "bg-emerald-50/20 border-l-2 border-emerald-400"
          : "hover:bg-slate-50 border-l-2 border-transparent"
      )}
    >
      <div className={cn("w-11 h-11 rounded-full flex items-center justify-center shrink-0", iconColors)}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 space-y-0.5">
        <p className={cn("text-sm font-bold", (isNotification && item.is_read) ? "text-slate-600" : "text-slate-900")}>
          {title}
        </p>
        <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
          {message}
        </p>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight block pt-1">
          {formatRelativeTime(item.created_at)}
        </span>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        {isNotification && !item.is_read && (
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse mt-1" />
        )}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-white/80 backdrop-blur px-1 py-1 rounded-lg border border-slate-100 shadow-sm">
          <TooltipProvider>
            {isNotification && (
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
            )}
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
