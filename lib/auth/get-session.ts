import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { type Profile } from '@/lib/types/database'

export const getSession = cache(async () => {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) return null
  return session
})

export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) return null
  return user
})

export async function requireSession() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

export const getProfile = cache(async () => {
  const user = await getUser()
  if (!user) return null

  const supabase = await createClient()
  
  // Fetch profile joined with agency subscription info
  const { data, error } = await supabase
    .from('profiles')
    .select('*, agencies(subscription_status, subscription_end_date, plan_type)')
    .eq('id', user.id)
    .single()

  const isMasterEmail = user.email === 'typepilotkeyboard@gmail.com'

  if (error || !data) {
    // FALLBACK: If the profile is missing in DB but it's the master email, 
    // grant temporary master access so they can fix account setup.
    if (isMasterEmail) {
      return {
        id: user.id,
        email: user.email,
        full_name: 'PropDesk Admin',
        role: 'admin',
        is_super_admin: true,
        subscription_status: 'active',
        plan_type: 'pro',
        created_at: new Date().toISOString(),
        is_active: true
      } as any
    }
    return null
  }

  // Flatten the agency data for easier access
  const agency = (data as any).agencies
  
  // Safety check for super admin
  const isSuperAdmin = isMasterEmail || (data as any).is_super_admin

  const profile = {
    ...data,
    subscription_status: agency?.subscription_status || (isSuperAdmin ? 'active' : 'trial'),
    subscription_end_date: agency?.subscription_end_date || null,
    plan_type: agency?.plan_type || (isSuperAdmin ? 'pro' : 'free'),
    is_super_admin: isSuperAdmin
  }

  return profile as Profile & { 
    subscription_status: string, 
    subscription_end_date: string, 
    plan_type: string 
  }
})

import { headers } from 'next/headers'

export async function requireProfile() {
  const user = await getUser()
  const headerList = await headers()
  const isApiRequest = headerList.get('accept')?.includes('json') || headerList.get('content-type')?.includes('json')

  if (!user) {
    if (isApiRequest) {
      throw new Error('UNAUTHORIZED')
    }
    redirect('/login')
  }

  const profile = await getProfile()
  
  if (!profile) {
    if (isApiRequest) {
      throw new Error('PROFILE_MISSING')
    }
    // Break the loop: If user is logged in but profile is missing, 
    // don't redirect to /login (which redirects back to /dashboard).
    // Instead, send them to the setup/invite acceptance page.
    redirect('/accept-invite#syncing=true')
  }

  // Super Admin Bypass
  if (profile.is_super_admin) return profile

  // Subscription Locking
  if (profile.subscription_status === 'expired') {
    if (isApiRequest) throw new Error('SUBSCRIPTION_EXPIRED')
    redirect('/subscription-expired')
  }

  return profile
}

export async function requireSuperAdmin() {
  const profile = await requireProfile()
  if (!profile.is_super_admin) {
    redirect('/dashboard')
  }
  return profile
}
