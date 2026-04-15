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
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !data) return null
  return data as Profile
})

export async function requireProfile() {
  const profile = await getProfile()
  if (!profile) {
    redirect('/login')
  }
  return profile
}
