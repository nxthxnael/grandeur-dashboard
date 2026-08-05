import { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Milestone,
  CheckSquare,
  FileText,
  AlertTriangle,
  Gavel,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  AlertCircle,
  ExternalLink,
  Lock,
  CheckCircle2,
  Activity,
  Sparkles,
  Info,
  ShieldAlert,
  StickyNote,
  LogOut,
  Shield,
} from "lucide-react";
import "./App.css";
import { useNotes } from "./hooks/useNotes";
import { NotesPanel } from "./components/NotesPanel";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AdminApprovalPage } from "./pages/AdminApprovalPage";
import { useAuth } from "./context/AuthContext";

export const PHASES = [
  {
    id: "p0",
    code: "Phase 0",
    title: "Schema, Contract & Environment",
    weeks: "Week 1",
    color: "#6366f1",
    bg: "#eef2ff",
    exitGate:
      "Repository clones cleanly in <15 min. All migrations run. Both domain seeds exist. OpenAPI spec has no missing endpoints. Daraja, ODPC, Africa's Talking applications submitted.",
    tasks: [
      {
        id: "p0t1",
        text: "Initialise Turborepo monorepo structure (SAS-001 v1.2 §6)",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p0t2",
        text: "Submit Safaricom Daraja B2C production access application (Day 1)",
        owner: "Chairman",
        critical: true,
      },
      {
        id: "p0t3",
        text: "Submit ODPC data processor registration (Day 1)",
        owner: "Chairman",
        critical: true,
      },
      {
        id: "p0t4",
        text: "Submit Africa's Talking USSD shortcode application (Day 1)",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p0t5",
        text: "Deploy PostgreSQL schema migrations from DAT-001 v1.2 DDL",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p0t6",
        text: "Seed Insurance & Publishing domain records (with tier_contributing, points_lock_enabled)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p0t7",
        text: "Generate OpenAPI 3.1 spec from API-001 v1.2",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p0t8",
        text: "Generate Zod schemas (SaleWebhookSchema, PointRedemptionSchema, DomainConfigSchema…)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p0t9",
        text: "NestJS controller stubs (NotImplementedException skeleton)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p0t10",
        text: "Docker Compose local dev environment (PG16, Redis 7, mock MPESA)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p0t11",
        text: "GitHub Actions CI pipeline (type-check, lint, test on every PR)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p0t12",
        text: "Sentry + Grafana + Prometheus in staging",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p0t13",
        text: "Generate Postman/Insomnia collection from OpenAPI spec",
        owner: "Dev",
        critical: false,
      },
    ],
  },
  {
    id: "p1",
    code: "Phase 1",
    title: "Auth & Core Data Layer",
    weeks: "Weeks 2–4",
    color: "#0891b2",
    bg: "#ecfeff",
    exitGate:
      "New member registers and receives JWT. Insurance member with non-zero premium lock sees correct 3-figure balance (total, locked, redeemable). Redemption above redeemable_glp returns POINTS_LOCKED_FOR_PREMIUM.",
    tasks: [
      {
        id: "p1t1",
        text: "AuthModule — POST /v1/auth/register (phone + OTP)",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p1t2",
        text: "AuthModule — POST /v1/auth/login (JWT 15min + HttpOnly refresh cookie)",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p1t3",
        text: "AuthModule — POST /v1/auth/refresh (theft-detection rotation)",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p1t4",
        text: "AuthModule — POST /v1/auth/mfa/verify (TOTP admin elevation)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p1t5",
        text: "DomainModule (admin) — domain CRUD + HMAC secret generation",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p1t6",
        text: "DomainModule — commission rule configuration with 50% cap validation",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p1t7",
        text: "ReferralModule — POST /v1/referrals/{code}/claim + closure table trigger",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p1t8",
        text: "ReferralModule — GET /v1/referrals/{code}/landing",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p1t9",
        text: "GET /v1/users/me (profile + referral_code)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p1t10",
        text: "Integration test: 12-member 3-level tree; verify all closure table rows",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p1t11",
        text: "PointsModule — member_wallet_balances view with locked_glp / redeemable_glp",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p1t12",
        text: "PointsModule — GET /v1/points/balance (3-figure per wallet)",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p1t13",
        text: "PointsModule — POST /v1/points/redeem (airtime) + POINTS_LOCKED_FOR_PREMIUM guard",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p1t14",
        text: "points-lock.service.ts — lock calculation + update on Insurance webhook",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p1t15",
        text: "Data erasure capability (PII pseudonymous hash) — built alongside member table",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p1t16",
        text: "Unit tests 100% coverage: premium lock formula at all threshold conditions",
        owner: "Dev",
        critical: true,
      },
    ],
  },
  {
    id: "p2",
    code: "Phase 2",
    title: "Commission Engine & Payments",
    weeks: "Weeks 5–9",
    color: "#0f766e",
    bg: "#f0fdfa",
    exitGate:
      "Webhook to /v1/webhooks/sale/insurance produces correct pending ledger entries for all 11 ancestor levels. Daraja sandbox round-trip completes: dispatch → callback → confirmed state → member SMS notification.",
    tasks: [
      {
        id: "p2t1",
        text: "Go commission engine — gRPC server on localhost:50051",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p2t2",
        text: "Domain rule retrieval from domain_commission_rules + Redis cache (5min TTL)",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p2t3",
        text: "BFS tree walk via closure table (iterative, NOT recursive CTE)",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p2t4",
        text: "Tiered commission calculation — int64 integer arithmetic, no float",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p2t5",
        text: "W/T deduction at 10% + 50% aggregate cap enforcement",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p2t6",
        text: "Batch ledger writes — single PostgreSQL transaction for all ancestor entries",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p2t7",
        text: "Human line-by-line review of commission math against DAT-001 v1.2 formula",
        owner: "Chairman",
        critical: true,
      },
      {
        id: "p2t8",
        text: "Unit tests (independently written): all 11 rates, W/T boundaries, 50% cap",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p2t9",
        text: "BullMQ queues: sale-events, commission-calc, payout-dispatch (DLQ + Slack alert), fraud-check",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p2t10",
        text: "POST /v1/webhooks/sale/{domainSlug} — HMAC verify + Zod + enqueue + immediate 200",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p2t11",
        text: "Daraja B2C dispatch — idempotency key = commission_ledger UUID",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p2t12",
        text: "POST /v1/webhooks/mpesa/callback — update ledger → confirmed, notify member",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p2t13",
        text: "Payout state machine: pending → dispatched → confirmed → paid (no skipping)",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p2t14",
        text: "Reconciliation cron — every 6h, query Daraja for dispatched rows >10min old",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p2t15",
        text: "KRA materialised view (kra_wt_summary) deployed + nightly refresh schedule",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p2t16",
        text: "Remaining redemption types: MPESA cash, merchandise, purchase discounts",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p2t17",
        text: "POST /v1/points/transfer (within-domain only)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p2t18",
        text: "GET /v1/commissions + sub-endpoints + commission rules API",
        owner: "Dev",
        critical: false,
      },
    ],
  },
  {
    id: "p3",
    code: "Phase 3",
    title: "Dynamic Features — FCFS & Tier System",
    weeks: "Weeks 10–13",
    color: "#7c3aed",
    bg: "#f5f3ff",
    exitGate:
      "Member with direct_slots_used=3 shares link; new member joins under correct FCFS-resolved oldest sub-member. Option C tier correctly aggregates Insurance + Publishing GLPs into totalGLP in balance response.",
    tasks: [
      {
        id: "p3t1",
        text: "fcfs-resolver.service.ts — BFS via closure table, depth 1-4, oldest-first ordering",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p3t2",
        text: "Redis cache fcfs:{member_id}, TTL 30s, invalidated on member_tree INSERT in sub-tree",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p3t3",
        text: "GET /v1/users/me — add active_referral_code, active_referral_url, direct_slots_used, share_event_id",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p3t4",
        text: "GET /v1/referrals/{code}/landing — fallback cascade (redirected, original_code, resolved_code)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p3t5",
        text: "GET /v1/referrals/resolve/{code} — admin debug endpoint",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p3t6",
        text: "POST /v1/referrals/share-event — fire-and-forget channel recording",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p3t7",
        text: "INSERT to referral_share_events on every FCFS resolution",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p3t8",
        text: "Integration test: member with 3/3 slots → active_referral_url resolves to sub-member",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p3t9",
        text: "Premium lock full implementation — renewal webhook updates lock threshold",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p3t10",
        text: "Exit gate test: renewal webhook → lock threshold updates → redeemable_glp changes",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p3t11",
        text: "AMD-001 activation: confirm tier_contributing=true for both founding domains in seed + DB",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p3t12",
        text: "PointsModule balance query JOINs member_tier_balances → returns totalGLP, tier, tierProgressPercent",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p3t13",
        text: "Tier advancement check after every confirmed points_ledger INSERT",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p3t14",
        text: "members.tier column update + tier advancement SMS/push notification",
        owner: "Dev",
        critical: false,
      },
    ],
  },
  {
    id: "p4",
    code: "Phase 4",
    title: "Client Channels",
    weeks: "Weeks 14–18",
    color: "#d97706",
    bg: "#fffbeb",
    exitGate:
      "Feature phone user completes full USSD session: balance check (3 figures), referral link SMS'd via AT, airtime redemption confirmed. Printed Commission Statement renders in A4 with all 3 financial figures.",
    tasks: [
      {
        id: "p4t1",
        text: "USSD handler — Africa's Talking session callbacks + full state machine",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p4t2",
        text: "USSD: balance check (3-figure locked/redeemable), referral link via FCFS resolver SMS'd",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p4t3",
        text: "USSD: dynamic domain list from domains table, airtime redemption",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p4t4",
        text: "CI test: all USSD strings ≤182 chars for en-KE and sw-KE at max variable substitution",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p4t5",
        text: "Notification channels: Africa's Talking SMS, FCM push, Resend transactional email",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p4t6",
        text: "React Native — Home screen (redeemable_glp headline, totalGLP secondary, tier progress bar)",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p4t7",
        text: "React Native — Points screen (3-figure wallet list, domain filter, export-to-print)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p4t8",
        text: "React Native — Profile screen (QR encodes active_referral_url, FCFS attribution label)",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p4t9",
        text: "React Native — Redeem screen (redeemable_glp maximum enforced client-side)",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p4t10",
        text: "React Native — Referral tree (expandable 3 levels, tier colour, active/inactive)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p4t11",
        text: "Share flow invariant test: share button uses active_referral_url, never referralCode",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p4t12",
        text: "Offline: @tanstack/react-query staleTime 5min, expo-sqlite mutation queue",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p4t13",
        text: "Preact PWA — referral landing page + member points dashboard",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p4t14",
        text: "PWA service worker — offline balance caching, add-to-home-screen",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p4t15",
        text: "Lighthouse CI: FCP <2s on 3G, initial bundle <30KB gzipped",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p4t16",
        text: "Print CSS engine — @media print A4 layout, Commission Statement",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p4t17",
        text: "Print CSS — Referral Tree Summary (4-level indented, obfuscated codes)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p4t18",
        text: "Print CSS — Loyalty Certificate (tier status, GLP balance, Grandeur branding)",
        owner: "Dev",
        critical: false,
      },
    ],
  },
  {
    id: "p5",
    code: "Phase 5",
    title: "Fraud Detection, Admin Dashboard & AI",
    weeks: "Weeks 19–21",
    color: "#dc2626",
    bg: "#fef2f2",
    exitGate:
      "Simulated rapid-referral fraud (>5/day) detected, flagged, commission held, visible in admin queue within 5 minutes. AI Insurance product parser correctly extracts premium in KES hundredths from test PDF.",
    tasks: [
      {
        id: "p5t1",
        text: "FraudModule — velocity: max 5 referrals/member/day + max 3 signups/IP/hour (two separate rules)",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p5t2",
        text: "FraudModule — device fingerprinting (FingerprintJS Pro, device_hash per member)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p5t3",
        text: "FraudModule — phone validation (block disposable/virtual SIM)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p5t4",
        text: "FraudModule — pending state enforcement until sale confirmed by partner",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p5t5",
        text: "POST /v1/admin/fraud/resolve/{id} — approve / hold / reject",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p5t6",
        text: "Admin dashboard — member management (search, filter, suspend)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p5t7",
        text: "Admin — D3 tree visualisation (tier colours, slot capacity badges, FCFS amber border)",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p5t8",
        text: "Admin — fraud review queue with SSE real-time updates from /v1/admin/events",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p5t9",
        text: "Admin — domain management panel (lock toggle, tier toggle, secret rotation)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p5t10",
        text: "Admin — KRA commission + payout reporting + audit log viewer",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p5t11",
        text: "AI — Insurance product parser (InsuranceProductAISchema, forced tool_choice, KES hundredths)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p5t12",
        text: "AI — Publishing catalogue parser (PublishingProductAISchema)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p5t13",
        text: "AI — Fraud explainer (English + Swahili, approve/hold/reject recommendation)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p5t14",
        text: "AI — Admin NLQ via read-only DLRS DB MCP server (audit-logged)",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p5t15",
        text: "AiService — Redis per-minute token budget counter",
        owner: "Dev",
        critical: false,
      },
    ],
  },
  {
    id: "p6",
    code: "Phase 6",
    title: "Hardening & Production Launch",
    weeks: "Weeks 22–24",
    color: "#059669",
    bg: "#f0fdf4",
    exitGate:
      "Production smoke test: real member registers, real Insurance sale webhook fires, real commission calculated, real Daraja payout to M-PESA. ODPC registration confirmed before this test runs.",
    tasks: [
      {
        id: "p6t1",
        text: "Pino structured JSON logging: every auth event, commission write, payout dispatch, fraud flag",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p6t2",
        text: "OpenTelemetry traces: webhook → BullMQ → Go engine → Daraja",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p6t3",
        text: "Prometheus metrics: queue depth, DLQ depth, payout rate, MPESA SLA, commission latency",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p6t4",
        text: "Critical alert: payout-dispatch DLQ depth >0 → Slack within 5 minutes",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p6t5",
        text: "Grafana dashboards: queue health, payout monitoring, member growth, tier distribution",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p6t6",
        text: "Load test: 10k concurrent users, 500+ sale events/min, p99 <500ms, FCFS BFS <5ms",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p6t7",
        text: "Security audit: OWASP Top 10 vs SEC-001 v1.1, HMAC bypass attempts, JWT theft scenarios",
        owner: "Chairman",
        critical: true,
      },
      {
        id: "p6t8",
        text: "Cloudflare WAF rule validation + pgcrypto PII encryption verification",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p6t9",
        text: "Full staging E2E: registration → referral → sale → commission → Daraja → payout",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p6t10",
        text: "Staging E2E: FCFS cascade, premium lock, tier advancement, USSD, print docs, fraud",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p6t11",
        text: "Joint webhook testing with Insurance + Publishing anchor partners",
        owner: "Chairman",
        critical: true,
      },
      {
        id: "p6t12",
        text: "AWS ECS Fargate: NestJS API ×2 + Go sidecar, RDS Multi-AZ, ElastiCache replication",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p6t13",
        text: "CloudFront distributions for Admin SPA + Customer PWA",
        owner: "Dev",
        critical: false,
      },
      {
        id: "p6t14",
        text: "Cloudflare DNS + SSL + WAF + rate limiting + af-south-1 routing",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p6t15",
        text: "AWS Secrets Manager + automated PG snapshots + WAL archiving to S3",
        owner: "Dev",
        critical: true,
      },
      {
        id: "p6t16",
        text: "Confirm ODPC registration received before production smoke test",
        owner: "Chairman",
        critical: true,
      },
    ],
  },
];

const DOCS = [
  {
    id: "RSD-001",
    version: "v1.1",
    title: "Requirement Specification Document",
    url: "https://docs.google.com/document/d/1a43foVBli6EJI_dTUSmOtiIboBly9wKAMylp3M1xNRM/edit?usp=sharing",
  },
  {
    id: "SAS-001",
    version: "v1.2",
    title: "System Architecture Specification",
    url: "https://docs.google.com/document/d/1ohYIhpow-yW9sbJrsdcepeCOw7B5azNTBgDcaMFPhic/edit",
  },
  {
    id: "API-001",
    version: "v1.2",
    title: "API Design & Developer Guide",
    url: "https://docs.google.com/document/d/1ZwwDva8D0iyR-SAW6JHF5w7_HzDgOmG2ig4dLe98jaM/edit",
  },
  {
    id: "DAT-001",
    version: "v1.2",
    title: "Data Architecture & Localization",
    url: "https://docs.google.com/document/d/18NoVO45shStWw9UEYWnVeUJp_R3vUw1UC9Qg66q6IUw/edit",
  },
  {
    id: "SEC-001",
    version: "v1.1",
    title: "Security Framework",
    url: "https://docs.google.com/document/d/1CAl3frtqGSrde9zzmXziSydCYB9El7ux2oIYf8O7zIQ/edit",
  },
  {
    id: "AIS-001",
    version: "v1.0",
    title: "AI Integration Specification",
    url: "https://docs.google.com/document/d/1qpiy4R4auxtVDBWilfY4qDL6WpuHc-2O6It8lYmK1PQ/edit",
  },
  {
    id: "FES-001",
    version: "v1.1",
    title: "Frontend Specification",
    url: "https://docs.google.com/document/d/1qJNHq8OsS1FRnW7h3b6jXPGNcj6cQJaP044_65U2pzY/edit",
  },
  {
    id: "ADR-001",
    version: "v1.0",
    title: "Dynamic Domain Architecture Decision",
    url: "https://docs.google.com/document/d/1uXUTEquYMbBwAZxQuzX_6blW7RLTCmG6tsrXNJ7Jf4s/edit",
  },
  {
    id: "AMD-001",
    version: "v1.0",
    title: "OQ-1 Resolution & Amendments",
    url: "https://docs.google.com/document/d/1R1ut_MckEwI7ik5ztgjkPHxv0LBs4nIyWMxr1Zx3LAU/edit",
  },
  {
    id: "IMP-001",
    version: "v1.1",
    title: "Technical Implementation Roadmap (AI-Assisted)",
    url: "https://docs.google.com/document/d/16rzMFaORkGmxoG9WG0SObUezwaM4lcnCZEHvyHDBQa8/edit",
  },
  {
    id: "SHARE-001",
    version: "v1.0",
    title: "Shareholder Briefing",
    url: "https://docs.google.com/document/d/1TAkGKSKwsUncLIRsLJdy0epexAS6evhx9G6NGs1YQR4/edit",
  },
  {
    id: "SHARE-002",
    version: "v1.0+AMD",
    title: "How the Platform Works",
    url: "https://docs.google.com/document/d/1aSk4zqRT_WQRNkDD_RVbD1sW3oft2MhYCleVIYpo0Qs/edit",
  },
  {
    id: "SHARE-003",
    version: "v1.1",
    title: "Strategic Roadmap & Growth Plan",
    url: "https://docs.google.com/document/d/1LKEN4D1MXO9PJI5J7-pBnU0Vr33t_u2AdZLvikjwbdA/edit",
  },
];

const RISKS = [
  {
    id: "r1",
    title: "Safaricom Daraja B2C Approval Delay",
    prob: "Medium",
    impact: "High",
    mitigation:
      "Submit all paperwork (BRS cert, KRA PIN, compliance review) on Day 1. Sandbox testing proceeds without interruption. Decoupled adapter means production key swap requires no code change.",
    defaultStatus: "Open",
  },
  {
    id: "r2",
    title: "AI-Generated Financial Logic Deviation",
    prob: "Medium",
    impact: "High",
    mitigation:
      "Mandatory line-by-line human review of all commission math, FCFS resolver, and points logic against the source document. Unit tests written independently of implementation.",
    defaultStatus: "Mitigated",
  },
  {
    id: "r3",
    title: "ODPC Registration Not Confirmed Before Launch",
    prob: "Low",
    impact: "High",
    mitigation:
      "Submit Week 1. Phase 6 exit gate requires ODPC confirmation before production smoke test runs. No real member data collected until confirmed.",
    defaultStatus: "Open",
  },
  {
    id: "r4",
    title: "USSD Packet Content Disruption",
    prob: "Low",
    impact: "Medium",
    mitigation:
      "Automated CI pipeline assertions enforce 182-character limit for all USSD strings in both en-KE and sw-KE at maximum variable substitution lengths.",
    defaultStatus: "Mitigated",
  },
  {
    id: "r5",
    title: "Anchor Partner Launch Readiness Delays",
    prob: "Medium",
    impact: "Low",
    mitigation:
      "Pre-seed 'test-retail' mock domain for E2E testing independent of third-party timelines. Provide API-001 v1.2 webhook guide from Week 5. Joint staging tests from Week 22.",
    defaultStatus: "Open",
  },
  {
    id: "r6",
    title: "Solo Developer Scope Overload",
    prob: "Medium",
    impact: "High",
    mitigation:
      "AI assistance absorbs CRUD scaffolding, Zod schemas, migration scripts, component boilerplate. Human focus on financial logic review, integration testing, Go commission engine.",
    defaultStatus: "Open",
  },
];

const DECISIONS = [
  {
    id: "d1",
    ref: "OD-1",
    title: "Separate Domain Wallets",
    status: "Resolved",
    detail:
      "Insurance and Publishing maintain separate domain wallets. Platform uses domain-agnostic wallet architecture. See ADR-001.",
  },
  {
    id: "d2",
    ref: "OQ-1",
    title: "Klub Card Tier Aggregation — Option C",
    status: "Resolved",
    detail:
      "Option C confirmed by product owner (June 2026). Tier = sum of GLPs from all domains where tier_contributing = true. Insurance: true. Publishing: true. Future domains: false by default. member_tier_balances view is active. See AMD-001.",
  },
  {
    id: "d3",
    ref: "OD-2",
    title: "KCB Klub Card Commercial Integration",
    status: "Pending Commercial",
    detail:
      "Blocked on commercial track. Technical adapter is built and waiting in PayoutModule. No action required from engineering team until KCB agreement is executed.",
  },
];

const STATUS_OPTIONS = [
  "Not Started",
  "In Progress",
  "Blocked",
  "Done",
  "Skipped",
];
const STATUS_COLORS = {
  "Not Started": "#717974",
  "In Progress": "#885200",
  Blocked: "#ba1a1a",
  Done: "#013626",
  Skipped: "#6b7280",
};

// LocalStorage/window.storage unified adapter
const store = {
  get: async (key) => {
    try {
      if (window.storage && typeof window.storage.get === "function") {
        return await window.storage.get(key);
      }
    } catch (e) {
      console.warn("window.storage.get unavailable, using localStorage:", e);
    }
    const val = localStorage.getItem(key);
    return val ? { value: val } : null;
  },
  set: async (key, value) => {
    try {
      if (window.storage && typeof window.storage.set === "function") {
        return await window.storage.set(key, value);
      }
    } catch (e) {
      console.warn("window.storage.set unavailable, using localStorage:", e);
    }
    localStorage.setItem(key, value);
  },
};

export function Badge({ text, color, bg }) {
  return (
    <span
      className="badge mono-display"
      style={{
        backgroundColor: bg || "rgba(113, 121, 116, 0.08)",
        color: color || "#717974",
        borderColor: color
          ? `rgba(${hexToRgb(color)}, 0.2)`
          : "rgba(113, 121, 116, 0.15)",
      }}
    >
      {text}
    </span>
  );
}

// Helper to convert hex to rgb for alpha borders
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "113, 121, 116";
}

export default function App() {
  const { user, logout } = useAuth();
  const [taskStatus, setTaskStatus] = useState({});
  const [taskNotes, setTaskNotes] = useState({});
  const [riskStatus, setRiskStatus] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [activePhase, setActivePhase] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [loaded, setLoaded] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // Notes feature hook
  const { notes, noteForm, setNoteForm, notesLoading, notesError, createNote } =
    useNotes(API_URL, store);

  useEffect(() => {
    async function load() {
      try {
        const ts = await store.get("dlrs_task_status");
        const tn = await store.get("dlrs_task_notes");
        const rs = await store.get("dlrs_risk_status");
        if (ts) setTaskStatus(JSON.parse(ts.value));
        if (tn) setTaskNotes(JSON.parse(tn.value));
        if (rs) setRiskStatus(JSON.parse(rs.value));
      } catch (e) {
        console.error("Error restoring state:", e);
      }
      setLoaded(true);
    }
    load();
  }, []);

  const save = useCallback(async (ts, tn, rs) => {
    try {
      await store.set("dlrs_task_status", JSON.stringify(ts));
      await store.set("dlrs_task_notes", JSON.stringify(tn));
      await store.set("dlrs_risk_status", JSON.stringify(rs));
    } catch (e) {
      console.error("Error saving state:", e);
    }
  }, []);

  const setStatus = (id, val) => {
    const next = { ...taskStatus, [id]: val };
    setTaskStatus(next);
    save(next, taskNotes, riskStatus);
  };

  const setNote = (id, val) => {
    const next = { ...taskNotes, [id]: val };
    setTaskNotes(next);
    save(taskStatus, next, riskStatus);
  };

  const setRisk = (id, val) => {
    const next = { ...riskStatus, [id]: val };
    setRiskStatus(next);
    save(taskStatus, taskNotes, next);
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/admin/approvals"
        element={
          <ProtectedRoute>
            <AdminApprovalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardContent
              user={user}
              logout={logout}
              taskStatus={taskStatus}
              setStatus={setStatus}
              taskNotes={taskNotes}
              setNote={setNote}
              riskStatus={riskStatus}
              setRisk={setRisk}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activePhase={activePhase}
              setActivePhase={setActivePhase}
              expandedTask={expandedTask}
              setExpandedTask={setExpandedTask}
              editingNote={editingNote}
              setEditingNote={setEditingNote}
              noteInput={noteInput}
              setNoteInput={setNoteInput}
              filter={filter}
              setFilter={setFilter}
              loaded={loaded}
              notes={notes}
              noteForm={noteForm}
              setNoteForm={setNoteForm}
              notesLoading={notesLoading}
              notesError={notesError}
              createNote={createNote}
            />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function DashboardContent({
  user,
  logout,
  taskStatus,
  setStatus,
  taskNotes,
  setNote,
  riskStatus,
  setRisk,
  activeTab,
  setActiveTab,
  activePhase,
  setActivePhase,
  expandedTask,
  setExpandedTask,
  editingNote,
  setEditingNote,
  noteInput,
  setNoteInput,
  filter,
  setFilter,
  loaded,
  notes,
  noteForm,
  setNoteForm,
  notesLoading,
  notesError,
  createNote,
}) {
  const navigate = useNavigate();

  const getPhaseStats = (phase) => {
    const tasks = phase.tasks;
    const done = tasks.filter((t) => taskStatus[t.id] === "Done").length;
    const inProg = tasks.filter(
      (t) => taskStatus[t.id] === "In Progress",
    ).length;
    const blocked = tasks.filter((t) => taskStatus[t.id] === "Blocked").length;
    const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
    return { done, inProg, blocked, total: tasks.length, pct };
  };

  const allTasks = PHASES.flatMap((p) =>
    p.tasks.map((t) => ({ ...t, phase: p })),
  );
  const totalDone = allTasks.filter((t) => taskStatus[t.id] === "Done").length;
  const totalInProg = allTasks.filter(
    (t) => taskStatus[t.id] === "In Progress",
  ).length;
  const totalBlocked = allTasks.filter(
    (t) => taskStatus[t.id] === "Blocked",
  ).length;
  const overallPct =
    allTasks.length > 0 ? Math.round((totalDone / allTasks.length) * 100) : 0;

  const TABS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "phases", label: "Phases", icon: Milestone },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "risks", label: "Risks", icon: AlertTriangle },
    { id: "decisions", label: "Decisions", icon: Gavel },
    { id: "notes", label: "Notes", icon: StickyNote },
  ];

  const filteredTasks = activePhase
    ? PHASES.find((p) => p.id === activePhase)?.tasks.map((t) => ({
        ...t,
        phase: PHASES.find((p) => p.id === activePhase),
      })) || []
    : allTasks.filter((t) => {
        if (filter === "all") return true;
        if (filter === "critical") return t.critical;
        if (filter === "blocked") return taskStatus[t.id] === "Blocked";
        if (filter === "inprogress") return taskStatus[t.id] === "In Progress";
        if (filter === "notstarted")
          return !taskStatus[t.id] || taskStatus[t.id] === "Not Started";
        if (filter === "done") return taskStatus[t.id] === "Done";
        return true;
      });

  if (!loaded) {
    return (
      <div
        style={{
          padding: 80,
          color: "var(--text-secondary)",
          textAlign: "center",
          fontFamily: "var(--font-sans)",
        }}
      >
        <Activity
          className="animate-spin"
          style={{ margin: "0 auto 16px", color: "var(--primary)" }}
          size={32}
        />
        <div>Loading Technical Board...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-top">
          <div className="header-info">
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "var(--primary)",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              Grandeur DLRS · Project Board
            </div>
            <h1>Technical Board</h1>
            <p>24-week implementation · Solo developer + Executive Chairman</p>
          </div>

          <div className="header-stats">
            <div className="stat-widget">
              <div
                className="stat-val mono-display"
                style={{ color: "var(--primary)" }}
              >
                {overallPct}%
              </div>
              <div className="stat-label">Complete</div>
            </div>
            <div className="stat-widget">
              <div
                className="stat-val mono-display"
                style={{ color: "var(--success)" }}
              >
                {totalDone}
              </div>
              <div className="stat-label">Done</div>
            </div>
            <div className="stat-widget">
              <div
                className="stat-val mono-display"
                style={{ color: "var(--warning)" }}
              >
                {totalInProg}
              </div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-widget">
              <div
                className="stat-val mono-display"
                style={{ color: "var(--error)" }}
              >
                {totalBlocked}
              </div>
              <div className="stat-label">Blocked</div>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                backgroundColor: "transparent",
                border: "1px solid var(--border-color)",
                borderRadius: "4px",
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "14px",
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
            {user.role === "SUPER_ADMIN" && (
              <button
                onClick={() => navigate("/admin/approvals")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  backgroundColor: "#dc2626",
                  border: "1px solid #dc2626",
                  borderRadius: "4px",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                }}
              >
                <Shield size={16} />
                Admin
              </button>
            )}
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="overall-progress-wrapper">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="tabs-container">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== "tasks") setActivePhase(null);
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="dashboard-content container fade-in">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div>
            <div className="phase-grid">
              {PHASES.map((ph) => {
                const s = getPhaseStats(ph);
                return (
                  <div
                    key={ph.id}
                    className="phase-card"
                    style={{ "--phase-color": ph.color }}
                    onClick={() => {
                      setActivePhase(ph.id);
                      setActiveTab("tasks");
                    }}
                  >
                    <div className="phase-card-header">
                      <div>
                        <div className="phase-code mono-display">
                          {ph.code} · {ph.weeks}
                        </div>
                        <div className="phase-title">{ph.title}</div>
                      </div>
                      <div
                        className="phase-card-pct mono-display"
                        style={{
                          color:
                            s.pct === 100
                              ? "var(--success)"
                              : s.pct > 0
                                ? "var(--warning)"
                                : "var(--text-muted)",
                        }}
                      >
                        {s.pct}%
                      </div>
                    </div>

                    <div className="phase-card-progress">
                      <div
                        className="phase-card-progress-bar"
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>

                    <div className="phase-card-stats">
                      <div className="phase-card-stat-item">
                        <CheckCircle2
                          size={12}
                          style={{ color: "var(--success)" }}
                        />
                        <span className="mono-display">
                          {s.done}/{s.total}
                        </span>
                      </div>
                      {s.inProg > 0 && (
                        <div
                          className="phase-card-stat-item"
                          style={{ color: "var(--warning)" }}
                        >
                          <span style={{ fontSize: "14px", lineHeight: 1 }}>
                            ●
                          </span>
                          <span className="mono-display">
                            {s.inProg} active
                          </span>
                        </div>
                      )}
                      {s.blocked > 0 && (
                        <div
                          className="phase-card-stat-item"
                          style={{ color: "var(--error)" }}
                        >
                          <AlertCircle size={12} />
                          <span className="mono-display">
                            {s.blocked} blocked
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Critical Path Section */}
            <div className="critical-path-section">
              <h2 className="section-header">
                <AlertCircle size={18} style={{ color: "var(--warning)" }} />
                Critical Path — External Dependencies
              </h2>
              <div className="critical-path-grid">
                {[
                  {
                    label: "Safaricom Daraja B2C",
                    sub: "BRS cert + KRA PIN + compliance review",
                    timeline: "2–6 weeks",
                    day: "Day 1",
                    color: "var(--error)",
                  },
                  {
                    label: "ODPC Registration",
                    sub: "Data processor registration before first member",
                    timeline: "2–4 weeks",
                    day: "Week 1",
                    color: "var(--warning)",
                  },
                  {
                    label: "Africa's Talking USSD Shortcode",
                    sub: "Required before Phase 4 USSD work begins",
                    timeline: "1–2 weeks",
                    day: "Day 1",
                    color: "var(--warning)",
                  },
                  {
                    label: "AWS af-south-1 Setup",
                    sub: "ECS Fargate + RDS Multi-AZ + ElastiCache",
                    timeline: "1–3 days",
                    day: "Week 1",
                    color: "var(--success)",
                  },
                ].map((item, i) => (
                  <div key={i} className="critical-row">
                    <div>
                      <div className="critical-row-title">{item.label}</div>
                      <div className="critical-row-desc">{item.sub}</div>
                    </div>
                    <div className="critical-row-col">
                      <Badge
                        text={item.timeline}
                        color={item.color}
                        bg="rgba(0,0,0,0.02)"
                      />
                    </div>
                    <div className="critical-row-col">
                      <Badge
                        text={`Submit ${item.day}`}
                        color="var(--primary)"
                        bg="rgba(1, 54, 38, 0.05)"
                      />
                    </div>
                    <div
                      className="critical-row-col mono-display"
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        display: "flex",
                        gap: "4px",
                        alignItems: "center",
                      }}
                    >
                      <Clock size={12} />
                      Required Action
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PHASES TAB */}
        {activeTab === "phases" && (
          <div>
            {PHASES.map((ph) => {
              const s = getPhaseStats(ph);
              return (
                <div
                  key={ph.id}
                  className="phase-detail-item"
                  style={{ borderLeft: `4px solid ${ph.color}` }}
                >
                  <div className="phase-detail-header">
                    <div className="phase-detail-info">
                      <div
                        className="mono-display"
                        style={{
                          fontSize: "11px",
                          color: ph.color,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: "4px",
                        }}
                      >
                        {ph.code} · {ph.weeks}
                      </div>
                      <h2>{ph.title}</h2>
                    </div>
                    <div className="phase-detail-stats">
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {s.done} of {s.total} tasks completed
                      </span>
                      <span
                        className="phase-detail-pct mono-display"
                        style={{
                          color:
                            s.pct === 100
                              ? "var(--success)"
                              : s.pct > 0
                                ? "var(--warning)"
                                : "var(--text-muted)",
                        }}
                      >
                        {s.pct}%
                      </span>
                      <button
                        onClick={() => {
                          setActivePhase(ph.id);
                          setActiveTab("tasks");
                        }}
                        style={{
                          padding: "6px 14px",
                          fontSize: "12px",
                          fontWeight: 600,
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border-color)",
                          backgroundColor: "var(--bg-input)",
                          color: "var(--text-primary)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--border-color-hover)";
                          e.currentTarget.style.backgroundColor =
                            "rgba(0, 0, 0, 0.01)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--border-color)";
                          e.currentTarget.style.backgroundColor =
                            "var(--bg-input)";
                        }}
                      >
                        View tasks
                      </button>
                    </div>
                  </div>

                  <div className="phase-detail-progress">
                    <div
                      className="phase-detail-progress-bar"
                      style={{ width: `${s.pct}%`, backgroundColor: ph.color }}
                    />
                  </div>

                  <div className="exit-gate-box">
                    <div className="exit-gate-title">
                      <Lock size={12} style={{ color: ph.color }} />
                      Phase Exit Gate Invariants
                    </div>
                    <div className="exit-gate-text">{ph.exitGate}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <div>
            <div className="tasks-control-bar">
              <div className="filter-buttons">
                {[
                  ["all", "All Tasks"],
                  ["critical", "Critical Path"],
                  ["blocked", "Blocked"],
                  ["inprogress", "In Progress"],
                  ["notstarted", "Not Started"],
                  ["done", "Done"],
                ].map(([val, label]) => (
                  <button
                    key={val}
                    className={`filter-btn ${filter === val && !activePhase ? "active" : ""}`}
                    onClick={() => {
                      setFilter(val);
                      setActivePhase(null);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="phase-selector-pills">
                {PHASES.map((ph) => (
                  <button
                    key={ph.id}
                    className={`phase-pill ${activePhase === ph.id ? "active" : ""}`}
                    style={{
                      "--phase-color": ph.color,
                      backgroundColor:
                        activePhase === ph.id ? ph.color : "transparent",
                    }}
                    onClick={() => {
                      setActivePhase(activePhase === ph.id ? null : ph.id);
                    }}
                  >
                    {ph.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks list */}
            {(activePhase
              ? [PHASES.find((p) => p.id === activePhase)]
              : PHASES
            ).map((ph) => {
              if (!ph) return null;

              const phTasks = activePhase
                ? filteredTasks
                : filteredTasks.filter((t) => t.phase?.id === ph.id);

              if (phTasks.length === 0) return null;

              return (
                <div key={ph.id} style={{ marginBottom: "24px" }}>
                  {!activePhase && (
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: ph.color,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Milestone size={12} />
                      {ph.code} — {ph.title}
                    </div>
                  )}

                  {phTasks.map((task) => {
                    const st = taskStatus[task.id] || "Not Started";
                    const note = taskNotes[task.id] || "";
                    const isExpanded = expandedTask === task.id;
                    const isEditing = editingNote === task.id;

                    return (
                      <div
                        key={task.id}
                        className={`task-item ${isExpanded ? "expanded" : ""}`}
                        style={{ "--status-color": STATUS_COLORS[st] }}
                      >
                        <div
                          className="task-item-summary"
                          onClick={() =>
                            setExpandedTask(isExpanded ? null : task.id)
                          }
                        >
                          <div
                            className="task-status-indicator"
                            style={{ backgroundColor: STATUS_COLORS[st] }}
                          />
                          <div className="task-text">{task.text}</div>
                          <div className="task-meta">
                            {task.critical && (
                              <Badge
                                text="Critical"
                                color="var(--error)"
                                bg="rgba(186, 26, 26, 0.05)"
                              />
                            )}
                            <Badge
                              text={task.owner}
                              color="var(--primary)"
                              bg="rgba(1, 54, 38, 0.05)"
                            />
                            <ChevronDown className="task-chevron" size={14} />
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="task-expanded-details">
                            <div
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                color: "var(--text-muted)",
                                marginBottom: "8px",
                                letterSpacing: "0.04em",
                              }}
                            >
                              Update Status
                            </div>
                            <div className="status-picker">
                              {STATUS_OPTIONS.map((opt) => (
                                <button
                                  key={opt}
                                  className={`status-picker-btn ${st === opt ? "active" : ""}`}
                                  style={{ "--opt-color": STATUS_COLORS[opt] }}
                                  onClick={() => setStatus(task.id, opt)}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>

                            <div
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                color: "var(--text-muted)",
                                marginBottom: "8px",
                                letterSpacing: "0.04em",
                                marginTop: "12px",
                              }}
                            >
                              Notes
                            </div>
                            {isEditing ? (
                              <div className="task-note-box">
                                <textarea
                                  className="task-note-textarea"
                                  value={noteInput}
                                  onChange={(e) => setNoteInput(e.target.value)}
                                  placeholder="Add details, implementation remarks, links or blockages..."
                                />
                                <div className="task-note-actions">
                                  <button
                                    className="btn-save"
                                    onClick={() => {
                                      setNote(task.id, noteInput);
                                      setEditingNote(null);
                                    }}
                                  >
                                    Save Note
                                  </button>
                                  <button
                                    className="btn-cancel"
                                    onClick={() => setEditingNote(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="task-note-display">
                                <div className="task-note-text">
                                  {note ? (
                                    note
                                  ) : (
                                    <span className="task-note-empty">
                                      No notes added. Click edit to add notes.
                                    </span>
                                  )}
                                </div>
                                <button
                                  className="btn-edit-note"
                                  onClick={() => {
                                    setNoteInput(note);
                                    setEditingNote(task.id);
                                  }}
                                >
                                  ✎ Edit Note
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <div className="docs-grid">
            {DOCS.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="doc-card">
                  <div className="doc-card-top">
                    <span className="doc-id mono-display">{doc.id}</span>
                    <Badge
                      text={doc.version}
                      color="var(--primary)"
                      bg="rgba(1, 54, 38, 0.05)"
                    />
                  </div>
                  <div className="doc-title">{doc.title}</div>
                  <div className="doc-link-label">
                    Open in Workspace
                    <ExternalLink size={12} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* RISKS TAB */}
        {activeTab === "risks" && (
          <div>
            {RISKS.map((risk) => {
              const rs = riskStatus[risk.id] || risk.defaultStatus;
              const probColor =
                {
                  High: "#ef4444",
                  Medium: "#f59e0b",
                  Low: "#22c55e",
                }[risk.prob] || "#6b7280";
              const impColor =
                {
                  High: "#ef4444",
                  Medium: "#f59e0b",
                  Low: "#22c55e",
                }[risk.impact] || "#6b7280";

              return (
                <div key={risk.id} className="risk-card">
                  <div className="risk-header">
                    <div className="risk-title">{risk.title}</div>
                    <div className="risk-badges">
                      <Badge
                        text={`Prob: ${risk.prob}`}
                        color={probColor}
                        bg={`rgba(${hexToRgb(probColor)}, 0.05)`}
                      />
                      <Badge
                        text={`Impact: ${risk.impact}`}
                        color={impColor}
                        bg={`rgba(${hexToRgb(impColor)}, 0.05)`}
                      />

                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                          }}
                        >
                          Status:
                        </span>
                        <select
                          value={rs}
                          onChange={(e) => setRisk(risk.id, e.target.value)}
                          style={{
                            padding: "3px 12px 3px 8px",
                            fontSize: "11px",
                            fontWeight: 600,
                            borderRadius: "20px",
                            borderColor: "var(--border-color)",
                            backgroundColor: "var(--bg-input)",
                            cursor: "pointer",
                          }}
                        >
                          {["Open", "Mitigated", "Closed", "Watch"].map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="risk-mitigation-box">
                    <span className="risk-mitigation-label">
                      Mitigation Strategy:
                    </span>
                    {risk.mitigation}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DECISIONS TAB */}
        {activeTab === "decisions" && (
          <div>
            <div className="decisions-list">
              {DECISIONS.map((d) => {
                const isResolved = d.status === "Resolved";
                const cardColor = isResolved
                  ? "var(--success)"
                  : d.status === "Pending Commercial"
                    ? "var(--warning)"
                    : "var(--primary)";

                return (
                  <div
                    key={d.id}
                    className="decision-card"
                    style={{ borderLeftColor: cardColor }}
                  >
                    <div className="decision-header">
                      <div>
                        <span className="decision-ref mono-display">
                          {d.ref}
                        </span>
                        <span className="decision-title">{d.title}</span>
                      </div>
                      <Badge
                        text={d.status}
                        color={cardColor}
                        bg={
                          isResolved
                            ? "var(--success-bg)"
                            : d.status === "Pending Commercial"
                              ? "var(--warning-bg)"
                              : "var(--primary-glow)"
                        }
                      />
                    </div>
                    <div className="decision-detail">{d.detail}</div>
                  </div>
                );
              })}
            </div>

            <div className="decision-info-banner">
              <Info
                size={18}
                style={{ color: "#065f46", flexShrink: 0, marginTop: "2px" }}
              />
              <div className="decision-info-banner-content">
                <h3>All architectural decisions resolved except OD-2</h3>
                <p>
                  OD-2 (KCB Klub Card) is currently blocked on the commercial
                  track, not the technical track. The payout adapter integration
                  has been built and sits ready in the codebase's PayoutModule.
                  No engineering action is required until KCB commercial terms
                  are executed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === "notes" && (
          <NotesPanel
            notes={notes}
            noteForm={noteForm}
            setNoteForm={setNoteForm}
            notesLoading={notesLoading}
            notesError={notesError}
            onCreateNote={createNote}
          />
        )}
      </main>
    </div>
  );
}
