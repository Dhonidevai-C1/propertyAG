import { Client, Property } from '@/lib/types/database'

export interface MatchScoreBreakdown {
  budget: number     // 0–30
  location: number   // 0–10
  property_type: number // 0–40
  bedrooms: number   // 0–15 (0 for land/commercial)
  area: number       // 0–5 (20 for land/commercial)
}

export interface MatchScoreResult {
  score: number
  breakdown: MatchScoreBreakdown
  qualifies: boolean  // score >= 60
}

/**
 * Property Type Clusters for smart matching
 */
const CLUSTERS = {
  residential: ["apartment", "house", "villa", "penthouse", "studio", "farmhouse"],
  land: ["plot", "farmer_land"],
  commercial: ["commercial", "shop", "office", "showroom", "commercial_land"],
}

function getCluster(type: string): string | null {
  for (const [cluster, types] of Object.entries(CLUSTERS)) {
    if (types.includes(type)) return cluster
  }
  return null
}

/**
 * Score how well a property matches a client's requirements.
 * Total: 100 pts. Qualifies if score >= 40.
 */
export function scoreMatch(client: Client, property: Property): MatchScoreResult {
  // 0. Strict Listing Type Match (Sale vs Rent)
  const isRentMismatch = client.looking_for === "rent" && property.listing_type === "sale"
  const isBuyMismatch = client.looking_for === "buy" && property.listing_type === "rent"
  
  if (isRentMismatch || isBuyMismatch) {
    return {
      score: 0,
      breakdown: { budget: 0, location: 0, property_type: 0, bedrooms: 0, area: 0 },
      qualifies: false
    }
  }

  // 1. Property Type Cluster Match (40 pts)
  let property_type_score = 0
  if (client.property_types && client.property_types.length > 0) {
    // Exact match
    if (client.property_types.includes(property.property_type)) {
      property_type_score = 40
    } 
    // Cluster match (e.g. looking for Apartment, found Independent House)
    else {
      const propCluster = getCluster(property.property_type)
      const hasClusterMatch = client.property_types.some(t => getCluster(t) === propCluster)
      if (hasClusterMatch) {
        property_type_score = 10
      }
    }
  } else {
    property_type_score = 40 // No preference -> full points
  }

  // 2. Budget (30 pts)
  let budget_score = 0
  if (client.budget_max != null) {
    if (property.price <= client.budget_max) {
      budget_score = 30
    } else if (property.price <= client.budget_max * 1.1) {
      budget_score = 15 // within 10% above max
    }
  } else {
    budget_score = 30 // No max budget -> full points
  }

  // 3. Location (10 pts)
  let location_score = 0
  if (!client.preferred_locations || client.preferred_locations.length === 0) {
    location_score = 10 
  } else {
    const propLocations = [
      property.locality?.toLowerCase().trim() ?? '',
      property.city?.toLowerCase().trim() ?? '',
    ]
    const matched = client.preferred_locations.some(pref => {
      const p = pref.toLowerCase().trim()
      return propLocations.some(loc => loc.includes(p) || p.includes(loc))
    })
    if (matched) location_score = 10
  }

  // 4. Features: BHK & Area (20 pts total)
  let bhk_score = 0
  let area_score = 0
  
  const propCluster = getCluster(property.property_type)
  const isLandOrCommercial = propCluster === 'land' || propCluster === 'commercial'

  if (isLandOrCommercial) {
    // Area is everything (20 pts)
    bhk_score = 0
    if (!client.min_area_sqft) {
      area_score = 20
    } else {
      const clientMinSqft = normalizeToSqft(client.min_area_sqft, client.min_area_unit)
      const propertySqft = property.area_sqft ? normalizeToSqft(property.area_sqft, property.area_unit) : null
      if (propertySqft != null) {
        if (propertySqft >= clientMinSqft) area_score = 20
        else if (propertySqft >= clientMinSqft * 0.9) area_score = 10
      }
    }
  } else {
    // Residential: BHK (15 pts) + Area (5 pts)
    // 1. Check for specific BHK preferences
    let current_bhk_match = 0
    const hasPreferredBHKs = client.preferred_bhks && client.preferred_bhks.length > 0
    const propBHKConfigs = property.bhk && property.bhk.length > 0 ? property.bhk : [property.bedrooms]

    if (hasPreferredBHKs) {
      // Check if property offers any of the preferred BHK configurations
      const matchesExactly = propBHKConfigs.some(b => client.preferred_bhks.includes(b))
      if (matchesExactly) {
        current_bhk_match = 15
      } else if (property.bedrooms >= (client.min_bedrooms || 0)) {
        current_bhk_match = 10 // Satisfies min count but not the specific preferred list
      }
    } else {
      // Fallback to simple min_bedrooms check
      const matchesMin = !client.min_bedrooms || property.bedrooms >= client.min_bedrooms
      current_bhk_match = matchesMin ? 15 : 0
    }
    
    bhk_score = current_bhk_match
    
    if (!client.min_area_sqft) {
      area_score = 5
    } else {
      const clientMinSqft = normalizeToSqft(client.min_area_sqft, client.min_area_unit)
      const propertySqft = property.area_sqft ? normalizeToSqft(property.area_sqft, property.area_unit) : null
      if (propertySqft != null) {
        if (propertySqft >= clientMinSqft) area_score = 5
        else if (propertySqft >= clientMinSqft * 0.9) area_score = 2
      }
    }
  }

  const totalScore = property_type_score + budget_score + location_score + bhk_score + area_score

  return {
    score: totalScore,
    breakdown: { 
      budget: budget_score, 
      location: location_score, 
      property_type: property_type_score, 
      bedrooms: bhk_score, 
      area: area_score 
    },
    qualifies: totalScore >= 40, // Lowered qualification bar to account for fuzzy matches
  }
}

function normalizeToSqft(val: any, unit: string = 'sqft'): number {
  const numVal = Number(val)
  if (isNaN(numVal)) return 0
  if (unit === 'sqyard') return numVal * 9
  if (unit === 'sqm') return numVal * 10.7639
  if (unit === 'gaj') return numVal * 9
  if (unit === 'bigha') return numVal * 27225
  return numVal
}
