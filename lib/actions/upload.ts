'use server'

import { createClient } from "@supabase/supabase-js"

/**
 * Server Action to handle image uploads to Supabase Storage.
 * Uses SERVICE_ROLE_KEY to bypass any browser-side authentication or connectivity issues.
 */
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function uploadImageAction(base64Data: string) {
  try {
    // 1. Parse base64
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 string')
    }

    const type = matches[1]
    const buffer = Buffer.from(matches[2], 'base64')
    const fileExt = type.split('/')[1] || 'jpg'
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

    // 2. Upload to Storage via Admin Client (stateless & super fast)
    const { data, error } = await supabaseAdmin.storage
      .from('property-images')
      .upload(fileName, buffer, {
        contentType: type,
        upsert: true
      })

    if (error) {
       console.error("Storage upload error:", error)
       throw new Error(error.message)
    }

    // 3. Get Public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('property-images')
      .getPublicUrl(fileName)

    return { url: publicUrl, error: null }
  } catch (error: any) {
    console.error('Server-side upload failure:', error)
    return { url: null, error: error.message || 'Failed to upload image' }
  }
}
