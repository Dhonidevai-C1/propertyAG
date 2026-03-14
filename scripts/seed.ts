/**
 * Run once after schema setup: npx ts-node -r tsconfig-paths/register scripts/seed.ts
 */

import { supabaseAdmin } from "@/lib/supabase/admin"

async function seed() {
  console.log("Starting seed process...")

  // 1. Create Agency
  const { data: agency, error: agencyError } = await supabaseAdmin
    .from('agencies')
    .insert({
      name: "Sharma Properties, Jaipur",
      address: "Vaishali Nagar, Jaipur",
      contact_phone: "+91 9876543210",
      contact_email: "contact@sharmaprop.com",
      rera_number: "RAJ/P/2024/1234"
    })
    .select()
    .single()

  if (agencyError) {
    console.error("Error creating agency:", agencyError)
    return
  }
  console.log("Created agency:", agency.name)

  // 2. Create Admin User
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: "admin@sharmaprop.com",
    password: "Admin@1234",
    email_confirm: true,
    user_metadata: {
      full_name: "Ravi Kumar",
      role: "admin",
      agency_id: agency.id
    }
  })

  if (authError) {
    console.error("Error creating auth user:", authError)
    // Note: If user exists, we continue
  } else {
    console.log("Created auth user:", authUser.user.email)
  }

  // Reference for inserts
  const adminId = authUser?.user?.id

  // 3. Insert 5 Sample Properties
  const properties = [
    {
      agency_id: agency.id,
      created_by: adminId,
      title: "Luxury 3BHK Apartment",
      property_type: "apartment" as const,
      status: "available" as const,
      price: 8500000,
      locality: "Vaishali Nagar",
      city: "Jaipur",
      bhk: 3,
      bedrooms: 3,
      bathrooms: 3,
      area_sqft: 1450,
      furnishing: "semi_furnished" as const,
      cover_image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
    },
    {
      agency_id: agency.id,
      created_by: adminId,
      title: "Green View Residency",
      property_type: "apartment" as const,
      status: "available" as const,
      price: 4800000,
      locality: "Mansarovar",
      city: "Jaipur",
      bhk: 2,
      bedrooms: 2,
      bathrooms: 2,
      area_sqft: 1100,
      furnishing: "unfurnished" as const,
      cover_image_url: "https://images.unsplash.com/photo-1460317442991-0ec239f636a7?auto=format&fit=crop&w=800&q=80"
    },
    {
      agency_id: agency.id,
      created_by: adminId,
      title: "Royal Heritage Villa",
      property_type: "villa" as const,
      status: "available" as const,
      price: 22000000,
      locality: "Bani Park",
      city: "Jaipur",
      bhk: 4,
      bedrooms: 4,
      bathrooms: 4,
      area_sqft: 3200,
      furnishing: "fully_furnished" as const,
      cover_image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
    },
    {
      agency_id: agency.id,
      created_by: adminId,
      title: "Sky Heights Annex",
      property_type: "apartment" as const,
      status: "available" as const,
      price: 3250000,
      locality: "Jagatpura",
      city: "Jaipur",
      bhk: 1,
      bedrooms: 1,
      bathrooms: 1,
      area_sqft: 650,
      furnishing: "semi_furnished" as const,
      cover_image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
    },
    {
      agency_id: agency.id,
      created_by: adminId,
      title: "Modern Duplex House",
      property_type: "independent_house" as const,
      status: "available" as const,
      price: 11000000,
      locality: "Malviya Nagar",
      city: "Jaipur",
      bhk: 3,
      bedrooms: 3,
      bathrooms: 3,
      area_sqft: 1800,
      furnishing: "unfurnished" as const,
      cover_image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"
    }
  ]

  const { error: propError } = await supabaseAdmin.from('properties').insert(properties)
  if (propError) console.error("Error seeding properties:", propError)
  else console.log("Seeded 5 sample properties")

  // 4. Insert 4 Sample Clients
  const clients = [
    {
      agency_id: agency.id,
      created_by: adminId,
      full_name: "Priya Sharma",
      phone: "+91 9123456789",
      email: "priya@example.com",
      source: "walk_in" as const,
      status: "active" as const,
      looking_for: "buy" as const,
      property_types: ["apartment"],
      preferred_bhks: [3],
      preferred_locations: ["Vaishali Nagar", "C-Scheme"],
      budget_min: 6000000,
      budget_max: 12000000,
      min_bedrooms: 3
    },
    {
      agency_id: agency.id,
      created_by: adminId,
      full_name: "Anil Chandra",
      phone: "+91 9234567890",
      email: "anil@example.com",
      source: "referral" as const,
      status: "active" as const,
      looking_for: "buy" as const,
      property_types: ["apartment"],
      preferred_bhks: [2],
      preferred_locations: ["Mansarovar"],
      budget_min: 4000000,
      budget_max: 6000000,
      min_bedrooms: 2
    },
    {
      agency_id: agency.id,
      created_by: adminId,
      full_name: "Sneha Kapoor",
      phone: "+91 9345678901",
      email: "sneha@example.com",
      status: "active" as const,
      looking_for: "buy" as const,
      property_types: ["villa", "independent_house"],
      preferred_bhks: [4, 5],
      preferred_locations: ["Bani Park", "Civil Lines"],
      budget_min: 15000000,
      budget_max: 25000000,
      min_bedrooms: 4
    },
    {
      agency_id: agency.id,
      created_by: adminId,
      full_name: "Rahul Singh",
      phone: "+91 9456789012",
      email: "rahul@example.com",
      status: "active" as const,
      looking_for: "buy" as const,
      property_types: ["apartment"],
      preferred_bhks: [1, 2],
      preferred_locations: ["Jagatpura"],
      budget_min: 3000000,
      budget_max: 4500000,
      min_bedrooms: 1
    }
  ]

  const { error: clientError } = await supabaseAdmin.from('clients').insert(clients)
  if (clientError) console.error("Error seeding clients:", clientError)
  else console.log("Seeded 4 sample clients")

  console.log("Seed complete!")
}

seed()
