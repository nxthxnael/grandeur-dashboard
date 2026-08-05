#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const minimist = require("minimist");
const { v5: uuidv5 } = require("uuid");
const fsExtra = require("fs-extra");
const chalk = require("chalk").default;

// Project-specific namespace for UUID v5 (generated for this repo)
const NAMESPACE_UUID = "a3f5c8d2-7b4e-4f9a-8c1d-2e6b5a9f3c8d";

// Parse CLI arguments
const argv = minimist(process.argv.slice(2), {
  string: ["phases", "local", "notes", "out", "json", "validate-db"],
  boolean: ["dry-run", "prefer-local", "prefer-server", "force-upsert", "help"],
  default: {
    phases: "apps/dashboard/src/App.jsx",
    local: "data/dlrs-local-export.json",
    notes: "data/notes.json",
    out: "out/seed.sql",
    json: "out/seed.json",
    "dry-run": false,
    "prefer-local": false,
    "prefer-server": false,
    "force-upsert": false,
    help: false,
  },
});

if (argv.help) {
  console.log(`
Usage: node scripts/generate-seed-from-local.js [options]

Options:
  --phases <path>        Path to App.jsx or phases.json (default: apps/dashboard/src/App.jsx)
  --local <path>         Path to dlrs-local-export.json (default: data/dlrs-local-export.json)
  --notes <path>         Path to notes.json (optional, default: data/notes.json)
  --out <path>           Output SQL file (default: out/seed.sql)
  --json <path>          Output JSON file (default: out/seed.json)
  --dry-run              Print summary without writing files
  --prefer-local         Update server status with local values (ON CONFLICT DO UPDATE)
  --prefer-server        Do not overwrite existing DB values (default: ON CONFLICT DO NOTHING)
  --force-upsert         Force upsert for all fields
  --validate-db <conn>   Validate SQL against DB connection string (transaction + rollback)
  --help                 Show this help message

Examples:
  node scripts/generate-seed-from-local.js --local=data/dlrs-local-export.json --out=out/seed.sql --json=out/seed.json
  node scripts/generate-seed-from-local.js --dry-run --prefer-local
  node scripts/generate-seed-from-local.js --validate-db="postgresql://user:pass@localhost:5432/db"
`);
  process.exit(0);
}

// Logging utilities
const log = {
  info: (msg) => console.log(chalk.blue("ℹ"), msg),
  success: (msg) => console.log(chalk.green("✓"), msg),
  warn: (msg) => console.log(chalk.yellow("⚠"), msg),
  error: (msg) => console.log(chalk.red("✗"), msg),
  section: (msg) => console.log(chalk.bold.cyan("\n" + msg + "\n")),
};

// Slug generation
function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Convert raw JS value to SQL literal
function toSqlLiteral(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return value.toString();
  if (typeof value === "string") return "'" + value.replace(/'/g, "''") + "'";
  return "NULL";
}

// Parse App.jsx using AST to extract PHASES
function parsePhasesFromAppjsx(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const ast = parser.parse(content, {
      sourceType: "module",
      plugins: ["jsx"],
    });

    let phases = null;

    function traverse(node) {
      if (!node) return;

      // Look for export const PHASES = [...]
      if (
        node.type === "ExportNamedDeclaration" &&
        node.declaration &&
        node.declaration.type === "VariableDeclaration" &&
        node.declaration.declarations[0].id.name === "PHASES"
      ) {
        const init = node.declaration.declarations[0].init;
        if (init && init.type === "ArrayExpression") {
          // Evaluate the array expression by extracting source code
          try {
            const code = content.slice(init.start, init.end);
            phases = eval(`(${code})`);
          } catch (e) {
            log.warn(`Could not evaluate PHASES AST: ${e.message}`);
          }
        }
      }

      for (const key in node) {
        if (node[key] && typeof node[key] === "object") {
          traverse(node[key]);
        }
      }
    }

    traverse(ast);

    if (phases) {
      log.success(`Extracted ${phases.length} phases from ${filePath}`);
      return phases;
    }

    // Fallback: regex extraction
    log.warn("AST parsing failed, falling back to regex extraction");
    const phasesMatch = content.match(
      /export const PHASES\s*=\s*(\[[\s\S]*?\]);/,
    );
    if (phasesMatch) {
      phases = eval(phasesMatch[1]);
      log.success(`Extracted ${phases.length} phases via regex fallback`);
      return phases;
    }

    throw new Error("Could not extract PHASES from App.jsx");
  } catch (error) {
    log.error(`Failed to parse App.jsx: ${error.message}`);
    return null;
  }
}

// Load and parse local export with wrapper handling
function loadLocalExport(filePath) {
  try {
    // Try multiple possible locations
    const possiblePaths = [
      filePath,
      path.resolve(process.cwd(), filePath),
      path.resolve(process.cwd(), "dlrs_local_export.json"),
      path.resolve(process.cwd(), "data", "dlrs-local-export.json"),
    ];

    let content = null;
    let loadedPath = null;

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        content = fs.readFileSync(p, "utf-8");
        loadedPath = p;
        break;
      }
    }

    if (!content) {
      throw new Error(
        `Local export file not found at any of: ${possiblePaths.join(", ")}`,
      );
    }

    log.success(`Loaded local export from ${loadedPath}`);

    let data = JSON.parse(content);

    // Handle wrapper shapes
    const unwrap = (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      if (val && typeof val === "object" && val.value !== undefined) {
        return unwrap(val.value);
      }
      return val;
    };

    return {
      dlrs_task_status: unwrap(data.dlrs_task_status) || {},
      dlrs_task_notes: unwrap(data.dlrs_task_notes) || {},
      dlrs_risk_status: unwrap(data.dlrs_risk_status) || {},
      dlrs_notes: unwrap(data.dlrs_notes) || null,
    };
  } catch (error) {
    log.error(`Failed to load local export: ${error.message}`);
    return null;
  }
}

// Load notes.json if present
function loadNotes(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      log.info(`Notes file not found at ${filePath} (optional)`);
      return [];
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const notes = JSON.parse(content);
    log.success(`Loaded ${notes.length} notes from ${filePath}`);
    return notes;
  } catch (error) {
    log.warn(`Failed to load notes: ${error.message}`);
    return [];
  }
}

// Generate deterministic UUID
function generateDeterministicId(input, namespace = NAMESPACE_UUID) {
  return uuidv5(input, namespace);
}

// Generate SQL INSERT with ON CONFLICT
function generateInsert(
  table,
  columns,
  values,
  conflictColumn,
  conflictAction = "DO NOTHING",
  updateColumns = [],
) {
  const colList = columns.join(", ");
  const valList = values.map((v) => toSqlLiteral(v)).join(", ");

  let sql = `INSERT INTO ${table} (${colList}) VALUES (${valList})`;

  if (conflictColumn) {
    sql += ` ON CONFLICT (${conflictColumn})`;

    if (conflictAction === "DO UPDATE" && updateColumns.length > 0) {
      const updates = updateColumns
        .map((col) => {
          const val = values[columns.indexOf(col)];
          // Use EXCLUDED.col for upsert to reference the row being inserted
          return `${col} = ${val === null ? "EXCLUDED." + col : toSqlLiteral(val)}`;
        })
        .join(", ");
      sql += ` DO UPDATE SET ${updates}`;
    } else {
      sql += ` ${conflictAction}`;
    }
  }

  sql += ";\n";
  return sql;
}

// Main generation function
async function generateSeed() {
  log.section("Seed Generator");

  const timestamp = new Date().toISOString();
  log.info(`Timestamp: ${timestamp}`);

  // Load inputs
  let phases = parsePhasesFromAppjsx(argv.phases);
  if (!phases) {
    // Try phases.json fallback
    const phasesJsonPath = argv.phases.replace("App.jsx", "phases.json");
    if (fs.existsSync(phasesJsonPath)) {
      phases = JSON.parse(fs.readFileSync(phasesJsonPath, "utf-8"));
      log.success(`Loaded phases from ${phasesJsonPath} (fallback)`);
    } else {
      log.error("Could not load PHASES from App.jsx or phases.json");
      process.exit(1);
    }
  }

  const localExport = loadLocalExport(argv.local);
  if (!localExport) {
    log.error("Could not load local export");
    process.exit(1);
  }

  const notes = loadNotes(argv.notes);

  // Determine conflict policy
  const preferLocal = argv["prefer-local"];
  const forceUpsert = argv["force-upsert"];
  const conflictPolicy =
    preferLocal || forceUpsert ? "DO UPDATE" : "DO NOTHING";

  log.info(`Conflict policy: ${conflictPolicy}`);
  if (preferLocal)
    log.info("Mode: prefer-local (will update status from local export)");
  if (forceUpsert) log.info("Mode: force-upsert (will upsert all fields)");

  // Prepare output data
  const seedData = {
    phases: [],
    tasks: [],
    task_notes: [],
    documents: [],
    notes: [],
  };

  const mappingReport = {
    mappedTasks: [],
    unmappedStatuses: [],
    unmappedNotes: [],
  };

  let sql = `-- Seed generated at ${timestamp}\n`;
  sql += `-- Input: phases=${argv.phases}, local=${argv.local}, notes=${argv.notes}\n`;
  sql += `-- Conflict policy: ${conflictPolicy}\n\n`;

  // Process phases and tasks
  let taskOrdinal = 0;
  const taskStatusMap = localExport.dlrs_task_status;
  const taskNotesMap = localExport.dlrs_task_notes;

  for (const phase of phases) {
    const phaseSlug = generateSlug(phase.code);
    const phaseId = generateDeterministicId(phase.id);

    seedData.phases.push({
      id: phaseId,
      slug: phaseSlug,
      code: phase.code,
      title: phase.title,
      weeks: phase.weeks,
      color: phase.color,
      bg: phase.bg,
      exit_gate: phase.exitGate,
      created_at: timestamp,
      updated_at: timestamp,
    });

    sql += generateInsert(
      "phases",
      [
        "id",
        "slug",
        "code",
        "title",
        "weeks",
        "color",
        "bg",
        "exit_gate",
        "created_at",
        "updated_at",
      ],
      [
        phaseId,
        phaseSlug,
        phase.code,
        phase.title,
        phase.weeks,
        phase.color,
        phase.bg,
        phase.exitGate,
        timestamp,
        timestamp,
      ],
      "slug",
      "DO NOTHING",
    );

    // Process tasks in this phase
    for (const task of phase.tasks) {
      taskOrdinal++;
      const taskSlug = generateSlug(task.text);
      const taskId = generateDeterministicId(task.id);

      // Determine task status
      let taskStatus = taskStatusMap[task.id] || "Not Started";
      const statusMatched = !!taskStatusMap[task.id];

      if (!statusMatched && taskStatusMap[taskSlug]) {
        taskStatus = taskStatusMap[taskSlug];
      }

      seedData.tasks.push({
        id: taskId,
        slug: taskSlug,
        phase_id: phaseId,
        title: task.text,
        description: task.text,
        ordinal: taskOrdinal,
        critical: task.critical,
        owner: task.owner || null,
        status: taskStatus,
        created_at: timestamp,
        updated_at: timestamp,
      });

      // Determine conflict action for tasks
      const taskConflictAction =
        preferLocal || forceUpsert ? "DO UPDATE" : "DO NOTHING";
      const taskUpdateColumns =
        preferLocal || forceUpsert ? ["status", "updated_at"] : [];

      sql += generateInsert(
        "tasks",
        [
          "id",
          "slug",
          "phase_id",
          "title",
          "description",
          "ordinal",
          "critical",
          "owner",
          "status",
          "created_at",
          "updated_at",
        ],
        [
          taskId,
          taskSlug,
          phaseId,
          task.text,
          task.text,
          taskOrdinal,
          task.critical,
          task.owner || null,
          taskStatus,
          timestamp,
          timestamp,
        ],
        "slug",
        taskConflictAction,
        taskUpdateColumns,
      );

      mappingReport.mappedTasks.push({
        localId: task.id,
        generatedId: taskId,
        slug: taskSlug,
        matchedBy: statusMatched
          ? "id"
          : taskStatusMap[taskSlug]
            ? "slug"
            : "default",
        status: taskStatus,
      });

      // Process task notes
      const taskNote = taskNotesMap[task.id] || taskNotesMap[taskSlug];
      if (taskNote) {
        const taskNoteId = generateDeterministicId(`note-${task.id}`);

        seedData.task_notes.push({
          id: taskNoteId,
          task_id: taskId,
          content: taskNote,
          created_at: timestamp,
          updated_at: timestamp,
        });

        sql += generateInsert(
          "task_notes",
          ["id", "task_id", "content", "created_at", "updated_at"],
          [taskNoteId, taskId, taskNote, timestamp, timestamp],
          "id",
          "DO NOTHING",
        );
      }
    }
  }

  // Track unmatched statuses
  for (const [taskId, status] of Object.entries(taskStatusMap)) {
    const matched = mappingReport.mappedTasks.find(
      (t) => t.localId === taskId || t.slug === taskId,
    );
    if (!matched) {
      mappingReport.unmappedStatuses.push({ taskId, status });
    }
  }

  // Process global notes
  if (localExport.dlrs_notes && Array.isArray(localExport.dlrs_notes)) {
    for (const note of localExport.dlrs_notes) {
      const noteId = generateDeterministicId(
        `global-note-${note.id || Math.random()}`,
      );
      const noteCreatedAt = note.created_at || timestamp;

      seedData.notes.push({
        id: noteId,
        content: note.content,
        owner: note.owner || null,
        category: note.category || null,
        created_at: noteCreatedAt,
        updated_at: note.updated_at || noteCreatedAt,
      });

      sql += generateInsert(
        "notes",
        ["id", "content", "owner", "category", "created_at", "updated_at"],
        [
          noteId,
          note.content,
          note.owner || null,
          note.category || null,
          noteCreatedAt,
          note.updated_at || noteCreatedAt,
        ],
        "id",
        "DO NOTHING",
      );
    }
  }

  // Process notes from notes.json
  for (const note of notes) {
    const noteId =
      note.id || generateDeterministicId(`notes-json-${note.content}`);
    const noteCreatedAt = note.created_at || timestamp;

    seedData.notes.push({
      id: noteId,
      content: note.content,
      owner: note.owner || null,
      category: note.category || null,
      created_at: noteCreatedAt,
      updated_at: note.updated_at || noteCreatedAt,
    });

    sql += generateInsert(
      "notes",
      ["id", "content", "owner", "category", "created_at", "updated_at"],
      [
        noteId,
        note.content,
        note.owner || null,
        note.category || null,
        noteCreatedAt,
        note.updated_at || noteCreatedAt,
      ],
      "id",
      "DO NOTHING",
    );
  }

  // Print summary
  log.section("Summary");
  log.success(`Phases: ${seedData.phases.length}`);
  log.success(`Tasks: ${seedData.tasks.length}`);
  log.success(`Task notes: ${seedData.task_notes.length}`);
  log.success(`Notes: ${seedData.notes.length}`);

  if (mappingReport.unmappedStatuses.length > 0) {
    log.warn(
      `Unmapped task statuses: ${mappingReport.unmappedStatuses.length}`,
    );
    mappingReport.unmappedStatuses.forEach((u) =>
      log.warn(`  - ${u.taskId}: ${u.status}`),
    );
  }

  // Write mapping report
  const reportPath = path.resolve(
    path.dirname(argv.out),
    "mapping-report.json",
  );
  if (!argv["dry-run"]) {
    fsExtra.ensureDirSync(path.dirname(argv.out));
    fs.writeFileSync(reportPath, JSON.stringify(mappingReport, null, 2));
    log.success(`Mapping report written to ${reportPath}`);
  }

  // Dry-run mode
  if (argv["dry-run"]) {
    log.section("Dry-run mode - SQL preview (first 50 lines):");
    console.log(sql.split("\n").slice(0, 50).join("\n"));
    log.info("Files not written (dry-run mode)");
    return;
  }

  // Validate against DB if connection string provided
  if (argv["validate-db"]) {
    log.section("Validating SQL against database...");
    let Pool;
    try {
      Pool = require("pg").Pool;
    } catch (error) {
      log.error(
        "pg package not installed. Install it with: npm install --save-dev pg",
      );
      log.info("Or remove --validate-db flag to skip validation");
      process.exit(1);
    }

    const pool = new Pool({ connectionString: argv["validate-db"] });

    try {
      await pool.query("BEGIN");
      await pool.query(sql);
      await pool.query("ROLLBACK");
      log.success("SQL validation passed (transaction rolled back)");
    } catch (error) {
      await pool.query("ROLLBACK");
      log.error(`SQL validation failed: ${error.message}`);
      process.exit(1);
    } finally {
      await pool.end();
    }
  }

  // Write outputs
  log.section("Writing outputs");

  fsExtra.ensureDirSync(path.dirname(argv.out));
  fs.writeFileSync(argv.out, sql);
  log.success(`SQL written to ${argv.out}`);

  fsExtra.ensureDirSync(path.dirname(argv.json));
  fs.writeFileSync(argv.json, JSON.stringify(seedData, null, 2));
  log.success(`JSON written to ${argv.json}`);

  log.section("Complete");
}

// Run
generateSeed().catch((error) => {
  log.error(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
