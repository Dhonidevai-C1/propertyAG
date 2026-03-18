'use server'

import { requireProfile } from '@/lib/auth/get-session'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { UserRole, Profile } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'

export async function getTeamMembers(): Promise<Profile[]> {
  const profile = await requireProfile()
  if (!profile.agency_id) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('agency_id', profile.agency_id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) return []
  return data as Profile[]
}

export async function updateMemberRole(
  memberId: string,
  role: UserRole
): Promise<{ error?: string }> {
  const profile = await requireProfile()
  if (profile.role !== 'admin') return { error: 'Only admins can change roles' }
  if (memberId === profile.id) return { error: 'You cannot change your own role' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', memberId)
    .eq('agency_id', profile.agency_id!)

  if (error) return { error: error.message }
  revalidatePath('/team')
  return {}
}

export async function deactivateMember(memberId: string): Promise<{ error?: string }> {
  const profile = await requireProfile()
  if (profile.role !== 'admin') return { error: 'Only admins can deactivate members' }
  if (memberId === profile.id) return { error: 'You cannot deactivate yourself' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', memberId)
    .eq('agency_id', profile.agency_id!)

  if (error) return { error: error.message }
  revalidatePath('/team')
  return {}
}

export async function removeMember(memberId: string): Promise<{ error?: string }> {
  const profile = await requireProfile()
  if (profile.role !== 'admin') return { error: 'Only admins can remove members' }
  if (memberId === profile.id) return { error: 'You cannot remove yourself' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ agency_id: null, is_active: false, updated_at: new Date().toISOString() })
    .eq('id', memberId)
    .eq('agency_id', profile.agency_id!)

  if (error) return { error: error.message }
  revalidatePath('/team')
  return {}
}
