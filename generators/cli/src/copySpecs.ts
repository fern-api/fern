import { cp, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { DetectedAuthBinding } from "./detectAuth.js";

export interface RawSpecsManifestEntry {
    type: "openapi" | "asyncapi" | "protobuf" | "openrpc" | "graphql";
    specPath: string;
    overridePaths?: string[];
    /** Namespace the user declared in `generators.yml` for this spec, if any. */
    namespace?: string;
}

export interface RawSpecsManifest {
    specs: RawSpecsManifestEntry[];
}

/** Where the local-workspace-runner mounts raw API specs inside the container. */
export const SPECS_DIRECTORY = "/fern/specs";
export const SPECS_MANIFEST_FILENAME = "specs-manifest.json";

/**
 * Returns the parsed mounted-specs manifest, or `null` when no specs were
 * mounted (e.g. a Fern-definition workspace). Lets the caller decide
 * whether to short-circuit the entire generation step before any files
 * get written.
 */
export async function readSpecsManifest(specsDir?: string): Promise<RawSpecsManifest | null> {
    const dir = specsDir ?? SPECS_DIRECTORY;
    try {
        const content = await readFile(path.join(dir, SPECS_MANIFEST_FILENAME), "utf-8");
        return JSON.parse(content) as RawSpecsManifest;
    } catch {
        return null;
    }
}

/** Returns true iff at least one OpenAPI spec is mounted. */
export async function hasOpenApiSpecs(specsDir?: string): Promise<boolean> {
    const manifest = await readSpecsManifest(specsDir);
    return manifest != null && manifest.specs.some((entry) => entry.type === "openapi");
}

/**
 * Write every mounted OpenAPI spec into the generated CLI's bin folder
 * (`cli/<binaryName>/`) and emit a fresh `main.rs` that embeds each spec
 * via `include_str!` and wires the auth bindings supplied by the caller
 * (which read them from the Fern IR). The folder is named after the
 * binary so the patched `Cargo.toml`'s `[[bin]] path =
 * "cli/<binaryName>/main.rs"` resolves.
 *
 * Behavior for spec namespacing:
 *   - Specs without a `namespace:` in `generators.yml` → emit
 *     `.spec(include_str!(...))` per spec so they merge flat at the root
 *     of the command tree.
 *   - Specs with a `namespace:` in `generators.yml` → emit
 *     `.spec_under("<namespace>", include_str!(...))` per spec so each
 *     surfaces under its own sub-command. Mixed workspaces work too.
 *
 * No-op when no OpenAPI specs are mounted; the orchestrator's gate
 * should have skipped before reaching this point.
 */
export async function copySpecs(args: {
    outputDir: string;
    binaryName: string;
    authBindings: DetectedAuthBinding[];
    specsDir?: string;
    /** When true, emit `mod custom;` + `custom::register(app)` in main.rs. */
    embedTypes?: boolean;
    /** When true, emit `mod sdk_glue;` in main.rs for the SDK bridge. */
    embedSdk?: boolean;
}): Promise<void> {
    const { outputDir, binaryName, authBindings, specsDir, embedTypes, embedSdk } = args;
    const manifest = await readSpecsManifest(specsDir);
    if (manifest == null) {
        return;
    }

    const openapiSpecs = manifest.specs.filter((entry) => entry.type === "openapi");
    if (openapiSpecs.length === 0) {
        return;
    }

    const binDir = path.join(outputDir, "cli", binaryName);
    await mkdir(binDir, { recursive: true });

    const entries: SpecEntry[] = [];
    for (const spec of openapiSpecs) {
        const destFilename = path.basename(spec.specPath);
        await cp(spec.specPath, path.join(binDir, destFilename), { force: true });
        entries.push({ destFilename, namespace: spec.namespace });
    }

    await writeFile(
        path.join(binDir, "main.rs"),
        renderMainRs({
            binaryName,
            entries,
            authBindings,
            embedTypes: embedTypes ?? false,
            embedSdk: embedSdk ?? false
        })
    );

    // Scaffold custom.rs for user-authored command handlers.
    if (embedTypes === true) {
        await scaffoldCustomRs(binDir, binaryName, embedSdk ?? false);
    }
}

interface SpecEntry {
    destFilename: string;
    namespace: string | undefined;
}

/**
 * Scaffold `custom.rs` — the file customers edit to register their
 * own async command handlers. Listed in `.fernignore` so `fern generate`
 * never overwrites user changes.
 */
async function scaffoldCustomRs(binDir: string, binaryName: string, embedSdk: boolean): Promise<void> {
    const customRsPath = path.join(binDir, "custom.rs");
    // Only create if it doesn't already exist (respects .fernignore).
    try {
        await readFile(customRsPath);
        return; // already exists — user owns it
    } catch (_e: unknown) {
        // does not exist — scaffold it below
    }
    const sdkCrate = `${binaryName.replace(/-/g, "_")}_sdk`;
    const content = embedSdk ? renderCustomRsWithSdk(sdkCrate) : renderCustomRsTypesOnly(binaryName);
    await writeFile(customRsPath, content);
}

/** Scaffold when the SDK crate is available (default). */
function renderCustomRsWithSdk(sdkCrate: string): string {
    return [
        "//! Custom command handlers.",
        "//!",
        "//! This file is yours to edit — add it to `.fernignore` so",
        "//! `fern generate` will never overwrite your changes.",
        "//!",
        "//! The generated `main.rs` calls `custom::register(app)` at",
        "//! startup, composing your commands into the CLI at compile time.",
        "//!",
        "//! Each handler receives an `AppContext`. Use `sdk_glue::sdk_client(ctx)`",
        "//! to get a fully-wired SDK client that inherits the CLI's auth,",
        "//! retries, TLS, and global headers. Use `sdk_glue::block_on(future)`",
        "//! to run async SDK calls from synchronous handler context.",
        `//! Types are available via \`${sdkCrate}::api::*\`.`,
        "//!",
        "//! Use `#[derive(clap::Args)]` structs with `command_typed` for",
        "//! compile-time type-safe argument access — a mismatched field",
        "//! name is a compile error instead of a runtime panic.",
        "",
        "use fern_cli_sdk::app::CliApp;",
        "use fern_cli_sdk::openapi::OpenApiBinding;",
        "",
        "/// Register custom commands on the CLI app builder.",
        "///",
        "/// Called from `main.rs` during startup. Uncomment the example",
        "/// below and adapt it to your API to get started.",
        "pub fn register(app: CliApp) -> CliApp {",
        "    // Example: typed custom command with the co-generated SDK.",
        "    //",
        `    // use ${sdkCrate}::api::*;`,
        "    //",
        "    // #[derive(clap::Args)]",
        "    // struct GetPlantArgs {",
        "    //     #[arg(long)]",
        "    //     plant_id: String,",
        "    // }",
        "    //",
        "    // fn handle_get_plant(",
        "    //     args: GetPlantArgs,",
        "    //     ctx: &fern_cli_sdk::openapi::AppContext,",
        "    // ) -> Result<(), fern_cli_sdk::error::CliError> {",
        "    //     let client = super::sdk_glue::sdk_client(ctx);",
        "    //     let plant = super::sdk_glue::block_on(",
        "    //         client.plants.get_plant(&args.plant_id, None),",
        "    //     )?;",
        '    //     println!("{}", serde_json::to_string_pretty(&plant).unwrap());',
        "    //     Ok(())",
        "    // }",
        "    //",
        "    // let app = app.command_typed(",
        '    //     clap::Command::new("get-plant").about("Fetch a plant by its ID"),',
        "    //     OpenApiBinding::typed_handler(handle_get_plant),",
        "    // );",
        "    app",
        "}",
        ""
    ].join("\n");
}

/** Scaffold when only the types crate is available (embedSdk: false). */
function renderCustomRsTypesOnly(binaryName: string): string {
    const typesCrate = `${binaryName.replace(/-/g, "_")}_types`;
    return [
        "//! Custom command handlers.",
        "//!",
        "//! This file is yours to edit — add it to `.fernignore` so",
        "//! `fern generate` will never overwrite your changes.",
        "//!",
        "//! The generated `main.rs` calls `custom::register(app)` at",
        "//! startup, composing your commands into the CLI at compile time.",
        "//!",
        "//! Each handler receives an `AppContext` whose `invoke()` and",
        "//! `execute()` methods use the CLI's native HTTP executor.",
        `//! Combine these with the typed structs from \`${typesCrate}\``,
        "//! for strongly-typed request/response serialization.",
        "",
        "use fern_cli_sdk::app::CliApp;",
        "",
        "/// Register custom commands on the CLI app builder.",
        "///",
        "/// Called from `main.rs` during startup. Uncomment the example",
        "/// below and adapt it to your API to get started.",
        "pub fn register(app: CliApp) -> CliApp {",
        "    // Example: fetch a resource using the native CLI executor",
        "    // with typed response deserialization.",
        "    //",
        `    // use ${typesCrate}::*;`,
        "    //",
        "    // let app = app.command(",
        '    //     clap::Command::new("get-plant")',
        '    //         .about("Fetch a plant by its ID")',
        '    //         .arg(clap::Arg::new("plant-id").required(true)),',
        "    //     |matches, ctx| {",
        '    //         let plant_id = matches.get_one::<String>("plant-id").unwrap();',
        '    //         let method = ctx.find_method("plants", "get")?;',
        "    //         let params = serde_json::json!({",
        '    //             "plantId": plant_id,',
        "    //         });",
        "    //         let result = ctx.invoke(",
        "    //             method,",
        "    //             Some(&params.to_string()),",
        "    //             None,",
        "    //             None,",
        "    //         )?;",
        '    //         println!("{}", serde_json::to_string_pretty(&result).unwrap());',
        "    //         Ok(())",
        "    //     },",
        "    // );",
        "    app",
        "}",
        ""
    ].join("\n");
}

function renderMainRs(args: {
    binaryName: string;
    entries: SpecEntry[];
    authBindings: DetectedAuthBinding[];
    embedTypes: boolean;
    embedSdk: boolean;
}): string {
    const { binaryName, entries, authBindings, embedTypes, embedSdk } = args;

    // Separate root-level auth (typed builders) from binding-level auth
    const rootAuthBindings = authBindings.filter((b) => b.placement === "root");
    const bindingAuthBindings = authBindings.filter((b) => b.placement === "binding");

    // Collect needed imports
    const imports: string[] = ["use fern_cli_sdk::app::CliApp;", "use fern_cli_sdk::openapi::OpenApiBinding;"];
    const authTypeImports = new Set<string>();
    for (const binding of [...rootAuthBindings, ...bindingAuthBindings]) {
        if (binding.authTypeImport != null) {
            for (const imp of binding.authTypeImport.split(",")) {
                authTypeImports.add(imp.trim());
            }
        }
    }
    if (authTypeImports.size > 0) {
        imports.push(`use fern_cli_sdk::auth::{${[...authTypeImports].sort().join(", ")}};`);
    }

    const lines: string[] = [
        "// Auto-generated by @fern-api/cli-generator's copySpecs step.",
        "// Edit the SDK template / generator if you need to change the shape.",
        ""
    ];

    if (embedTypes) {
        lines.push("mod custom;");
        if (embedSdk) {
            lines.push("mod sdk_glue;");
        }
        lines.push("");
    }

    lines.push(...imports, "", "fn main() {", `    let app = CliApp::new("${binaryName}")`);

    // Root-level auth bindings (typed builders)
    for (const binding of rootAuthBindings) {
        lines.push(`        ${binding.rustCall}`);
    }

    // OpenApiBinding with specs and binding-level auth
    lines.push("        .binding(");
    lines.push("            OpenApiBinding::new()");
    for (const entry of entries) {
        const include = `include_str!("${entry.destFilename}")`;
        if (entry.namespace != null && entry.namespace !== "") {
            lines.push(`                .spec_under("${entry.namespace}", ${include})`);
        } else {
            lines.push(`                .spec(${include})`);
        }
    }
    for (const binding of bindingAuthBindings) {
        lines.push(`                ${binding.rustCall}`);
    }
    // Close the binding
    lines.push("        );");

    if (embedTypes) {
        lines.push("");
        lines.push("    let app = custom::register(app);");
    }

    lines.push("");
    lines.push("    app.run()");
    lines.push("}");
    lines.push("");
    return lines.join("\n");
}
