-- Seed Insurance & Publishing Domains (DAT-001 v1.2 seeds)

-- Seed Domains
INSERT INTO domains (id, slug, name, tier_contributing, points_lock_enabled, hmac_secret)
VALUES 
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'insurance', 'Grandeur Insurance Anchor', TRUE, TRUE, 'mock_hmac_secret_for_insurance_webhooks_key_12345'),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'publishing', 'Grandeur Publishing House', TRUE, FALSE, 'mock_hmac_secret_for_publishing_webhooks_key_67890')
ON CONFLICT (slug) DO UPDATE 
SET 
  tier_contributing = EXCLUDED.tier_contributing,
  points_lock_enabled = EXCLUDED.points_lock_enabled;

-- Seed Rules for Insurance (Level 1: 10%, Level 2: 5%, Level 3: 3%, Level 4: 2%)
INSERT INTO domain_commission_rules (domain_id, level, rate, wt_rate)
VALUES
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 1, 1000, 1000), -- 10% rate, 10% Withholding Tax
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 2, 500, 1000),  -- 5% rate, 10% W/T
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 3, 300, 1000),  -- 3% rate, 10% W/T
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 4, 200, 1000)   -- 2% rate, 10% W/T
ON CONFLICT (domain_id, level) DO NOTHING;

-- Seed Rules for Publishing (Level 1: 8%, Level 2: 4%, Level 3: 2%)
INSERT INTO domain_commission_rules (domain_id, level, rate, wt_rate)
VALUES
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 1, 800, 1000),  -- 8% rate, 10% W/T
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 2, 400, 1000),  -- 4% rate, 10% W/T
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 3, 200, 1000)   -- 2% rate, 10% W/T
ON CONFLICT (domain_id, level) DO NOTHING;
