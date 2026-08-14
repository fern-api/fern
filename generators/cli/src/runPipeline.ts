import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { copySdk, SDK_TEMPLATE_DIRECTORY } from "./copySdk.js";
import { copySpecs, hasOpenApiSpecs } from "./copySpecs.js";
import type { FernCliCustomConfig } from "./customConfig.js";
import { detectAuthBindings } from "./detectAuth.js";
import { detectGlobalParams } from "./detectGlobalParams.js";
import { emitCiWorkflow, emitPublishWorkflow } from "./emitPublishWorkflow.js";
import { emitReadme } from "./emitReadme.js";
import { emitReference } from "./emitReference.js";
import { emitReleaseWorkflow } from "./emitReleaseWorkflow.js";
import { generateAgentSkills } from "./generateAgentSkills.js";
import { generateEmbeddedSdk } from "./generateEmbeddedSdk.js";
import { generateEmbeddedTypes } from "./generateEmbeddedTypes.js";
import type { SubClientField } from "./generateSdk.js";
import { generateSdk } from "./generateSdk.js";
import { deriveBinaryName } from "./identity.js";
import type { IrSummary } from "./ir.js";
import {
    patchCargoLockForSdk,
    patchCargoLockForTypes,
    patchCargoToml,
    withDistributionDefaults
} from "./patchCargoToml.js";
import { patchDistWorkspaceToml } from "./patchDistWorkspace.js";
import type { ResolvedOutputConfig } from "./resolveOutputConfig.js";
import { generateWireTests } from "./wireTests/index.js";
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
    /** Path to the IR JSON file for embedded types/SDK codegen. */
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
    const authBindings = detectAuthBindings({
        auth: ir.auth,
        binaryName,
        services: ir.services,
        environments: ir.environments
    });
    const globalParamBindings = detectGlobalParams({ globalParameters: ir.globalParameters });

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
    // Distribution channels publish *from* a tagged GitHub Release, so
    // they're only wired up for github output mode — the same gate npm
    // publishing already sits behind. Leaving `publish-jobs` on for a
    // local-files generation would describe a pipeline that has no
    // workflow to run it.
    //
    // Resolved before the Cargo.toml patch because enabling Homebrew also
    // decides the crate's `homepage` — cargo-dist copies it into the
    // published formula.
    const distribution = outputConfig.isGithubOutput ? customConfig.distribution : undefined;

    await copySdk(outputDir, sdkTemplateDir ?? SDK_TEMPLATE_DIRECTORY);
    await patchCargoToml({
        outputDir,
        binaryName,
        version: outputConfig.version,
        packageIdentity: withDistributionDefaults({
            packageIdentity: customConfig.packageIdentity,
            publishesHomebrew: distribution?.homebrew != null,
            repoUrl: outputConfig.repoUrl,
            description: defaultCrateDescription(ir.apiDisplayName ?? binaryName)
        })
    });
    await patchDistWorkspaceToml({ outputDir, homebrew: distribution?.homebrew, binaryName });
    const customCommands = customConfig.customCommands !== false && irFilepath != null;
    await copySpecs({
        outputDir,
        binaryName,
        authBindings,
        globalParamBindings,
        specsDir,
        customCommands,
        rootGroup: customConfig.rootGroup,
        userAgentSuffixFlag: customConfig.userAgentSuffixFlag
    });
    await writeGitignore(outputDir);

    // Wire tests (opt-in): emit the mock-driven integration suite after the
    // specs + main.rs are on disk, since the harness resolves command chains
    // by loading the same baked specs copySpecs just wrote. Requires the IR
    // file for endpoint examples.
    if (customConfig.generateWireTests === true && irFilepath != null) {
        await generateWireTests({
            outputDir,
            binaryName,
            irFilepath,
            specsDir,
            rootGroup: customConfig.rootGroup,
            authBindings
        });
    }

    await emitReadme({
        outputDir,
        binaryName,
        apiDisplayName: ir.apiDisplayName,
        authBindings,
        npmPublishInfo: outputConfig.npmPublishInfo,
        repoUrl: outputConfig.repoUrl,
        distribution,
        packageName: customConfig.packageIdentity?.name
    });
    await emitReference({
        outputDir,
        binaryName,
        apiDisplayName: ir.apiDisplayName,
        authBindings,
        specsDir
    });

    // Generate the embedded types + SDK crates (on by default; opt-out via customCommands: false).
    let typesCrateName: string | undefined;
    let sdkCrateName: string | undefined;
    let subClients: SubClientField[] = [];
    if (customCommands && irFilepath != null) {
        typesCrateName = await generateEmbeddedTypes({
            irFilepath,
            outputDir,
            binaryName
        });
        await writeFernignore(outputDir, binaryName);

        if (typesCrateName != null) {
            const sdkResult = await generateEmbeddedSdk({
                irFilepath,
                outputDir,
                binaryName,
                typesCrateName
            });
            sdkCrateName = sdkResult.sdkCrateName;

            // Generate the SDK module (client + block_on) that bridges
            // the CLI's AppContext to the co-generated SDK client.
            // Client names are read directly from the Rust SDK generator
            // context — the authoritative source for de-conflicted names.
            subClients = await generateSdk({
                outputDir,
                binaryName,
                sdkCrateName,
                sdkContext: sdkResult.sdkContext
            });
        }
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
        const packageName = customConfig.packageIdentity?.name;
        if (typesCrateName != null) {
            // When the SDK crate exists, the CLI binary depends on the
            // SDK (which re-exports types) — so skip adding types as a
            // direct dep of fern-cli-sdk in the lockfile.
            await patchCargoLockForTypes({
                outputDir,
                typesCrateName,
                skipCliDep: sdkCrateName != null,
                packageName
            });
        }
        if (sdkCrateName != null && typesCrateName != null) {
            await patchCargoLockForSdk({ outputDir, sdkCrateName, typesCrateName, packageName });
        }
        await patchDistWorkspaceToml({ outputDir, typesCrateName, sdkCrateName });
    }

    if (outputConfig.isGithubOutput) {
        if (outputConfig.npmPublishInfo != null) {
            await emitPublishWorkflow({
                outputDir,
                binaryName,
                npmPublishInfo: outputConfig.npmPublishInfo,
                repoUrl: outputConfig.repoUrl
            });
        } else {
            await emitCiWorkflow({ outputDir, binaryName });
        }
        // Emit cargo-dist release workflow unconditionally for GitHub output.
        // This provides curl|bash installation via GitHub Release assets
        // regardless of whether npm publishing is configured.
        //
        // Both distribution channels live here rather than in ci.yml: they
        // gate on the same `host` job, so neither can publish a version the
        // other missed. cargo-dist has no Scoop support, so that job is one
        // we render — but it belongs beside the Homebrew one all the same.
        await emitReleaseWorkflow({
            outputDir,
            homebrew: distribution?.homebrew,
            scoop:
                distribution?.scoop != null
                    ? {
                          binaryName,
                          scoop: distribution.scoop,
                          repoUrl: outputConfig.repoUrl,
                          license: customConfig.packageIdentity?.license,
                          description:
                              customConfig.packageIdentity?.description ??
                              defaultCrateDescription(ir.apiDisplayName ?? binaryName)
                      }
                    : undefined
        });
    }

    return { status: "generated", binaryName };
}

/**
 * `desc` for the published Homebrew formula when the consumer pinned no
 * `packageIdentity.description`. Mirrors `emitReadme`'s heading rule so a
 * display name that already ends in "API" doesn't yield "… API API".
 */
function defaultCrateDescription(displayName: string): string {
    // Word boundary, not `endsWith`: "ElevenLabs API Documentation" already
    // names itself an API mid-string, and an `endsWith` check appended a
    // second one — visible in `brew info` as "… API Documentation API".
    const suffix = /\bAPI\b/i.test(displayName) ? "" : " API";
    return `CLI for the ${displayName}${suffix}`;
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
