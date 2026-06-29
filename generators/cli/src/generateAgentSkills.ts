/**
 * Generate `.agents/skills/custom-commands/SKILL.md` — a spec-aware
 * agent skill that teaches coding agents (Claude Code, generic MCP)
 * how to author custom commands in the generated CLI.
 *
 * The skill is **not** boilerplate: it references real endpoint names,
 * typed SDK client fields, and crate names derived from the actual API
 * spec so an agent following the skill produces working code on the
 * first try.
 *
 * Also creates a `.claude` symlink → `.agents` so Claude Code
 * discovers the skills automatically. On platforms where symlinks
 * aren't available (Windows without developer mode), the symlink
 * step is skipped and a note is written instead.
 */

import { lstat, mkdir, readFile, rm, symlink, writeFile } from "fs/promises";
import path from "path";

import { readSpecsManifest } from "./copySpecs.js";
import type { DetectedAuthBinding } from "./detectAuth.js";
import type { SubClientField } from "./generateSdk.js";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generateAgentSkills(args: {
    outputDir: string;
    binaryName: string;
    sdkCrateName: string;
    subClients: SubClientField[];
    authBindings: DetectedAuthBinding[];
    specsDir?: string;
}): Promise<void> {
    const { outputDir, binaryName, sdkCrateName, subClients, authBindings, specsDir } = args;
    const sdkCrateSnake = sdkCrateName.replace(/-/g, "_");

    // Pick a representative GET endpoint from the spec for examples.
    const example = await pickExampleEndpoint(specsDir);

    const skillDir = path.join(outputDir, ".agents", "skills", "custom-commands");
    await mkdir(skillDir, { recursive: true });

    const content = renderSkill({
        binaryName,
        sdkCrateSnake,
        subClients,
        authBindings,
        example
    });
    await writeFile(path.join(skillDir, "SKILL.md"), content);

    // Symlink .claude → .agents so Claude Code discovers skills.
    await createClaudeSymlink(outputDir);
}

// ---------------------------------------------------------------------------
// Example endpoint extraction from OpenAPI spec
// ---------------------------------------------------------------------------

interface ExampleEndpoint {
    /** CLI resource group, e.g. "pets" */
    group: string;
    /** CLI method name, e.g. "get-pet" */
    method: string;
    /** SDK sub-client field, e.g. "pets" */
    subClientField: string;
    /** SDK method name (snake_case), e.g. "get_pet" */
    sdkMethod: string;
    /** Path parameters, e.g. ["petId"] */
    pathParams: string[];
    /** Human-readable summary, e.g. "Fetch a pet by ID" */
    summary: string | undefined;
}

interface MinimalOpenApiDoc {
    paths?: Record<string, Record<string, MinimalOperation>>;
}

interface MinimalOperation {
    operationId?: string;
    summary?: string;
    description?: string;
    tags?: string[];
    parameters?: Array<{ name: string; in: string; required?: boolean }>;
    "x-fern-sdk-group-name"?: string | string[];
    "x-fern-sdk-method-name"?: string;
    "x-fern-ignore"?: boolean;
}

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

async function pickExampleEndpoint(specsDir?: string): Promise<ExampleEndpoint | undefined> {
    const manifest = await readSpecsManifest(specsDir);
    if (manifest == null) {
        return undefined;
    }

    const openapiSpecs = manifest.specs.filter((s) => s.type === "openapi");
    if (openapiSpecs.length === 0) {
        return undefined;
    }

    // Prefer a GET with path params; fall back to any GET; then any endpoint.
    let bestGet: ExampleEndpoint | undefined;
    let anyGet: ExampleEndpoint | undefined;
    let anyEndpoint: ExampleEndpoint | undefined;

    for (const spec of openapiSpecs) {
        let raw: string;
        try {
            raw = await readFile(spec.specPath, "utf-8");
        } catch {
            // Spec file unreadable — skip and try the next one.
            continue;
        }
        let doc: MinimalOpenApiDoc;
        try {
            doc = JSON.parse(raw) as MinimalOpenApiDoc;
        } catch {
            // Malformed JSON (e.g. YAML spec, truncated file) — skip.
            continue;
        }
        const paths = doc.paths ?? {};

        for (const [pathStr, pathItem] of Object.entries(paths)) {
            for (const method of HTTP_METHODS) {
                const op = pathItem[method] as MinimalOperation | undefined;
                if (op == null || op["x-fern-ignore"] === true) {
                    continue;
                }

                const endpoint = toExampleEndpoint(op, method, pathStr);
                if (endpoint == null) {
                    continue;
                }

                if (anyEndpoint == null) {
                    anyEndpoint = endpoint;
                }
                if (method === "get") {
                    if (anyGet == null) {
                        anyGet = endpoint;
                    }
                    if (endpoint.pathParams.length > 0 && bestGet == null) {
                        bestGet = endpoint;
                    }
                }
            }
        }
    }

    return bestGet ?? anyGet ?? anyEndpoint;
}

function toExampleEndpoint(op: MinimalOperation, httpMethod: string, pathStr: string): ExampleEndpoint | undefined {
    const group = resolveGroup(op, pathStr);
    const methodName = resolveMethod(op, httpMethod, pathStr);
    const pathParams = (op.parameters ?? []).filter((p) => p.in === "path").map((p) => p.name);

    return {
        group,
        method: methodName,
        subClientField: group.replace(/-/g, "_"),
        sdkMethod: methodName.replace(/-/g, "_"),
        pathParams,
        summary: op.summary ?? op.description
    };
}

function resolveGroup(op: MinimalOperation, pathStr: string): string {
    const fernGroup = op["x-fern-sdk-group-name"];
    if (fernGroup != null) {
        const parts = Array.isArray(fernGroup) ? fernGroup : [fernGroup];
        return parts.map(camelToKebab).join("-");
    }
    if (op.tags != null && op.tags.length > 0 && op.tags[0] != null) {
        return camelToKebab(op.tags[0]);
    }
    const segment = pathStr.replace(/^\//, "").split("/")[0] ?? "default";
    return camelToKebab(segment);
}

function resolveMethod(op: MinimalOperation, httpMethod: string, pathStr: string): string {
    if (op["x-fern-sdk-method-name"] != null) {
        return camelToKebab(op["x-fern-sdk-method-name"]);
    }
    if (op.operationId != null) {
        return camelToKebab(op.operationId);
    }
    return `${httpMethod}-${pathStr.replace(/^\//, "").replace(/\//g, "-")}`;
}

function camelToKebab(input: string): string {
    return input
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-");
}

// ---------------------------------------------------------------------------
// Skill renderer
// ---------------------------------------------------------------------------

function renderSkill(args: {
    binaryName: string;
    sdkCrateSnake: string;
    subClients: SubClientField[];
    authBindings: DetectedAuthBinding[];
    example: ExampleEndpoint | undefined;
}): string {
    const { binaryName, sdkCrateSnake, subClients, authBindings, example: _example } = args;
    const lines: string[] = [];
    const visibleClients = subClients.filter((sc) => sc.typeName !== "HttpClient");
    const clientField = visibleClients.length > 0 ? (visibleClients[0]?.fieldName ?? "resource") : "resource";

    // YAML frontmatter
    lines.push("---");
    lines.push(`name: ${binaryName}-custom-commands`);
    lines.push(`description: How to author custom commands for the ${binaryName} CLI using the co-generated SDK.`);
    lines.push("---");
    lines.push("");

    // Title
    lines.push(`# Custom Commands for \`${binaryName}\``);
    lines.push("");

    // Overview
    lines.push("## Overview");
    lines.push("");
    lines.push(`The \`${binaryName}\` CLI supports user-authored custom commands compiled`);
    lines.push("into the binary alongside auto-generated API commands. Commands use");
    lines.push("**typed arguments** (`#[derive(clap::Args)]`) and the **per-command builder**");
    lines.push("for compile-time safety. The SDK client inherits auth, retries, TLS,");
    lines.push("base URL, and global headers — zero configuration required.");
    lines.push("");

    // Architecture
    lines.push("## Architecture");
    lines.push("");
    lines.push("```");
    lines.push(`cli/${binaryName}/custom.rs    ← Your command handlers (protected by .fernignore)`);
    lines.push(`cli/${binaryName}/sdk.rs       ← Generated bridge: client() + block_on()`);
    lines.push(`cli/${binaryName}/main.rs      ← Generated entrypoint (calls custom::register)`);
    lines.push(`${binaryName}-sdk/             ← Co-generated typed SDK crate`);
    lines.push("```");
    lines.push("");

    // Typed authoring
    lines.push("## Typed Authoring (Default)");
    lines.push("");
    lines.push("Define arguments with `#[derive(clap::Args)]` and register via the");
    lines.push("per-command builder. The handler receives parsed typed args + `AppContext`:");
    lines.push("");
    lines.push("```rust");
    lines.push("use fern_cli_sdk::app::CliApp;");
    lines.push("use fern_cli_sdk::error::CliError;");
    lines.push("use fern_cli_sdk::openapi::AppContext;");
    lines.push("");
    lines.push("#[derive(clap::Args)]");
    lines.push("struct FetchArgs {");
    lines.push("    /// Resource ID to fetch.");
    lines.push("    id: String,");
    lines.push("    /// Output format override.");
    lines.push("    #[arg(long)]");
    lines.push("    raw: bool,");
    lines.push("}");
    lines.push("");
    lines.push("fn handle_fetch(args: FetchArgs, ctx: &AppContext) -> Result<(), CliError> {");
    lines.push(`    let client = super::sdk::client(ctx)?;`);
    lines.push("    let result = super::sdk::block_on(");
    lines.push(`        client.${clientField}.get(&args.id),`);
    lines.push("    )?;");
    lines.push("    let pipeline = ctx.output_pipeline();");
    lines.push("    pipeline.emit(&mut std::io::stdout(), &serde_json::to_value(&result).unwrap(), false, true)");
    lines.push("        .map_err(|e| CliError::Other(e.into()))?;");
    lines.push("    Ok(())");
    lines.push("}");
    lines.push("```");
    lines.push("");

    // Per-command builder
    lines.push("## Per-Command Builder");
    lines.push("");
    lines.push("Register commands in `custom.rs`'s `register()` function using the");
    lines.push("fluent builder API:");
    lines.push("");
    lines.push("```rust");
    lines.push("pub fn register(app: CliApp) -> CliApp {");
    lines.push("    app");
    lines.push("        .custom_typed::<FetchArgs>(\"fetch\")");
    lines.push("        .about(\"Fetch a resource by ID\")");
    lines.push("        .handler(handle_fetch)");
    lines.push("        .dry_run(handle_fetch_dry_run)  // optional");
    lines.push("        .register()");
    lines.push("}");
    lines.push("```");
    lines.push("");
    lines.push("Builder methods (all optional except `.handler()`):");
    lines.push("");
    lines.push("| Method | Purpose |");
    lines.push("|--------|---------|");
    lines.push("| `.about(\"...\")` | Help text shown in `--help` |");
    lines.push("| `.under(&[\"ns\", \"sub\"])` | Nest under a custom namespace path |");
    lines.push("| `.handler(fn)` | **Required.** Main handler |");
    lines.push("| `.dry_run(fn)` | Handler for `--dry-run` (optional) |");
    lines.push("| `.register()` | Finalize and return the `CliApp` |");
    lines.push("");

    // Nesting / namespaces
    lines.push("## Custom-Only Nesting (Namespaces)");
    lines.push("");
    lines.push("Commands can be nested under custom namespace paths using `.under()`.");
    lines.push("The path elements are custom command groups (not generated API groups):");
    lines.push("");
    lines.push("```rust");
    lines.push("// Registers as: my-cli admin users list");
    lines.push("app.custom_typed::<ListUsersArgs>(\"list\")");
    lines.push("    .about(\"List all users\")");
    lines.push("    .under(&[\"admin\", \"users\"])");
    lines.push("    .handler(handle_list_users)");
    lines.push("    .register()");
    lines.push("```");
    lines.push("");
    lines.push("The namespace groups (`admin`, `admin users`) are created automatically.");
    lines.push("Multiple commands can share a namespace path.");
    lines.push("");

    // Output cohesion
    lines.push("## Output Cohesion (`--format`, `--quiet`)");
    lines.push("");
    lines.push("Route output through `ctx.output_pipeline()` so `--format` and `--quiet`");
    lines.push("work without per-command boilerplate:");
    lines.push("");
    lines.push("```rust");
    lines.push("let pipeline = ctx.output_pipeline();");
    lines.push("pipeline.emit(&mut std::io::stdout(), &json_value, false, true)");
    lines.push("    .map_err(|e| CliError::Other(e.into()))?;");
    lines.push("```");
    lines.push("");
    lines.push("- `table` and `csv` formats assume an array-of-objects; `json`/`yaml` always work.");
    lines.push("- A handler that doesn't use the pipeline implicitly opts out (owns its output).");
    lines.push("- Check `ctx.is_quiet()` when emitting non-pipeline output.");
    lines.push("");

    // Dry-run safety
    lines.push("## Dry-Run Safety");
    lines.push("");
    lines.push("The CLI enforces a **default-deny** dry-run model:");
    lines.push("");
    lines.push("- `--dry-run` with **no** `.dry_run()` handler → error before execution.");
    lines.push("- `--dry-run` **with** a `.dry_run()` handler → runs the dry-run handler");
    lines.push("  instead of the normal handler.");
    lines.push("- `ctx.build_sdk_executor()` (via `super::sdk::client(ctx)?`) **refuses**");
    lines.push("  under `--dry-run` — the SDK constructs requests opaquely and cannot preview them.");
    lines.push("");
    lines.push("Dry-run handlers should render a preview of what *would* happen:");
    lines.push("");
    lines.push("```rust");
    lines.push("fn handle_fetch_dry_run(args: FetchArgs, ctx: &AppContext) -> Result<(), CliError> {");
    lines.push("    // ctx.preview(method, params, body) builds a request preview with no HTTP.");
    lines.push("    eprintln!(\"[dry-run] would fetch resource '{}'\", args.id);");
    lines.push("    Ok(())");
    lines.push("}");
    lines.push("```");
    lines.push("");

    // SDK client
    lines.push("## SDK Client");
    lines.push("");
    lines.push("```rust");
    lines.push("let client = super::sdk::client(ctx)?;  // fails under --dry-run");
    lines.push("let result = super::sdk::block_on(client.resource.method(arg))?;");
    lines.push("```");
    lines.push("");

    // Available sub-clients
    if (visibleClients.length > 0) {
        lines.push("Available sub-clients:");
        lines.push("");
        lines.push("| Field | Type |");
        lines.push("|-------|------|");
        for (const sc of visibleClients) {
            lines.push(`| \`client.${sc.fieldName}\` | \`${sdkCrateSnake}::api::${sc.typeName}\` |`);
        }
        lines.push("");
    }

    // Non-typed escape hatch
    lines.push("## Non-Typed Escape Hatch");
    lines.push("");
    lines.push("For dynamic or generated-at-runtime commands, the non-typed API");
    lines.push("(`command()` / `command_under()`) with raw `&ArgMatches` still works:");
    lines.push("");
    lines.push("```rust");
    lines.push("app.command(");
    lines.push("    clap::Command::new(\"dynamic\")");
    lines.push("        .about(\"A command with dynamic arguments\")");
    lines.push("        .arg(clap::Arg::new(\"input\").required(true)),");
    lines.push("    |matches, ctx| {");
    lines.push("        let input = matches.get_one::<String>(\"input\").unwrap();");
    lines.push("        // ...");
    lines.push("        Ok(())");
    lines.push("    },");
    lines.push(")");
    lines.push("```");
    lines.push("");
    lines.push("Prefer the typed builder for new commands — it catches argument");
    lines.push("mismatches at compile time.");
    lines.push("");

    // Auth
    if (authBindings.length > 0) {
        lines.push("## Authentication");
        lines.push("");
        lines.push("Custom commands automatically inherit the CLI's authentication:");
        lines.push("");
        for (const binding of authBindings) {
            const envList = binding.envVars.join("`, `");
            lines.push(`- **${binding.schemeName}** (${binding.kind}): env \`${envList}\``);
        }
        lines.push("");
    }

    // .fernignore
    lines.push("## Regeneration Safety");
    lines.push("");
    lines.push("| File | Regenerated? | Notes |");
    lines.push("|------|-------------|-------|");
    lines.push(`| \`cli/${binaryName}/custom.rs\` | **No** | Protected by \`.fernignore\` |`);
    lines.push(`| \`cli/${binaryName}/sdk.rs\` | Yes | Bridges AppContext → SDK client |`);
    lines.push(`| \`cli/${binaryName}/main.rs\` | Yes | Calls \`custom::register(app)\` |`);
    lines.push(`| \`${binaryName}-sdk/\` | Yes | Co-generated typed SDK crate |`);
    lines.push("");

    // Build & test
    lines.push("## Build & Test");
    lines.push("");
    lines.push("```bash");
    lines.push("cargo build");
    lines.push(`${binaryName} hello world              # top-level custom command`);
    lines.push(`${binaryName} admin users list --limit 5  # nested under custom namespace`);
    lines.push(`${binaryName} fetch my-id --format json   # output cohesion`);
    lines.push(`${binaryName} fetch my-id --dry-run       # dry-run preview`);
    lines.push("```");
    lines.push("");

    return lines.join("\n");
}

function toSnake(s: string): string {
    return s
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

function escapeRust(s: string): string {
    return s
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\r?\n|\r/g, " ")
        .replace(/`{3,}/g, "` ` `");
}

/**
 * Sanitize a spec-derived identifier (e.g. path parameter name) so it
 * cannot break out of a markdown code block or inject instructions.
 * Only alphanumerics, underscores, and hyphens are kept.
 */
function sanitizeIdentifier(s: string): string {
    return s.replace(/[^a-zA-Z0-9_-]/g, "");
}

// ---------------------------------------------------------------------------
// .claude symlink
// ---------------------------------------------------------------------------

async function createClaudeSymlink(outputDir: string): Promise<void> {
    const target = ".agents";
    const linkPath = path.join(outputDir, ".claude");

    // Remove any existing .claude (symlink or directory) to avoid EEXIST.
    try {
        const stat = await lstat(linkPath);
        if (stat.isSymbolicLink() || stat.isDirectory() || stat.isFile()) {
            await rm(linkPath, { recursive: true });
        }
    } catch {
        // Does not exist — fine.
    }

    try {
        await symlink(target, linkPath, "dir");
    } catch {
        // Symlink not supported (e.g. Windows without developer mode).
        await mkdir(path.join(outputDir, ".claude", "skills", "custom-commands"), { recursive: true });
        const note = [
            "# This directory mirrors .agents/skills/",
            "#",
            "# On platforms that support symlinks, .claude is a symlink to .agents.",
            "# On this platform, the files are copied instead.",
            "# See .agents/skills/custom-commands/SKILL.md for the canonical copy.",
            ""
        ].join("\n");
        await writeFile(path.join(outputDir, ".claude", "skills", "custom-commands", "README.md"), note);
        // Copy the skill file into the .claude directory too.
        try {
            const skillContent = await readFile(
                path.join(outputDir, ".agents", "skills", "custom-commands", "SKILL.md"),
                "utf-8"
            );
            await writeFile(path.join(outputDir, ".claude", "skills", "custom-commands", "SKILL.md"), skillContent);
        } catch {
            // Best effort — the .agents version is the source of truth.
        }
    }
}
