'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { type User, type AuthChangeEvent, type Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { type Profile, type Agency, type UserRole } from '@/lib/types/database'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  agency: Agency | null
  isLoading: boolean
  isReadOnly: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [agency, setAgency] = useState<Agency | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getInitialSession() {
      const { data: { user: initialUser } } = await supabase.auth.getUser()
      setUser(initialUser)
      
      if (initialUser) {
        await fetchProfileAndAgency(initialUser.id)
      }
      setIsLoading(false)
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (event === 'SIGNED_IN' && currentUser) {
        await fetchProfileAndAgency(currentUser.id)
      } else if (event === 'SIGNED_OUT') {
        setProfile(null)
        setAgency(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchProfileAndAgency(userId: string) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*, agency:agencies(*)')
      .eq('id', userId)
      .single()

    if (profileData) {
      const { agency: agencyData, ...restProfile } = profileData as any
      const isSuperAdmin = restProfile.email === 'typepilotkeyboard@gmail.com' || restProfile.is_super_admin
      
      setProfile({
        ...restProfile,
        is_super_admin: isSuperAdmin
      } as Profile)
      setAgency(agencyData as Agency)
    }
  }

  const isReadOnly = agency?.subscription_status === 'paused' && !profile?.is_super_admin

  return (
    <AuthContext.Provider value={{ user, profile, agency, isLoading, isReadOnly }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useProfile() {
  const { profile, isLoading } = useAuth()
  if (!isLoading && !profile) {
    throw new Error('useProfile must be used with an authenticated user profile')
  }
  return profile
}

export function useRole() {
  const profile = useProfile()
  const role = profile?.role as UserRole

  return {
    role,
    isAdmin: role === 'admin',
    isAgent: role === 'agent',
    isViewer: role === 'viewer'
  }
}
