import React from "react"
import { getRecentActivities } from "@/lib/actions/activities"
import { getMatches } from "@/lib/actions/matches"
import { NotificationsClient } from "@/components/notifications/notifications-client"

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  // Fetch data on the server
  // We limit to 50 to keep it efficient as requested
  const [activities, matches] = await Promise.all([
    getRecentActivities(50),
    getMatches({ minScore: 50 })
  ])

  return <NotificationsClient initialActivities={activities} initialMatches={matches} />
}
