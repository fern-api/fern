import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { copySdk, SDK_TEMPLATE_DIRECTORY } from "./copySdk.js";
import { copySpecs, hasOpenApiSpecs } from "./copySpecs.js";
import type { FernCliCustomConfig } from "./customConfig.js";
import { detectAuthBindings } from "./detectAuth.js";
import { emitPublishWorkflow } from "./emitPublishWorkflow.js";
import { generateEmbeddedTypes } from "./generateEmbeddedTypes.js";
import { deriveBinaryName } from "./identity.js";
import type { IrSummary } from "./ir.js";
import { patchCargoToml } from "./patchCargoToml.js";
import { patchDistWorkspaceToml } from "./patchDistWorkspace.js";
import type { ResolvedOutputConfig } from "./resolveOutputConfig.js";
import { writeGitignore } from "./writeGitignore.js";

export type PipelineOutcome =
    | { status: "skipped"; reason: "no-openapi-specs" }
    | { status: "generated"; binaryName: string };

/**
 * The full codegen pipeline, pulled out of `cli.ts` so its ordering
 * invariants can be locked in by a unit test without standing up
 * Docker + the GeneratorNotificationService.
 *
 * The IR (`ir`) is the source of truth for everything except spec
 * bytes: binary identity (`apiDisplayName`), auth schemes + their
 * env-var names, etc. The raw OpenAPI specs are only read for the
 * `include_str!` macro that bakes them into the generated `main.rs`.
 *
 * `sdkTemplateDir` and `specsDir` default to the in-container paths
 * (`/dist/sdk`, `/fern/specs`) so the production caller — `cli.ts` —
 * passes only `ir`. Tests pass tmp paths for all three.
 */
export async function runPipeline(args: {
    outputDir: string;
    customConfig: FernCliCustomConfig;
    ir: IrSummary;
    /** Path to the IR JSON file for embedded types codegen. Omit to skip types generation. */
    irFilepath?: string;
    outputConfig: ResolvedOutputConfig;
    sdkTemplateDir?: string;
    specsDir?: string;
}): Promise<PipelineOutcome> {
    const { outputDir, customConfig, ir, irFilepath, outputConfig, sdkTemplateDir, specsDir } = args;

    if (!(await hasOpenApiSpecs(specsDir))) {
        return { status: "skipped", reason: "no-openapi-specs" };
    }

    // IR is authoritative for binary identity and auth bindings.
    // Resolve both before touching the output dir so we fail fast
    // (e.g. missing apiDisplayName + no customConfig override)
    // rather than half-producing output.
    const binaryName = deriveBinaryName({ customConfig, ir });
    const authBindings = detectAuthBindings({ auth: ir.auth, binaryName });

    await mkdir(outputDir, { recursive: true });

    // ORDER MATTERS — captured by `runPipeline.test.ts`:
    //   1. copySdk lays down the SDK template (Cargo.toml still has the
    //      stock `openapi-fixture` [[bin]] entries).
    //   2. patchCargoToml + patchDistWorkspaceToml rewrite shipped
    //      config files so the [[bin]] entry, cargo-dist metadata, and
    //      identifying bits don't leak Fern's template-author branding.
    //   3. copySpecs writes the spec files + main.rs into
    //      `cli/<binaryName>/`, wiring the IR-derived auth bindings.
    //   4. generateEmbeddedTypes generates the typed Rust model crate
    //      as a workspace member (path dependency from the CLI crate).
    //   5. emitPublishWorkflow writes `.github/workflows/ci.yml` when
    //      output mode is `github` with npm publish info.
    await copySdk(outputDir, sdkTemplateDir ?? SDK_TEMPLATE_DIRECTORY);
    await patchCargoToml({ outputDir, binaryName, version: outputConfig.version });
    await patchDistWorkspaceToml({ outputDir });
    const embedTypes = irFilepath != null;
    await copySpecs({ outputDir, binaryName, authBindings, specsDir, embedTypes });
    await writeGitignore(outputDir);

    // Generate the embedded types crate when the IR filepath is available.
    if (irFilepath != null) {
        const typesCrateName = await generateEmbeddedTypes({
            irFilepath,
            outputDir,
            binaryName
        });
        await patchCargoToml({ outputDir, binaryName, typesCrateName });
        await patchDistWorkspaceToml({ outputDir, typesCrateName });
        await writeFernignore(outputDir, binaryName);
    }

    if (outputConfig.npmPublishInfo != null) {
        await emitPublishWorkflow({
            outputDir,
            binaryName,
            npmPublishInfo: outputConfig.npmPublishInfo
        });
    }

    return { status: "generated", binaryName };
}

/**
 * Write a `.fernignore` listing files the user owns. `fern generate`
 * should not overwrite these on subsequent runs.
 */
async function writeFernignore(outputDir: string, binaryName: string): Promise<void> {
    const content = [
        "# Files owned by the user — fern generate will not overwrite these.",
        `cli/${binaryName}/custom.rs`,
        ""
    ].join("\n");
    await writeFile(path.join(outputDir, ".fernignore"), content);
}
