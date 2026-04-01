import { Client, Property } from '@/lib/types/database'

export interface MatchScoreBreakdown {
  budget: number     // 0–40
  location: number   // 0–20
  property_type: number // 0–20
  bedrooms: number   // 0–10
  area: number       // 0–10
}

export interface MatchScoreResult {
  score: number
  breakdown: MatchScoreBreakdown
  qualifies: boolean  // score >= 60
}

/**
 * Score how well a property matches a client's requirements.
 * Total: 100 pts. Qualifies if score >= 60.
 */
export function scoreMatch(client: Client, property: Property): MatchScoreResult {
  // If looking for rent but property is for sale, or vice-versa, immediate qualification failure (0 score).
  const isRentMismatch = client.looking_for === "rent" && property.listing_type === "sale"
  const isBuyMismatch = client.looking_for === "buy" && property.listing_type === "rent"
  
  if (isRentMismatch || isBuyMismatch) {
    return {
      score: 0,
      breakdown: { budget: 0, location: 0, property_type: 0, bedrooms: 0, area: 0 },
      qualifies: false
    }
  }
  // ── Budget (40 pts) ─────────────────────────────────────
  let budget = 0
  if (client.budget_min != null && client.budget_max != null) {
    if (property.price >= client.budget_min && property.price <= client.budget_max) {
      budget = 40
    } else if (property.price <= client.budget_max * 1.1) {
      budget = 20 // within 10% above max
    }
  } else if (client.budget_max != null) {
    if (property.price <= client.budget_max) budget = 40
    else if (property.price <= client.budget_max * 1.1) budget = 20
  }

  // ── Location (20 pts) ────────────────────────────────────
  let location = 0
  if (!client.preferred_locations || client.preferred_locations.length === 0) {
    location = 20 // no preference → full points
  } else {
    const propLocations = [
      property.locality?.toLowerCase().trim() ?? '',
      property.city?.toLowerCase().trim() ?? '',
    ]
    const matched = client.preferred_locations.some(pref => {
      const p = pref.toLowerCase().trim()
      return propLocations.some(loc => loc.includes(p) || p.includes(loc))
    })
    if (matched) location = 20
  }

  // ── Property Type (20 pts) ───────────────────────────────
  let property_type = 20
  if (client.property_types && client.property_types.length > 0) {
    if (!client.property_types.includes(property.property_type)) {
      property_type = 0
    } else if (
      property.property_type === "commercial" &&
      client.preferred_commercial_type &&
      property.commercial_type &&
      client.preferred_commercial_type !== property.commercial_type
    ) {
      // If they explicitly wanted a specific commercial type and it doesn't match, penalyze heavily
      property_type = 0
    }
  }

  // ── Bedrooms (10 pts) ────────────────────────────────────
  const bedrooms =
    !client.min_bedrooms || property.bedrooms >= client.min_bedrooms ? 10 : 0

  // ── Area (10 pts) ────────────────────────────────────────
  let area = 0
  if (!client.min_area_sqft) {
    area = 10
  } else {
    // Normalize both to sq ft for comparison
    const normalizeToSqft = (val: any, unit: string = 'sqft') => {
      const numVal = Number(val)
      if (isNaN(numVal)) return 0
      if (unit === 'sqyard') return numVal * 9
      if (unit === 'sqm') return numVal * 10.7639
      return numVal
    }

    const clientMinSqft = normalizeToSqft(client.min_area_sqft, client.min_area_unit)
    const propertySqft = property.area_sqft ? normalizeToSqft(property.area_sqft, property.area_unit) : null

    if (propertySqft != null) {
      if (propertySqft >= clientMinSqft) {
        area = 10
      } else if (propertySqft >= clientMinSqft * 0.9) {
        area = 5
      }
    }
  }

  const score = budget + location + property_type + bedrooms + area

  return {
    score,
    breakdown: { budget, location, property_type, bedrooms, area },
    qualifies: score >= 60,
  }
}
