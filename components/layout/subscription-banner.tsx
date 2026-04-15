"use client"

import React, { useState } from "react"
import { AlertCircle, Clock, CreditCard, ShieldAlert, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { differenceInDays, parseISO } from "date-fns"

interface SubscriptionBannerProps {
  status: string
  endDate: string | null
  planType: string
  isSuperAdmin?: boolean
}

export function SubscriptionBanner({ status, endDate, planType, isSuperAdmin }: SubscriptionBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Super Admin and Active users with plenty of time don't see the banner
  if (isSuperAdmin || !isVisible) return null

  if (!endDate) return null

  const daysLeft = differenceInDays(parseISO(endDate), new Date())

  // Logic: 
  // 1. Trial: Always show
  // 2. Active: Only show if <= 3 days left
  const isTrial = status === 'trial'
  const isPaid = status === 'active'
  const isPaused = status === 'paused'

  const shouldShow = isTrial || isPaused || (isPaid && daysLeft <= 3)

  if (!shouldShow) return null

  const isWarning = daysLeft <= 3 && !isPaused

  return (
    <div className={cn(
      "w-full px-6 py-2 flex items-center justify-between gap-3 text-sm font-bold transition-all animate-in fade-in slide-in-from-top-2 relative",
      isPaused ? "bg-slate-900 text-slate-100" :
        isWarning ? "bg-red-600 text-white animate-pulse" :
          "bg-emerald-500 text-white"
    )}>
      <div className="flex-1 flex items-center justify-center gap-3">
        {isPaused ? (
          <>
            <ShieldAlert className="w-4 h-4" />
            <span>Subscription Paused: You are in Read-Only mode. Contact Developer to resume.</span>
          </>
        ) : status === 'trial' ? (
          <>
            <Clock className="w-4 h-4" />
            <span>{daysLeft <= 0 ? "Last day" : `${daysLeft} days left`} of your Free Trial. Upgrade now to avoid interruption!</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>Subscription expires in {daysLeft} days. Renew now to maintain access!</span>
          </>
        )}

        <button
          onClick={() => window.open('https://wa.me/918271301911?text=I%20want%20to%20renew%20my%20PropDesk%20subscription', '_blank')}
          className="ml-4 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-2 ring-1 ring-white/30 cursor-pointer"
        >
          <CreditCard className="w-3.5 h-3.5" />
          Renew / Upgrade
        </button>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
        aria-label="Close banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
