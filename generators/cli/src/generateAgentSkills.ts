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

import { mkdir, readFile, symlink, writeFile } from "fs/promises";
import path from "path";

import type { DetectedAuthBinding } from "./detectAuth.js";
import type { SubClientField } from "./generateSdkGlue.js";
import { readSpecsManifest } from "./copySpecs.js";

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
            continue;
        }
        const doc = JSON.parse(raw) as MinimalOpenApiDoc;
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
    const { binaryName, sdkCrateSnake, subClients, authBindings, example } = args;
    const lines: string[] = [];

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
    lines.push(`The \`${binaryName}\` CLI supports user-authored custom commands that are`);
    lines.push("compiled into the binary alongside the auto-generated API commands.");
    lines.push("Custom commands get a fully-wired SDK client that inherits the CLI's");
    lines.push("auth, retries, TLS, base URL, and global headers — zero configuration required.");
    lines.push("");

    // Architecture
    lines.push("## Architecture");
    lines.push("");
    lines.push("```");
    lines.push(`cli/${binaryName}/custom.rs    ← Your command handlers (protected by .fernignore)`);
    lines.push(`cli/${binaryName}/sdk_glue.rs  ← Generated bridge: sdk_client() + block_on()`);
    lines.push(`cli/${binaryName}/main.rs      ← Generated entrypoint (calls custom::register)`);
    lines.push(`${binaryName}-sdk/             ← Co-generated typed SDK crate`);
    lines.push(`${binaryName}-types/           ← Co-generated typed model crate`);
    lines.push("```");
    lines.push("");

    // Step-by-step guide
    lines.push("## Adding a Custom Command");
    lines.push("");
    lines.push(`### 1. Edit \`cli/${binaryName}/custom.rs\``);
    lines.push("");
    lines.push("This file is protected by `.fernignore` — `fern generate` will never");
    lines.push("overwrite it. Register commands in the `register()` function:");
    lines.push("");

    // Render example with real endpoint data
    if (example != null) {
        renderExampleWithEndpoint(lines, binaryName, sdkCrateSnake, example);
    } else {
        renderGenericExample(lines, binaryName, sdkCrateSnake, subClients);
    }

    // Available sub-clients
    lines.push("### 2. Available SDK Clients");
    lines.push("");
    lines.push(`The \`sdk_glue::sdk_client(ctx)\` call returns a \`${sdkCrateSnake}::api::Client\``);
    lines.push("with the following sub-clients:");
    lines.push("");
    if (subClients.length > 0) {
        lines.push("| Field | Type | Description |");
        lines.push("|-------|------|-------------|");
        for (const sc of subClients) {
            lines.push(
                `| \`client.${sc.fieldName}\` | \`${sdkCrateSnake}::api::${sc.typeName}\` | ${sc.fieldName} operations |`
            );
        }
    } else {
        lines.push("(Sub-clients are derived from the API spec at generation time.)");
    }
    lines.push("");

    // Key patterns
    lines.push("### 3. Key Patterns");
    lines.push("");
    lines.push("**Get the SDK client** (execution-sharing, fully authenticated):");
    lines.push("```rust");
    lines.push("let client = super::sdk_glue::sdk_client(ctx);");
    lines.push("```");
    lines.push("");
    lines.push("**Run an async SDK call from a sync handler:**");
    lines.push("```rust");
    lines.push("let result = super::sdk_glue::block_on(");
    lines.push("    client.some_resource.some_method(args),");
    lines.push(")?;");
    lines.push("```");
    lines.push("");
    lines.push("**Use typed models for request/response serialization:**");
    lines.push("```rust");
    lines.push(`use ${sdkCrateSnake}::api::*;`);
    lines.push("```");
    lines.push("");

    // Auth
    if (authBindings.length > 0) {
        lines.push("### 4. Authentication");
        lines.push("");
        lines.push("Custom commands automatically inherit the CLI's authentication.");
        lines.push("The following auth schemes are configured:");
        lines.push("");
        for (const binding of authBindings) {
            const envList = binding.envVars.join("`, `");
            lines.push(`- **${binding.schemeName}** (${binding.kind}): env \`${envList}\``);
        }
        lines.push("");
        lines.push("No manual auth wiring is needed in custom command handlers.");
        lines.push("");
    }

    // .fernignore
    lines.push("## Regeneration Safety");
    lines.push("");
    lines.push("| File | Regenerated? | Notes |");
    lines.push("|------|-------------|-------|");
    lines.push(`| \`cli/${binaryName}/custom.rs\` | **No** | Protected by \`.fernignore\` |`);
    lines.push(`| \`cli/${binaryName}/sdk_glue.rs\` | Yes | Bridges AppContext → SDK client |`);
    lines.push(`| \`cli/${binaryName}/main.rs\` | Yes | Calls \`custom::register(app)\` |`);
    lines.push(`| \`${binaryName}-sdk/\` | Yes | Co-generated typed SDK crate |`);
    lines.push(`| \`${binaryName}-types/\` | Yes | Co-generated typed models |`);
    lines.push("");
    lines.push("After running `fern generate`, your `custom.rs` is preserved. All");
    lines.push("generated code (SDK, types, glue, main.rs) is updated to match the");
    lines.push("latest API spec. If the SDK surface changes (renamed methods, new");
    lines.push("sub-clients), update your `custom.rs` to match.");
    lines.push("");

    // Build & test
    lines.push("## Build & Test");
    lines.push("");
    lines.push("```bash");
    lines.push("# Build the CLI (includes custom commands)");
    lines.push("cargo build");
    lines.push("");
    lines.push("# Run your custom command");
    lines.push(`${binaryName} <your-command> [args]`);
    lines.push("");
    lines.push("# Run with verbose output for debugging");
    lines.push(`RUST_LOG=debug ${binaryName} <your-command> [args]`);
    lines.push("```");
    lines.push("");

    return lines.join("\n");
}

function renderExampleWithEndpoint(
    lines: string[],
    binaryName: string,
    sdkCrateSnake: string,
    example: ExampleEndpoint
): void {
    const cmdName = example.method;
    const about = example.summary ?? `Run ${example.group} ${example.method}`;
    const argDefs = example.pathParams.map((p) => `        .arg(clap::Arg::new("${p}").required(true))`);
    const argReads = example.pathParams.map(
        (p) => `        let ${toSnake(p)} = matches.get_one::<String>("${p}").unwrap();`
    );
    const sdkCallArgs = example.pathParams.map((p) => `${toSnake(p)}`).join(", ");

    lines.push("```rust");
    lines.push(`use ${sdkCrateSnake}::api::*;`);
    lines.push("");
    lines.push("pub fn register(app: CliApp) -> CliApp {");
    lines.push("    let app = app.command(");
    lines.push(`        clap::Command::new("${cmdName}")`);
    lines.push(`            .about("${escapeRust(about)}")`);
    for (const argDef of argDefs) {
        lines.push(argDef);
    }
    lines.push("        ,");
    lines.push("        |matches, ctx| {");
    for (const read of argReads) {
        lines.push(read);
    }
    lines.push("            let client = super::sdk_glue::sdk_client(ctx);");
    lines.push("            let result = super::sdk_glue::block_on(");
    lines.push(`                client.${example.subClientField}.${example.sdkMethod}(${sdkCallArgs}),`);
    lines.push("            )?;");
    lines.push('            println!("{}", serde_json::to_string_pretty(&result).unwrap());');
    lines.push("            Ok(())");
    lines.push("        },");
    lines.push("    );");
    lines.push("    app");
    lines.push("}");
    lines.push("```");
    lines.push("");
    lines.push("Then build and test:");
    lines.push("```bash");
    lines.push("cargo build");
    const exampleArgs = example.pathParams.map((p) => `<${p}>`).join(" ");
    lines.push(`${binaryName} ${cmdName}${exampleArgs.length > 0 ? " " + exampleArgs : ""}`);
    lines.push("```");
    lines.push("");
}

function renderGenericExample(
    lines: string[],
    _binaryName: string,
    sdkCrateSnake: string,
    subClients: SubClientField[]
): void {
    const clientField = subClients.length > 0 ? (subClients[0]?.fieldName ?? "resource") : "resource";

    lines.push("```rust");
    lines.push(`use ${sdkCrateSnake}::api::*;`);
    lines.push("");
    lines.push("pub fn register(app: CliApp) -> CliApp {");
    lines.push("    let app = app.command(");
    lines.push('        clap::Command::new("my-command")');
    lines.push('            .about("Description of your command")');
    lines.push('            .arg(clap::Arg::new("id").required(true)),');
    lines.push("        |matches, ctx| {");
    lines.push('            let id = matches.get_one::<String>("id").unwrap();');
    lines.push("            let client = super::sdk_glue::sdk_client(ctx);");
    lines.push("            let result = super::sdk_glue::block_on(");
    lines.push(`                client.${clientField}.get(id),`);
    lines.push("            )?;");
    lines.push('            println!("{}", serde_json::to_string_pretty(&result).unwrap());');
    lines.push("            Ok(())");
    lines.push("        },");
    lines.push("    );");
    lines.push("    app");
    lines.push("}");
    lines.push("```");
    lines.push("");
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
    return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

// ---------------------------------------------------------------------------
// .claude symlink
// ---------------------------------------------------------------------------

async function createClaudeSymlink(outputDir: string): Promise<void> {
    const target = ".agents";
    const linkPath = path.join(outputDir, ".claude");

    try {
        await symlink(target, linkPath, "dir");
    } catch {
        // Symlink not supported (e.g. Windows without developer mode).
        // Write a note file instead.
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
