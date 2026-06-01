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
    embedSdk?: boolean;
}): Promise<void> {
    const { outputDir, binaryName, authBindings, specsDir, embedSdk } = args;
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
        renderMainRs({ binaryName, entries, authBindings, embedSdk: embedSdk ?? false })
    );

    // Scaffold custom.rs for user-authored async command handlers.
    if (embedSdk === true) {
        await scaffoldCustomRs(binDir);
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
async function scaffoldCustomRs(binDir: string): Promise<void> {
    const customRsPath = path.join(binDir, "custom.rs");
    // Only create if it doesn't already exist (respects .fernignore).
    try {
        await readFile(customRsPath);
        return; // already exists — user owns it
    } catch {
        // does not exist — scaffold it
    }
    const content = [
        "//! Custom command handlers.",
        "//!",
        "//! This file is yours to edit — it is listed in `.fernignore` so",
        "//! `fern generate` will never overwrite your changes.",
        "//!",
        "//! Each handler is an `async fn` that receives an `AppContext` with a",
        "//! pre-wired, strongly-typed SDK client accessible via `ctx.client()`.",
        "//! Return values flow through the CLI's output pipeline via `ctx.emit()`.",
        "",
        "use fern_cli_sdk::app::CliApp;",
        "",
        "/// Register custom commands on the CLI app builder.",
        "///",
        "/// Called from `main.rs` during startup. Add `.custom_command(...)` calls",
        "/// here to extend the generated CLI with your own subcommands.",
        "pub fn register(app: CliApp) -> CliApp {",
        "    // Example:",
        '    //   app.custom_command("my-cmd", "Description", |ctx| {',
        "    //       Box::pin(async move {",
        "    //           let client = ctx.client::<my_api_sdk::Client>();",
        "    //           let resp = client.some_endpoint().await?;",
        "    //           ctx.emit(&resp)?;",
        "    //           Ok(())",
        "    //       })",
        "    //   })",
        "    app",
        "}",
        ""
    ].join("\n");
    await writeFile(customRsPath, content);
}

function renderMainRs(args: {
    binaryName: string;
    entries: SpecEntry[];
    authBindings: DetectedAuthBinding[];
    embedSdk: boolean;
}): string {
    const { binaryName, entries, authBindings, embedSdk } = args;

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

    if (embedSdk) {
        lines.push("mod custom;");
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

    if (embedSdk) {
        lines.push("");
        lines.push("    let app = custom::register(app);");
    }

    lines.push("");
    lines.push("    app.run()");
    lines.push("}");
    lines.push("");
    return lines.join("\n");
}
