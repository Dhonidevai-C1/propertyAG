'use server'

import { createClient } from '@/lib/supabase/server'
import { requireProfile } from '@/lib/auth/get-session'

export interface Activity {
  id: string
  created_at: string
  action: 'create' | 'update' | 'delete' | 'match' | 'view'
  entity_type: 'property' | 'client' | 'match' | 'broker'
  entity_id: string
  details: any
  profiles: {
    full_name: string
  }
}

export async function getRecentActivities(limit = 10): Promise<Activity[]> {
  const profile = await requireProfile()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      profiles:user_id(full_name)
    `)
    .eq('agency_id', profile.agency_id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    if (error.code !== 'PGRST116') { // Not found / empty is fine
      console.error('getRecentActivities error:', error)
    }
    return []
  }

  return data as unknown as Activity[]
}
