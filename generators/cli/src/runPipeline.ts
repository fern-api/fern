import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { copySdk, SDK_TEMPLATE_DIRECTORY } from "./copySdk.js";
import { copySpecs, hasOpenApiSpecs } from "./copySpecs.js";
import type { FernCliCustomConfig } from "./customConfig.js";
import { detectAuthBindings } from "./detectAuth.js";
import { emitCiWorkflow, emitPublishWorkflow } from "./emitPublishWorkflow.js";
import { emitReadme } from "./emitReadme.js";
import { emitReference } from "./emitReference.js";
import { generateAgentSkills } from "./generateAgentSkills.js";
import { generateEmbeddedSdk } from "./generateEmbeddedSdk.js";
import { generateEmbeddedTypes } from "./generateEmbeddedTypes.js";
import { generateSdkGlue } from "./generateSdkGlue.js";
import type { SubClientField } from "./generateSdkGlue.js";
import { deriveBinaryName } from "./identity.js";
import type { IrSummary } from "./ir.js";
import { patchCargoLockForSdk, patchCargoLockForTypes, patchCargoToml } from "./patchCargoToml.js";
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
    /** Path to the IR JSON file for embedded types codegen. */
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
    //   5. generateEmbeddedSdk generates the Rust SDK crate in
    //      cliEmbedded mode as a workspace member, with a path dep
    //      on the types crate for single type identity.
    //   6. emitCiWorkflow / emitPublishWorkflow writes
    //      `.github/workflows/ci.yml` when output mode is `github`.
    //      Build+test jobs are always emitted; publish jobs only when
    //      npm publish info is present.
    await copySdk(outputDir, sdkTemplateDir ?? SDK_TEMPLATE_DIRECTORY);
    await patchCargoToml({ outputDir, binaryName, version: outputConfig.version });
    await patchDistWorkspaceToml({ outputDir });
    const embedTypes = customConfig.embedTypes !== false && irFilepath != null;
    const embedSdk = customConfig.embedSdk !== false && embedTypes;
    await copySpecs({ outputDir, binaryName, authBindings, specsDir, embedTypes, embedSdk });
    await writeGitignore(outputDir);
    await emitReadme({
        outputDir,
        binaryName,
        apiDisplayName: ir.apiDisplayName,
        authBindings,
        npmPublishInfo: outputConfig.npmPublishInfo
    });
    await emitReference({
        outputDir,
        binaryName,
        apiDisplayName: ir.apiDisplayName,
        authBindings,
        specsDir
    });

    // Generate the embedded types crate (on by default; opt-out via embedTypes: false).
    let typesCrateName: string | undefined;
    if (embedTypes && irFilepath != null) {
        typesCrateName = await generateEmbeddedTypes({
            irFilepath,
            outputDir,
            binaryName
        });
        await writeFernignore(outputDir, binaryName);
    }

    // Generate the embedded SDK crate (on by default; requires embedTypes).
    let sdkCrateName: string | undefined;
    if (customConfig.embedSdk !== false && embedTypes && irFilepath != null && typesCrateName != null) {
        sdkCrateName = await generateEmbeddedSdk({
            irFilepath,
            outputDir,
            binaryName,
            typesCrateName
        });
    }

    // Generate the SDK glue module (sdk_client + block_on) that bridges
    // the CLI's AppContext to the co-generated SDK client.
    let subClients: SubClientField[] = [];
    if (sdkCrateName != null) {
        subClients = await generateSdkGlue({ outputDir, binaryName, sdkCrateName });
    }

    // Generate agent skills (.agents/skills/ + .claude symlink) so coding
    // agents can author custom commands following the prescribed patterns.
    if (sdkCrateName != null) {
        await generateAgentSkills({
            outputDir,
            binaryName,
            sdkCrateName,
            subClients,
            authBindings,
            specsDir
        });
    }

    // Wire up path dependencies and workspace members for generated crates.
    if (typesCrateName != null || sdkCrateName != null) {
        await patchCargoToml({ outputDir, binaryName, typesCrateName, sdkCrateName });
        if (typesCrateName != null) {
            // When the SDK crate exists, the CLI binary depends on the
            // SDK (which re-exports types) — so skip adding types as a
            // direct dep of fern-cli-sdk in the lockfile.
            await patchCargoLockForTypes({ outputDir, typesCrateName, skipCliDep: sdkCrateName != null });
        }
        if (sdkCrateName != null && typesCrateName != null) {
            await patchCargoLockForSdk({ outputDir, sdkCrateName, typesCrateName });
        }
        await patchDistWorkspaceToml({ outputDir, typesCrateName, sdkCrateName });
    }

    if (outputConfig.isGithubOutput) {
        if (outputConfig.npmPublishInfo != null) {
            await emitPublishWorkflow({
                outputDir,
                binaryName,
                npmPublishInfo: outputConfig.npmPublishInfo
            });
        } else {
            await emitCiWorkflow({ outputDir, binaryName });
        }
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
