import { createClient } from '../lib/supabase/server'
import { supabaseAdmin } from '../lib/supabase/admin'

async function checkFollowUps() {
  const { data: clients, error } = await supabaseAdmin
    .from('clients')
    .select('id, full_name, follow_up_date, status, is_deleted, agency_id')
    .is('is_deleted', false)
  
  if (error) {
    console.error("DB Error:", error)
    return
  }
  
  console.log("Found clients:", clients.length)
  clients.forEach(c => {
    console.log(`- ${c.full_name}: status=${c.status}, follow_up=${c.follow_up_date}, agency=${c.agency_id}`)
  })
  
  console.log("Current Server Time:", new Date().toISOString())
  console.log("Current ISO Date:", new Date().toISOString().split('T')[0])
}

checkFollowUps()
