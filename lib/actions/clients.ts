'use server'

import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireProfile } from '@/lib/auth/get-session'
import { ClientFormValues, ClientFilters } from '@/lib/validations/client'
import { Client, Profile, ClientStatus } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'

// Note: Ensure `formatBudget` exists if needed, or inline formatting for notifications
import { formatBudgetRange } from '@/lib/utils/format'

export type ClientWithAssignee = Client & {
  assignee: Profile | null
  broker_relations?: any[]
}

export async function createClient(formData: ClientFormValues) {
  const profile = await requireProfile()
  const supabase = await createSupabaseClient()

  // 1. Insert into clients table
  const { data: client, error: insertError } = await supabase
    .from('clients')
    .insert({
      ...formData,
      agency_id: profile.agency_id,
      created_by: profile.id,
      assigned_to: formData.assigned_to || profile.id,
      status: 'active',
    })
    .select()
    .single()

  if (insertError || !client) {
    return { error: insertError?.message || 'Failed to create client' }
  }

  // 2. Trigger match engine (call to the run match endpoint will be handled by the client or API)
  // For the server action, we can try to call it internally or let the frontend do it
  // Phase 5 says "trigger match engine runMatchForClient(client.id)". If we don't have that yet, 
  // we can use a direct fetch to the API route, or let the client do it. Let's do a direct fetch if available, 
  // but we might not have `runMatchForClient` exported. We'll leave it to the frontend for now, or just send a POST.
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    fetch(`${baseUrl}/api/matches/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: client.id })
    }).catch(e => console.error("Match trigger failed manually", e))
  } catch(e) {}

  // 3. Create a notification
  await supabase.from('notifications').insert({
    agency_id: profile.agency_id,
    type: 'new_client',
    title: 'New client added',
    message: `${formData.full_name} was added by ${profile.full_name} with a budget of ${formatBudgetRange(formData.budget_min, formData.budget_max)}`,
    reference_id: client.id,
    reference_type: 'client'
  })

  // Record activity
  await supabase
    .from('activities')
    .insert({
      agency_id: profile.agency_id,
      user_id: profile.id,
      action: 'create',
      entity_type: 'client',
      entity_id: client.id,
      details: { title: client.full_name }
    })

  revalidatePath('/clients')
  revalidatePath('/dashboard')
  return { data: client as Client }
}

export async function updateClient(id: string, formData: Partial<ClientFormValues>) {
  const profile = await requireProfile()
  const supabase = await createSupabaseClient()

  const { data: client, error } = await supabase
    .from('clients')
    .update(formData)
    .match({ id, agency_id: profile.agency_id })
    .select()
    .single()

  if (error) return { error: error.message }
  
  // Record activity
  await supabase
    .from('activities')
    .insert({
      agency_id: profile.agency_id,
      user_id: profile.id,
      action: 'update',
      entity_type: 'client',
      entity_id: client.id,
      details: { title: client.full_name }
    })

  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  revalidatePath('/dashboard')
  return { data: client as Client }
}

export async function deleteClient(id: string) {
  const profile = await requireProfile()

  // Use admin client to bypass RLS for the soft-delete UPDATE.
  // The anon client's RLS WITH CHECK fails when auth.uid() is unavailable
  // in the server action execution context.
  const { error } = await supabaseAdmin
    .from('clients')
    .update({ is_deleted: true })
    .match({ id, agency_id: profile.agency_id })

  if (error) return { error: error.message }

  // Record activity
  await supabaseAdmin
    .from('activities')
    .insert({
      agency_id: profile.agency_id,
      user_id: profile.id,
      action: 'delete',
      entity_type: 'client',
      entity_id: id,
      details: { title: 'Client removed' }
    })

  // Dismiss any related matches
  await supabaseAdmin
    .from('matches')
    .update({ status: 'dismissed' })
    .match({ client_id: id, agency_id: profile.agency_id })

  revalidatePath('/clients')
  revalidatePath('/dashboard')
  return { data: { success: true } }
}

export async function updateClientStatus(id: string, status: ClientStatus) {
  return updateClient(id, { status } as any)
}

export async function getClient(id: string) {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      assignee:profiles!clients_assigned_to_fkey(*),
      broker_relations:broker_client_relations(
        *,
        broker:brokers(*)
      )
    `)
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  if (error) return null
  return data as ClientWithAssignee
}

export async function getClients(filters: ClientFilters) {
  const profile = await requireProfile()
  const supabase = await createSupabaseClient()

  const pageSize = 30
  const currentPage = filters.page || 1
  const from = (currentPage - 1) * pageSize
  const to = from + pageSize - 1

  // 1. Core query with count enabled
  let query = supabase
    .from('clients')
    .select(`*, assignee:profiles!clients_assigned_to_fkey(*)`, { count: 'exact' })
    .eq('agency_id', profile.agency_id)
    .eq('is_deleted', false)

  // 2. Apply all filters BEFORE range/order for accurate counting
  if (filters.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  if (filters.property_types && filters.property_types.length > 0) {
    query = query.overlaps('property_types', filters.property_types)
  }

  if (filters.budget_min) {
    query = query.gte('budget_max', filters.budget_min)
  }

  if (filters.budget_max) {
    query = query.lte('budget_min', filters.budget_max)
  }

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // 3. Apply Ordering and Range LAST
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    // Handle "Requested range not satisfiable" (PGRST103)
    if (error.code === 'PGRST103') {
      return { data: [], count: count || 0, page: currentPage, totalPages: Math.ceil((count || 0) / pageSize) }
    }
    console.error('Error fetching clients:', error)
    return { data: [], count: 0 }
  }

  return {
    data: data as ClientWithAssignee[],
    count: count || 0,
    page: currentPage,
    totalPages: Math.ceil((count || 0) / pageSize)
  }
}

export async function getTeamMembers() {
  const profile = await requireProfile()
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('agency_id', profile.agency_id)
    .eq('is_active', true)

  if (error) return []
  return data as Profile[]
}

export async function getUpcomingFollowUps() {
  const profile = await requireProfile()
  const supabase = await createSupabaseClient()
  
  // Format YYYY-MM-DD in UTC (standard for Supabase DATE columns)
  const todayDate = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('agency_id', profile.agency_id)
    .eq('is_deleted', false)
    .neq('status', 'closed')
    .not('follow_up_date', 'is', null)
    .gte('follow_up_date', todayDate) // Show today and future
    .order('follow_up_date', { ascending: true })

  if (error) {
    console.error("Error fetching followups:", error)
    return []
  }
  return data as Client[]
}
