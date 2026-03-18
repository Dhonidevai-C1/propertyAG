'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { useRealtimeNotifications } from '@/lib/hooks/use-realtime-notifications'
import { Notification } from '@/lib/types/database'

interface NotificationsContextValue {
  notifications: Notification[]
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
  unreadCount: number
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  setNotifications: () => {},
  unreadCount: 0,
  markRead: async () => {},
  markAllRead: async () => {},
})

export function useNotifications() {
  return useContext(NotificationsContext)
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth()
  const { notifications, setNotifications, unreadCount, markRead, markAllRead } =
    useRealtimeNotifications(profile?.id, [], 0)

  return (
    <NotificationsContext.Provider
      value={{ notifications, setNotifications, unreadCount, markRead, markAllRead }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}
