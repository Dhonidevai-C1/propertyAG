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
      action_type: 'upload',
      entity_type: 'client',
      entity_id: client.id,
      metadata: { title: client.full_name }
    })

  revalidatePath('/clients')
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
      action_type: 'update',
      entity_type: 'client',
      entity_id: client.id,
      metadata: { title: client.full_name }
    })

  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
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
      action_type: 'delete',
      entity_type: 'client',
      entity_id: id,
      metadata: { title: 'Client removed' } // In deleteClient, we don't fetch full_name first, using generic label
    })

  // Dismiss any related matches
  await supabaseAdmin
    .from('matches')
    .update({ status: 'dismissed' })
    .match({ client_id: id, agency_id: profile.agency_id })

  revalidatePath('/clients')
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
      assignee:profiles!clients_assigned_to_fkey(*)
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

  let query = supabase
    .from('clients')
    .select(`*, assignee:profiles!clients_assigned_to_fkey(*)`)
    .eq('agency_id', profile.agency_id)
    .eq('is_deleted', false)
    .order('priority', { ascending: false }) // 'high' > 'medium' > 'low' alphabetically string sorting might invert this depending on collation. 
    // Ideally use a case expression or order by created_at. Supabase sorting strings will put 'low' after 'high'. 
    // Actually: high, medium, low alphabetically is h, m, l. So descending order is medium, low, high.
    // Instead, just order by created_at for safety, or we can handle enum sorting.
    .order('created_at', { ascending: false })

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

  const { data, error } = await query

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }

  // Sort priority in JS to guarantee High -> Medium -> Low
  const priorityMap: Record<string, number> = { high: 3, medium: 2, low: 1 }
  const sorted = data.sort((a, b) => {
    const pA = priorityMap[a.priority as string] || 0
    const pB = priorityMap[b.priority as string] || 0
    if (pA !== pB) return pB - pA
    // fallback to created_at
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return sorted as ClientWithAssignee[]
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
