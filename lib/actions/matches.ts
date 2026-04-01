'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireProfile } from '@/lib/auth/get-session'
import { MatchWithDetails, MatchStatus, Notification } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'
import { formatDistanceToNow, startOfWeek } from 'date-fns'

export interface MatchFilters {
  minScore?: number
  status?: string
  search?: string
  sortBy?: string
}

// ── getMatches ──────────────────────────────────────────────
export async function getMatches(filters: MatchFilters = {}): Promise<MatchWithDetails[]> {
  const profile = await requireProfile()
  const supabase = await createClient()

  let query = supabase
    .from('matches')
    .select(`
      *,
      client:clients!matches_client_id_fkey(*),
      property:properties!matches_property_id_fkey(*)
    `)
    .eq('agency_id', profile.agency_id)
    .neq('status', 'dismissed')

  if (filters.minScore) {
    query = query.gte('score', filters.minScore)
  } else {
    // Default to 50% as requested
    query = query.gte('score', 50)
  }
  if (filters.status && filters.status !== 'All' && filters.status !== 'all') {
    query = query.eq('status', filters.status.toLowerCase())
  }

  const { data, error } = await query.order('score', { ascending: false })

  if (error) {
    console.error('getMatches error:', error)
    return []
  }

  let results = (data || []) as unknown as MatchWithDetails[]

  // Search across client name and property title
  if (filters.search) {
    const q = filters.search.toLowerCase()
    results = results.filter(m =>
      m.client?.full_name?.toLowerCase().includes(q) ||
      m.property?.title?.toLowerCase().includes(q) ||
      m.property?.city?.toLowerCase().includes(q)
    )
  }

  // Sort
  if (filters.sortBy === 'Newest first') {
    results.sort((a, b) => new Date(b.matched_at).getTime() - new Date(a.matched_at).getTime())
  } else if (filters.sortBy === 'Client name') {
    results.sort((a, b) => (a.client?.full_name ?? '').localeCompare(b.client?.full_name ?? ''))
  } else if (filters.sortBy === 'Property price') {
    results.sort((a, b) => (b.property?.price ?? 0) - (a.property?.price ?? 0))
  }
  // default: already sorted by score desc from DB

  return results
}

// ── getMatchesForClient ─────────────────────────────────────
export async function getMatchesForClient(clientId: string): Promise<MatchWithDetails[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('matches')
    .select(`*, client:clients!matches_client_id_fkey(*), property:properties!matches_property_id_fkey(*)`)
    .eq('client_id', clientId)
    .neq('status', 'dismissed')
    .order('score', { ascending: false })

  if (error) return []
  return (data || []) as unknown as MatchWithDetails[]
}

// ── getMatchesForProperty ───────────────────────────────────
export async function getMatchesForProperty(propertyId: string): Promise<MatchWithDetails[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('matches')
    .select(`*, client:clients!matches_client_id_fkey(*), property:properties!matches_property_id_fkey(*)`)
    .eq('property_id', propertyId)
    .neq('status', 'dismissed')
    .order('score', { ascending: false })

  if (error) return []
  return (data || []) as unknown as MatchWithDetails[]
}

// ── getMatch ────────────────────────────────────────────────
export async function getMatch(matchId: string): Promise<MatchWithDetails | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('matches')
    .select(`*, client:clients!matches_client_id_fkey(*), property:properties!matches_property_id_fkey(*)`)
    .eq('id', matchId)
    .single()

  if (error || !data) return null
  return data as unknown as MatchWithDetails
}

// ── updateMatchStatus ───────────────────────────────────────
export async function updateMatchStatus(matchId: string, status: MatchStatus) {
  const profile = await requireProfile()

  const { error } = await supabaseAdmin
    .from('matches')
    .update({ status })
    .eq('id', matchId)
    .eq('agency_id', profile.agency_id)

  if (error) return { error: error.message }

  revalidatePath('/matches')
  revalidatePath(`/matches/${matchId}`)
  return { data: { success: true } }
}

// ── getDashboardStats ───────────────────────────────────────
export async function getDashboardStats() {
  const profile = await requireProfile()
  const supabase = await createClient()

  const weekStart = startOfWeek(new Date()).toISOString()

  const [propertiesRes, clientsRes, matchesRes, followupsRes] = await Promise.all([
    supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', profile.agency_id)
      .eq('is_deleted', false),
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', profile.agency_id)
      .eq('is_deleted', false)
      .eq('status', 'active'),
    supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', profile.agency_id)
      .gte('matched_at', weekStart)
      .gte('score', 50),
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', profile.agency_id)
      .eq('is_deleted', false)
      .eq('status', 'active')
      .lte('follow_up_date', new Date().toISOString().slice(0, 10))
      .not('follow_up_date', 'is', null),
  ])

  return {
    properties: propertiesRes.count ?? 0,
    clients: clientsRes.count ?? 0,
    matchesThisWeek: matchesRes.count ?? 0,
    pendingFollowups: followupsRes.count ?? 0,
  }
}

// ── getRecentNotifications ──────────────────────────────────
export async function getRecentNotifications(limit = 8): Promise<Notification[]> {
  const profile = await requireProfile()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return (data || []) as Notification[]
}

// ── getUnreadNotificationCount ──────────────────────────────
export async function getUnreadNotificationCount(): Promise<number> {
  const profile = await requireProfile()
  const supabase = await createClient()

  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('is_read', false)

  return count ?? 0
}

// ── markNotificationRead ────────────────────────────────────
export async function markNotificationRead(id: string) {
  const profile = await requireProfile()
  await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', profile.id)

  revalidatePath('/notifications')
  return { data: { success: true } }
}

// ── markAllNotificationsRead ────────────────────────────────
export async function markAllNotificationsRead() {
  const profile = await requireProfile()
  await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', profile.id)

  revalidatePath('/notifications')
  return { data: { success: true } }
}

export async function ensureDailyFollowUpNotification(count: number) {
  if (count === 0) return
  
  const profile = await requireProfile()
  const supabase = await createClient()
  
  // Format YYYY-MM-DD
  const todayDate = new Date().toLocaleDateString('en-CA')
  
  // Check if we already inserted a follow-up notification today for this user
  const { data } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', profile.id)
    .eq('type', 'system')
    .like('title', '%Follow-ups due%')
    .gte('created_at', `${todayDate}T00:00:00`)
    .limit(1)
    
  if (!data || data.length === 0) {
    try {
      await supabase.from('notifications').insert({
        agency_id: profile.agency_id,
        user_id: profile.id,
        type: 'system',
        title: 'Follow-ups due today',
        message: `You have ${count} client profile(s) needing contact today. Check your dashboard widget.`,
        is_read: false
      })
    } catch (e) {}
  }
}
