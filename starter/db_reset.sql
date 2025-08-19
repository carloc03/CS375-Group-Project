-- DANGER: wipes data
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS plan_landmarks CASCADE;
DROP TABLE IF EXISTS plan_hotels CASCADE;
DROP TABLE IF EXISTS plan_flights CASCADE;
DROP TABLE IF EXISTS plan_locations CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS flight CASCADE;     -- legacy
DROP TABLE IF EXISTS planners CASCADE;   -- legacy
DROP TABLE IF EXISTS accounts CASCADE;   -- include this ONLY if you want to wipe users

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  public_slug TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plan_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  city TEXT,
  country TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  notes TEXT,
  weather JSONB
);

CREATE TABLE IF NOT EXISTS plan_flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  carrier TEXT,
  flight_number TEXT,
  origin TEXT,
  destination TEXT,
  depart_time TIMESTAMPTZ,
  arrive_time TIMESTAMPTZ,
  passengers JSONB,
  cabin TEXT,
  price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  raw JSONB
);

CREATE TABLE IF NOT EXISTS plan_hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  name TEXT,
  address TEXT,
  check_in DATE,
  check_out DATE,
  price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  raw JSONB
);

CREATE TABLE IF NOT EXISTS plan_landmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  location_id UUID REFERENCES plan_locations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  source TEXT,
  meta JSONB
);

CREATE INDEX IF NOT EXISTS idx_plans_account_id ON plans(account_id);
CREATE INDEX IF NOT EXISTS idx_plan_flights_plan_id ON plan_flights(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_hotels_plan_id ON plan_hotels(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_landmarks_plan_id ON plan_landmarks(plan_id);

