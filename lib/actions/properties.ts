'use server'

import { createClient } from '@/lib/supabase/server'
import { requireProfile } from '@/lib/auth/get-session'
import { PropertyFormValues, PropertyFilters } from '@/lib/validations/property'
import { Property, PropertyStatus } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'

export type PropertyWithCreator = Property & {
  profiles: {
    full_name: string
  }
}

export async function createProperty(formData: PropertyFormValues) {
  const profile = await requireProfile()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .insert({
      ...formData,
      agency_id: profile.agency_id,
      created_by: profile.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath('/properties')
  return { data: data as Property }
}

export async function updateProperty(id: string, formData: Partial<PropertyFormValues>) {
  const profile = await requireProfile()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .update(formData)
    .match({ id, agency_id: profile.agency_id })
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath('/properties')
  revalidatePath(`/properties/${id}`)
  return { data: data as Property }
}

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function deleteProperty(id: string) {
  const profile = await requireProfile()
  const supabase = await createClient()

  // Only admin or creator can delete
  const { data: property, error: fetchError } = await supabase
    .from('properties')
    .select('created_by, image_urls, cover_image_url')
    .eq('id', id)
    .single()

  if (fetchError) return { error: fetchError.message }
  
  if (profile.role !== 'admin' && property.created_by !== profile.id) {
    return { error: "Unauthorized to delete this property" }
  }

  // Use Admin Client to bypass RLS for soft-delete
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Delete associated images from storage
  if (property.image_urls?.length || property.cover_image_url) {
    const urlsToDelete = new Set<string>()
    if (property.cover_image_url) urlsToDelete.add(property.cover_image_url)
    if (property.image_urls) property.image_urls.forEach((url: string) => urlsToDelete.add(url))

    const pathsToDelete = Array.from(urlsToDelete)
      .map(url => {
        const prefix = '/storage/v1/object/public/property-images/'
        const idx = url.indexOf(prefix)
        return idx !== -1 ? url.slice(idx + prefix.length) : null
      })
      .filter(Boolean) as string[]

    if (pathsToDelete.length > 0) {
      await supabaseAdmin.storage.from('property-images').remove(pathsToDelete)
    }
  }

  const { error } = await supabaseAdmin
    .from('properties')
    .update({ is_deleted: true })
    .match({ id, agency_id: profile.agency_id })

  if (error) return { error: error.message }
  
  revalidatePath('/properties')
  return { data: { success: true } }
}

export async function updatePropertyStatus(id: string, status: PropertyStatus) {
  return updateProperty(id, { status } as any)
}

export async function getProperty(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .select('*, profiles:created_by(full_name)')
    .eq('id', id)
    .single()

  if (error) return null
  return data as PropertyWithCreator
}

export async function getProperties(filters: PropertyFilters) {
  const profile = await requireProfile()
  const supabase = await createClient()

  let query = supabase
    .from('properties')
    .select('*')
    .eq('agency_id', profile.agency_id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (filters.search) {
    const terms = filters.search.split(' ').filter(Boolean)
    
    terms.forEach(term => {
      const isNum = !isNaN(Number(term))
      let orQuery = `title.ilike.%${term}%,locality.ilike.%${term}%,city.ilike.%${term}%,address.ilike.%${term}%,property_type.ilike.%${term}%`
      if (isNum) {
        orQuery += `,bhk.eq.${term},bedrooms.eq.${term}`
      }
      query = query.or(orQuery)
    })
  }

  if (filters.property_type && filters.property_type !== 'all') {
    query = query.eq('property_type', filters.property_type)
  }

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters.listing_type && filters.listing_type !== 'all') {
    query = query.eq('listing_type', filters.listing_type)
  }

  if (filters.approval_type && filters.approval_type !== 'all') {
    query = query.eq('approval_type', filters.approval_type)
  }

  if (filters.bedrooms) {
    query = query.gte('bedrooms', filters.bedrooms)
  }

  if (filters.price_min) {
    query = query.gte('price', filters.price_min)
  }

  if (filters.price_max) {
    query = query.lte('price', filters.price_max)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching properties:', error)
    return []
  }

  return data as Property[]
}
