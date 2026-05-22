import { mkdir } from "fs/promises";
import { copySdk, SDK_TEMPLATE_DIRECTORY } from "./copySdk.js";
import { copySpecs, hasOpenApiSpecs } from "./copySpecs.js";
import type { FernCliCustomConfig } from "./customConfig.js";
import { detectAuthBindings } from "./detectAuth.js";
import { deriveBinaryName } from "./identity.js";
import type { IrSummary } from "./ir.js";
import { patchCargoToml } from "./patchCargoToml.js";
import { patchDistWorkspaceToml } from "./patchDistWorkspace.js";

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
    sdkTemplateDir?: string;
    specsDir?: string;
}): Promise<PipelineOutcome> {
    const { outputDir, customConfig, ir, sdkTemplateDir, specsDir } = args;

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
    await copySdk(outputDir, sdkTemplateDir ?? SDK_TEMPLATE_DIRECTORY);
    await patchCargoToml({ outputDir, binaryName });
    await patchDistWorkspaceToml({ outputDir });
    await copySpecs({ outputDir, binaryName, authBindings, specsDir });

    return { status: "generated", binaryName };
}
