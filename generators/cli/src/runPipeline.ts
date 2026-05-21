import { mkdir } from "fs/promises";
import { copySdk, SDK_TEMPLATE_DIRECTORY } from "./copySdk.js";
import { copySpecs, hasOpenApiSpecs, readSpecsManifest } from "./copySpecs.js";
import type { FernCliCustomConfig } from "./customConfig.js";
import { deriveBinaryName } from "./identity.js";
import { patchCargoToml } from "./patchCargoToml.js";
import { SpecCache } from "./specCache.js";

export type PipelineOutcome =
    | { status: "skipped"; reason: "no-openapi-specs" }
    | { status: "generated"; binaryName: string };

/**
 * The full codegen pipeline, pulled out of `cli.ts` so the ordering
 * invariants (copySdk → patchCargoToml → copySpecs) can be locked in by
 * a unit test without standing up Docker + the GeneratorNotificationService.
 *
 * `sdkTemplateDir` and `specsDir` default to the in-container paths
 * (`/dist/sdk`, `/fern/specs`) so the production caller — `cli.ts` —
 * passes nothing. Tests pass tmp paths.
 */
export async function runPipeline(args: {
    outputDir: string;
    customConfig: FernCliCustomConfig;
    sdkTemplateDir?: string;
    specsDir?: string;
}): Promise<PipelineOutcome> {
    const { outputDir, customConfig, sdkTemplateDir, specsDir } = args;

    if (!(await hasOpenApiSpecs(specsDir))) {
        return { status: "skipped", reason: "no-openapi-specs" };
    }

    // One spec cache for the whole pipeline so deriveBinaryName,
    // copySpecs (which reads back to call detectAuthBindings), and any
    // future spec-reading step share parsed JSON rather than each
    // re-reading + re-parsing every mounted spec file.
    const specCache = new SpecCache();

    // Resolve the binary identity before writing anything to disk so we
    // fail fast with a clear message (e.g. multi-spec without override)
    // rather than half-producing output.
    const manifest = await readSpecsManifest(specsDir);
    const openapiSpecs = manifest?.specs.filter((entry) => entry.type === "openapi") ?? [];
    const binaryName = await deriveBinaryName({ customConfig, openapiSpecs, specCache });

    await mkdir(outputDir, { recursive: true });

    // ORDER MATTERS — captured by `runPipeline.test.ts`:
    //   1. copySdk lays down the SDK template (Cargo.toml still has the
    //      stock `openapi-fixture` [[bin]] entries).
    //   2. patchCargoToml rewrites those entries to `<binaryName>` so
    //      the `[[bin]] path` matches what copySpecs is about to create.
    //   3. copySpecs writes the spec files + main.rs into
    //      `cli/<binaryName>/`.
    await copySdk(outputDir, sdkTemplateDir ?? SDK_TEMPLATE_DIRECTORY);
    await patchCargoToml({ outputDir, binaryName });
    await copySpecs({ outputDir, binaryName, specsDir, specCache });

    return { status: "generated", binaryName };
}
