-- ==========================================
-- 🏆 ULTIMATE DATABASE PATCH (PropDesk v1.0)
-- ==========================================
-- This script upgrades any previous version of the PropDesk database 
-- to the latest production-ready state with Match Intelligence, 
-- Public Slugs, Activities, and Performance Indexes.
-- 
-- Run this in your Supabase SQL Editor.
-- ==========================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. New Tables (IF NOT EXISTS)
-- ── Activities ──
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- create, update, delete, view, share, match
  entity_type TEXT NOT NULL, -- property, client, match, broker
  entity_id UUID NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Brokers ──
CREATE TABLE IF NOT EXISTS brokers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id),
  full_name TEXT NOT NULL,
  phones TEXT[] DEFAULT '{}',
  email TEXT,
  company_name TEXT,
  broker_type TEXT DEFAULT 'freelance',
  rating NUMERIC DEFAULT 0,
  area TEXT,
  specialties TEXT[] DEFAULT '{}',
  notes TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Relations ──
CREATE TABLE IF NOT EXISTS broker_property_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  relation_type TEXT DEFAULT 'sourced',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS broker_client_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  relation_type TEXT DEFAULT 'sourced',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Column Upgrades (Graceful Additions)
DO $$ 
BEGIN
  -- properties
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='properties' AND COLUMN_NAME='slug') THEN
    ALTER TABLE properties ADD COLUMN slug TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='properties' AND COLUMN_NAME='listing_type') THEN
    ALTER TABLE properties ADD COLUMN listing_type TEXT DEFAULT 'sale';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='properties' AND COLUMN_NAME='is_featured') THEN
    ALTER TABLE properties ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='properties' AND COLUMN_NAME='is_new') THEN
    ALTER TABLE properties ADD COLUMN is_new BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='properties' AND COLUMN_NAME='amenities') THEN
    ALTER TABLE properties ADD COLUMN amenities TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='properties' AND COLUMN_NAME='area_unit') THEN
    ALTER TABLE properties ADD COLUMN area_unit TEXT DEFAULT 'sqft';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='properties' AND COLUMN_NAME='seller_name') THEN
    ALTER TABLE properties ADD COLUMN seller_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='properties' AND COLUMN_NAME='seller_phone') THEN
    ALTER TABLE properties ADD COLUMN seller_phone TEXT;
  END IF;

  -- clients
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='clients' AND COLUMN_NAME='min_area_unit') THEN
    ALTER TABLE clients ADD COLUMN min_area_unit TEXT DEFAULT 'sqft';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='clients' AND COLUMN_NAME='possession_timeline') THEN
    ALTER TABLE clients ADD COLUMN possession_timeline TEXT;
  END IF;
END $$;

-- 4. Security Refresh (RLS)
-- Enable RLS on new tables
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_property_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_client_relations ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy Reset for Public Viewing (Allows /p/[slug] to work)
-- Drop existing specific policy if exists to avoid conflicts
DROP POLICY IF EXISTS "properties_public_select" ON properties;
CREATE POLICY "properties_public_select" ON properties FOR SELECT
  USING (is_deleted = FALSE AND status = 'available'); -- Allows listing pages to work without auth

-- Standard Agency Scoping (Ensure these exist)
DROP POLICY IF EXISTS "activities_select" ON activities;
CREATE POLICY "activities_select" ON activities FOR SELECT
  USING (agency_id = (SELECT agency_id FROM profiles WHERE id = auth.uid()));

-- 5. Efficiency Boost (Indexes)
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_activities_agency ON activities(agency_id);
CREATE INDEX IF NOT EXISTS idx_properties_locality_trgm ON properties USING gin (locality gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_properties_title_trgm ON properties USING gin (title gin_trgm_ops);

-- ==========================================
-- ✅ PATCH COMPLETE
-- ==========================================
