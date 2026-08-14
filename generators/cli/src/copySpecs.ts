import { cp, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { DetectedAuthBinding } from "./detectAuth.js";
import type { DetectedGlobalParam } from "./detectGlobalParams.js";

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

/**
 * Characters that are safe to interpolate into a Rust `"..."` string literal.
 * Rejects double quotes and backslashes that could break out of the literal
 * or inject code into generated `main.rs`.
 */
// biome-ignore lint/suspicious/noControlCharactersInRegex: intentionally rejecting control chars in codegen output
const SAFE_RUST_STRING_LITERAL = /^[^"\\\x00-\x1f]+$/;

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
    globalParamBindings: DetectedGlobalParam[];
    specsDir?: string;
    /** When true, emit `mod custom;` + `mod sdk;` + `custom::register(app)` in main.rs. */
    customCommands?: boolean;
    /** When set, emit `.command_namespace("<rootGroup>")` on the OpenApiBinding chain. */
    rootGroup?: string;
    /**
     * When set, emit `.user_agent_suffix_flag("<name>")` on the CliApp
     * chain so the generated CLI exposes the consumer suffix under this
     * flag/env name instead of the default `user-agent-suffix`.
     */
    userAgentSuffixFlag?: string;
}): Promise<void> {
    const {
        outputDir,
        binaryName,
        authBindings,
        globalParamBindings,
        specsDir,
        customCommands,
        rootGroup,
        userAgentSuffixFlag
    } = args;
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
            globalParamBindings,
            customCommands: customCommands ?? false,
            rootGroup,
            userAgentSuffixFlag
        })
    );

    // Scaffold custom.rs for user-authored command handlers.
    if (customCommands === true) {
        await scaffoldCustomRs(binDir, binaryName);
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
async function scaffoldCustomRs(binDir: string, binaryName: string): Promise<void> {
    const customRsPath = path.join(binDir, "custom.rs");
    // Only create if it doesn't already exist (respects .fernignore).
    try {
        await readFile(customRsPath);
        return; // already exists — user owns it
    } catch (_e: unknown) {
        // does not exist — scaffold it below
    }
    const sdkCrate = `${binaryName.replace(/-/g, "_")}_sdk`;
    await writeFile(customRsPath, renderCustomRsWithSdk(sdkCrate));
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
        "//! Each handler receives an `AppContext`. Use `super::sdk::client(ctx)`",
        "//! to get a fully-wired SDK client that inherits the CLI's auth,",
        "//! retries, TLS, and global headers. Use `super::sdk::block_on(future)`",
        "//! to run async SDK calls from synchronous handler context.",
        `//! Types are available via \`${sdkCrate}::api::*\`.`,
        "",
        "use fern_cli_sdk::app::CliApp;",
        "",
        "/// Register custom commands on the CLI app builder.",
        "///",
        "/// Called from `main.rs` during startup. Uncomment the example",
        "/// below and adapt it to your API to get started.",
        "pub fn register(app: CliApp) -> CliApp {",
        "    // Example: typed SDK client usage with the co-generated SDK.",
        "    //",
        `    // use ${sdkCrate}::api::*;`,
        "    //",
        "    // let app = app.command(",
        '    //     clap::Command::new("get-plant")',
        '    //         .about("Fetch a plant by its ID")',
        '    //         .arg(clap::Arg::new("plant-id").required(true)),',
        "    //     // `command` takes a `CliCommandHandler`, which is a boxed",
        "    //     // `Fn(&ArgMatches, &dyn Any)`. `OpenApiBinding::handler` wraps",
        "    //     // your closure and downcasts the context to `&AppContext`, so a",
        "    //     // bare closure here will not compile.",
        "    //     fern_cli_sdk::openapi::OpenApiBinding::handler(|matches, ctx| {",
        '    //         let plant_id = matches.get_one::<String>("plant-id").unwrap();',
        "    //         let client = super::sdk::client(ctx);",
        "    //         let plant = super::sdk::block_on(",
        "    //             client.plants.get_plant(plant_id, None),",
        "    //         )?;",
        '    //         println!("{}", serde_json::to_string_pretty(&plant).unwrap());',
        "    //         Ok(())",
        "    //     }),",
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
    globalParamBindings: DetectedGlobalParam[];
    customCommands: boolean;
    rootGroup?: string;
    userAgentSuffixFlag?: string;
}): string {
    const { binaryName, entries, authBindings, globalParamBindings, customCommands, rootGroup, userAgentSuffixFlag } =
        args;

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

    // Collect global parameter imports
    const globalParamImports = new Set<string>();
    for (const gp of globalParamBindings) {
        for (const imp of gp.imports) {
            globalParamImports.add(imp);
        }
    }
    if (globalParamImports.size > 0) {
        imports.push(`use fern_cli_sdk::openapi::discovery::{${[...globalParamImports].sort().join(", ")}};`);
    }

    const lines: string[] = [
        "// Auto-generated by @fern-api/cli-generator's copySpecs step.",
        "// Edit the SDK template / generator if you need to change the shape.",
        ""
    ];

    if (customCommands) {
        lines.push("mod custom;");
        lines.push("mod sdk;");
        lines.push("");
    }

    lines.push(...imports, "", "fn main() {", `    let app = CliApp::new("${binaryName}")`);

    // Consumer User-Agent suffix flag/env override (defaults to
    // `user-agent-suffix` in the SDK when this is absent). Emitted before
    // the bindings so the name propagates to every binding's HTTP config.
    if (userAgentSuffixFlag != null && userAgentSuffixFlag !== "") {
        if (!SAFE_RUST_STRING_LITERAL.test(userAgentSuffixFlag)) {
            throw new Error(
                `Unsafe userAgentSuffixFlag "${userAgentSuffixFlag}": contains characters that cannot be ` +
                    "interpolated into a Rust string literal."
            );
        }
        lines.push(`        .user_agent_suffix_flag("${userAgentSuffixFlag}")`);
    }

    // Root-level auth bindings (typed builders)
    for (const binding of rootAuthBindings) {
        lines.push(`        ${binding.rustCall}`);
    }

    // Root-level global parameters (from ir.globalParameters via
    // detectGlobalParams). Registered on the root CliApp — like auth —
    // and propagated to each binding at runtime via
    // `CliApp::propagate_root_global_parameters`.
    for (const gp of globalParamBindings) {
        lines.push(`        ${gp.rustCall}`);
    }

    // OpenApiBinding with specs and binding-level auth
    lines.push("        .binding(");
    lines.push("            OpenApiBinding::new()");
    for (const entry of entries) {
        const include = `include_str!("${entry.destFilename}")`;
        if (entry.namespace != null && entry.namespace !== "") {
            if (!SAFE_RUST_STRING_LITERAL.test(entry.namespace)) {
                throw new Error(
                    `Unsafe namespace "${entry.namespace}": contains characters that cannot be interpolated ` +
                        "into a Rust string literal. Avoid double quotes, backslashes, and control characters."
                );
            }
            lines.push(`                .spec_under("${entry.namespace}", ${include})`);
        } else {
            lines.push(`                .spec(${include})`);
        }
    }
    for (const binding of bindingAuthBindings) {
        lines.push(`                ${binding.rustCall}`);
    }
    if (rootGroup != null) {
        lines.push(`                .command_namespace("${rootGroup}")`);
    }
    // Close the binding
    lines.push("        );");

    if (customCommands) {
        lines.push("");
        lines.push("    let app = custom::register(app);");
    }

    lines.push("");
    lines.push("    app.run()");
    lines.push("}");
    lines.push("");
    return lines.join("\n");
}
