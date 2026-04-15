'use server'

import { createClient } from '@/lib/supabase/server'
import { requireProfile } from '@/lib/auth/get-session'
import { getDashboardStats, getRecentNotifications, getHotMatches } from '@/lib/actions/matches'
import { getRecentActivities } from '@/lib/actions/activities'
import { getProperties } from '@/lib/actions/properties'
import { getUpcomingFollowUps } from '@/lib/actions/clients'

export async function getDashboardData() {
  const profile = await requireProfile()
  
  // We can still use Promise.all here, but now that requireProfile is cached,
  // the initial auth check happens only once for the whole batch.
  // Furthermore, we are grouping them in a single server action to minimize 
  // the number of separate 'use server' entry points called by the client.
  const [stats, notifications, recentActivities, recentProperties, followUps, hotMatches] = await Promise.all([
    getDashboardStats(),
    getRecentNotifications(4),
    getRecentActivities(6),
    getProperties({ limit: 6 } as any),
    getUpcomingFollowUps(),
    getHotMatches(3)
  ])

  return {
    profile,
    stats,
    notifications,
    recentActivities,
    recentProperties,
    followUps,
    hotMatches
  }
}
