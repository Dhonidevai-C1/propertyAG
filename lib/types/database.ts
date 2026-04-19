export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agencies: {
        Row: Agency
        Insert: Omit<Agency, 'id' | 'created_at'>
        Update: Partial<Omit<Agency, 'id' | 'created_at'>>
      }
      profiles: {
        Row: Profile
        Insert: Profile
        Update: Partial<Profile>
      }
      properties: {
        Row: Property
        Insert: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'bhk'>
        Update: Partial<Omit<Property, 'id' | 'created_at' | 'updated_at' | 'bhk'>>
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>
      }
      matches: {
        Row: Match
        Insert: Omit<Match, 'id' | 'matched_at'>
        Update: Partial<Omit<Match, 'id' | 'matched_at'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'>
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>
      }
      brokers: {
        Row: Broker
        Insert: Omit<Broker, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Broker, 'id' | 'created_at' | 'updated_at'>>
      }
      broker_property_relations: {
        Row: BrokerPropertyRelation
        Insert: Omit<BrokerPropertyRelation, 'id' | 'created_at'>
        Update: Partial<Omit<BrokerPropertyRelation, 'id' | 'created_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      my_agency_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      broker_type: 'freelance' | 'agency' | 'other'
    }
  }
}

export type UserRole = 'admin' | 'agent' | 'viewer'
export type PropertyType = 'apartment' | 'villa' | 'independent_house' | 'plot' | 'commercial' | 'farmhouse' | 'penthouse' | 'farmer_land'
export type PropertyStatus = 'available' | 'reserved' | 'sold' | 'rented'
export type ClientStatus = 'active' | 'matched' | 'closed'
export type MatchStatus = 'new' | 'reviewed' | 'contacted' | 'dismissed'
export type FurnishingType = 'unfurnished' | 'semi_furnished' | 'fully_furnished'
export type ClientSource = 'walk_in' | 'referral' | 'social_media' | 'property_portal' | 'cold_call' | 'other'
export type NotificationType = 'new_client' | 'match_found' | 'property_update' | 'team_member' | 'system'

export interface Agency {
  id: string
  name: string
  logo_url: string | null
  website: string | null
  address: string | null
  contact_phone: string | null
  contact_email: string | null
  rera_number: string | null
  subscription_status: 'trial' | 'active' | 'paused' | 'expired'
  subscription_end_date: string | null
  plan_type: 'free' | 'monthly' | 'yearly'
  created_at: string
}

export interface Profile {
  id: string
  agency_id: string | null
  full_name: string
  email: string
  phone: string | null
  designation: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  is_super_admin: boolean
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  agency_id: string
  created_by: string | null
  title: string
  description: string | null
  property_type: PropertyType
  status: PropertyStatus
  price: number
  price_negotiable: boolean
  maintenance_charge: number | null
  address: string | null
  city: string | null
  locality: string | null
  pincode: string | null
  bhk: number[]
  bedrooms: number
  bathrooms: number
  area_sqft: number | null
  area_unit: 'sqft' | 'sqyard' | 'sqm' | 'gaj' | 'bigha'
  dimensions: string | null
  commercial_type: 'shop' | 'space' | 'land' | null
  road_info: string | null
  floor_number: string | null
  total_floors: string | null
  facing: string | null
  furnishing: FurnishingType | null
  parking: string | null
  image_urls: string[]
  cover_image_url: string | null
  is_deleted: boolean
  seller_name: string | null
  seller_phone: string | null
  approval_type: string | null
  group: string | null
  contact_type: 'client' | 'broker' | 'coloniser' | 'builder' | null
  slug: string | null
  listing_type: 'sale' | 'rent'
  is_featured: boolean
  is_new: boolean
  amenities: string[]
  balconies: number | null
  google_maps_url: string | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  agency_id: string
  created_by: string | null
  assigned_to: string | null
  full_name: string
  phone: string
  email: string | null
  source: ClientSource | null
  notes: string | null
  status: ClientStatus
  priority: 'low' | 'medium' | 'high'
  follow_up_date: string | null
  looking_for: 'buy' | 'rent' | null
  property_types: PropertyType[]
  preferred_bhks: number[]
  preferred_locations: string[]
  budget_min: number | null
  budget_max: number | null
  min_bedrooms: number
  min_area_sqft: number | null
  min_area_unit: 'sqft' | 'sqyard' | 'sqm' | 'gaj' | 'bigha'
  min_dimensions: string | null
  preferred_commercial_type: 'shop' | 'space' | 'land' | null
  furnishing_preference: string | null
  possession_timeline: string | null
  contact_type: 'client' | 'broker' | null
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Match {
  id: string
  agency_id: string
  client_id: string
  property_id: string
  score: number
  score_breakdown: Json
  status: MatchStatus
  matched_at: string
}

export interface Notification {
  id: string
  agency_id: string
  user_id: string | null
  type: NotificationType
  title: string
  message: string
  reference_id: string | null
  reference_type: string | null
  is_read: boolean
  created_at: string
}

// Composite/Joined Types
export type MatchWithDetails = Match & {
  client: Client
  property: Property
}

export type PropertyWithCreator = Property & {
  creator: Profile | null
}

export type ClientWithAssignee = Client & {
  assignee: Profile | null
}

export interface Broker {
  id: string
  agency_id: string
  created_by: string | null
  full_name: string
  phones: string[]
  email: string | null
  company_name: string | null
  broker_type: 'freelance' | 'agency' | 'other'
  rating: number
  area: string | null
  specialties: string[]
  notes: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface BrokerPropertyRelation {
  id: string
  agency_id: string
  broker_id: string
  property_id: string
  relation_type: 'sourced' | 'shared'
  notes: string | null
  created_at: string
}

export interface BrokerClientRelation {
  id: string
  agency_id: string
  broker_id: string
  client_id: string
  relation_type: 'sourced' | 'shared'
  notes: string | null
  created_at: string
}
