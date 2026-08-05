# PR Title
chore(seed): add script to generate idempotent DB seeds from local export

# PR Body

## Overview
This PR adds a seed generator script that creates idempotent database seeds from local export data, parsing PHASES from App.jsx and mapping task statuses/notes to SQL and JSON outputs.

## Inputs
- **PHASES**: Extracted programmatically from `apps/dashboard/src/App.jsx` using AST parsing (@babel/parser) with regex fallback
- **Local export**: `dlrs-local-export.json` (or `dlrs_local_export.json` at root) containing:
  - `dlrs_task_status`: Task status mappings (JSON string or wrapped object)
  - `dlrs_task_notes`: Per-task notes
  - `dlrs_risk_status`: Risk status mappings
  - `dlrs_notes`: Global notes
- **Optional notes**: `data/notes.json` for server-side notes export

## Outputs
- **`out/seed.sql`**: Idempotent SQL with:
  - Explicit UUID literals (deterministic via uuid v5)
  - ON CONFLICT clauses for safe re-runs
  - Comments documenting input files and timestamps
  - Tables: `phases`, `tasks`, `task_notes`, `notes`
- **`out/seed.json`**: Normalized JSON for TypeORM/knex seeders:
  ```json
  {
    "phases": [],
    "tasks": [],
    "task_notes": [],
    "documents": [],
    "notes": []
  }
  ```
- **`out/mapping-report.json`**: Detailed mapping report with matched/unmatched items

## CLI Usage

### Basic usage (safe default - DO NOTHING on conflict)
```bash
npm run generate-seed
# or
node scripts/generate-seed-from-local.js --local=dlrs_local_export.json --out=out/seed.sql --json=out/seed.json
```

### With custom paths
```bash
node scripts/generate-seed-from-local.js \
  --phases=apps/dashboard/src/App.jsx \
  --local=data/dlrs-local-export.json \
  --notes=data/notes.json \
  --out=out/seed.sql \
  --json=out/seed.json
```

### Conflict policy options
```bash
# Prefer local values (update status from local export)
node scripts/generate-seed-from-local.js --prefer-local

# Force upsert all fields
node scripts/generate-seed-from-local.js --force-upsert

# Default: safe mode (DO NOTHING on conflict)
node scripts/generate-seed-from-local.js
```

### Dry-run and validation
```bash
# Preview without writing files
node scripts/generate-seed-from-local.js --dry-run

# Validate SQL against real DB (transaction + rollback)
node scripts/generate-seed-from-local.js --validate-db="postgresql://user:pass@localhost:5432/db"
```

## Features

### Deterministic UUIDs
- Uses uuid v5 with project-specific namespace (`a3f5c8d2-7b4e-4f9a-8c1d-2e6b5a9f3c8d`)
- Identical inputs always produce identical UUIDs
- No dependency on DB functions like `gen_random_uuid()`

### Robust Parsing
- AST parsing for App.jsx PHASES extraction (not brittle regex)
- Handles both JSON strings and `{ value: "..." }` wrapper shapes from local storage
- Graceful fallback to phases.json if App.jsx parsing fails

### Task Matching
- Primary: Match by task ID from PHASES
- Fallback: Match by deterministic slug (normalized title)
- Logs warnings for ambiguous matches

### Idempotency
- Default: `ON CONFLICT DO NOTHING` (safe)
- Optional: `ON CONFLICT DO UPDATE` with `--prefer-local` or `--force-upsert`
- Re-running script is safe at any time

### Audit Trail
- SQL comments include input file paths and generation timestamp
- Mapping report tracks all matched/unmatched items
- Preserves original timestamps where present

## Verification Steps

### 1. Test generation
```bash
npm run generate-seed
```

### 2. Review mapping report
```bash
cat out/mapping-report.json
```
Check for:
- `mappedTasks`: All tasks should be matched by ID or slug
- `unmappedStatuses`: Should be empty (or reviewed if present)
- `unmappedNotes`: Should be empty (or reviewed if present)

### 3. Validate SQL syntax (optional)
```bash
# If you have a test DB
node scripts/generate-seed-from-local.js --validate-db="postgresql://user:pass@localhost:5432/test_db"
```

### 4. Test in ephemeral environment
```bash
# Create temporary DB
createdb test_seed

# Apply seed
psql -U user -d test_seed -f out/seed.sql

# Verify counts
psql -U user -d test_seed -c "SELECT COUNT(*) FROM phases;"  # Should be 7
psql -U user -d test_seed -c "SELECT COUNT(*) FROM tasks;"   # Should be 110

# Test idempotency (run again)
psql -U user -d test_seed -f out/seed.sql
# Counts should remain unchanged

# Cleanup
dropdb test_seed
```

### 5. Apply to staging (with backup)
```bash
# Backup existing DB
pg_dump -U user -d staging_db > backup_before_seed.sql

# Apply seed
psql -U user -d staging_db -f out/seed.sql

# Verify
psql -U user -d staging_db -c "SELECT COUNT(*) FROM phases;"
psql -U user -d staging_db -c "SELECT COUNT(*) FROM tasks;"
```

## Rollback Plan
If issues occur after applying seed:
```bash
# Restore from backup
psql -U user -d staging_db < backup_before_seed.sql

# Or manually delete seeded rows (if no backup)
psql -U user -d staging_db -c "DELETE FROM tasks WHERE phase_id IN (SELECT id FROM phases WHERE slug LIKE 'phase%');"
psql -U user -d staging_db -c "DELETE FROM phases WHERE slug LIKE 'phase%';"
```

## Dependencies Added
- `@babel/parser`: AST parsing for App.jsx
- `minimist`: CLI argument parsing
- `uuid`: Deterministic UUID v5 generation
- `fs-extra`: Enhanced file operations
- `chalk`: Colored console output

## Default Conflict Policy
**Safe mode (default)**: `ON CONFLICT DO NOTHING`
- Phases: Insert if missing, skip if exists
- Tasks: Insert if missing, skip if exists
- Notes: Insert if missing, skip if exists

This ensures the seed can be re-run safely without overwriting existing data. Use `--prefer-local` to update task statuses from local export when intentional.
