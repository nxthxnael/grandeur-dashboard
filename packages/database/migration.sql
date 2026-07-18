-- PostgreSQL Schema Migrations (DAT-001 v1.2 DDL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Domains Table
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    tier_contributing BOOLEAN NOT NULL DEFAULT FALSE,
    points_lock_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    hmac_secret VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Domain Commission Rules Table (Tiered rules in integer hundredths, e.g. 500 = 5.00%)
CREATE TABLE IF NOT EXISTS domain_commission_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 11),
    rate INTEGER NOT NULL CHECK (rate >= 0), -- Commission rate in basis points (hundredths of percent)
    wt_rate INTEGER NOT NULL DEFAULT 1000,   -- Withholding Tax rate (default 10.00% = 1000 basis points)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(domain_id, level)
);

-- Members Table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tier VARCHAR(50) NOT NULL DEFAULT 'Bronze',
    device_hash VARCHAR(128),
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    points_lock_threshold BIGINT NOT NULL DEFAULT 0 -- Premium points lock threshold
);

-- Member Tree (Closure Table representing FCFS multilevel relationships)
CREATE TABLE IF NOT EXISTS member_tree (
    ancestor_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    descendant_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    depth INTEGER NOT NULL CHECK (depth >= 0),
    PRIMARY KEY (ancestor_id, descendant_id)
);

-- Payout States and Commission Ledger
CREATE TABLE IF NOT EXISTS points_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,
    amount BIGINT NOT NULL,              -- Points amount in KES hundredths
    locked_amount BIGINT NOT NULL DEFAULT 0,
    redeemable_amount BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dispatched', 'confirmed', 'paid', 'held_fraud')),
    idempotency_key UUID UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_member_tree_descendant ON member_tree(descendant_id);
CREATE INDEX IF NOT EXISTS idx_member_tree_depth ON member_tree(depth);
CREATE INDEX IF NOT EXISTS idx_points_ledger_member ON points_ledger(member_id);
CREATE INDEX IF NOT EXISTS idx_points_ledger_status ON points_ledger(status);
