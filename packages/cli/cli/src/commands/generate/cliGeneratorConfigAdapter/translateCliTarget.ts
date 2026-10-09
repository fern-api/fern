import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { TaskContext } from "@fern-api/task-context";
import type { SdkConfigIrV1 } from "@postman/sdk-config";
import type { SdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";

import { expandCliTarget } from "./expandCliTarget.js";
import { mapSdkConfigToGeneratorsYml } from "./mapSdkConfigToGeneratorsYml.js";
import { mergeOverlays } from "./overlays.js";
import { resolveFromConfigDir } from "./rules/output.js";
import { loadSpecFacts } from "./specFacts.js";
import type { CliTargetDiagnostic, OverlayMerge, SpecFacts } from "./types.js";
import { resolveGeneratorVersion } from "./versions.js";

export interface TranslateCliTargetOptions {
    context: TaskContext;
    /** The loaded SDK Config; its cli target is translated. */
    sdkConfig: SdkConfigV1;
    absolutePathToConfig: string;
    /** Folder the generators.yml will live in; paths in it are relative to this folder. */
    outDir: string;
    apiName: string;
    organization: string;
}

export interface CliTargetTranslation {
    /** Undefined when a diagnostic is an error. */
    generatorsYml: Record<string, unknown> | undefined;
    overlayMerges: OverlayMerge[];
    diagnostics: CliTargetDiagnostic[];
    /** Informational lines: the generator defaults that apply, and hints. */
    notes: string[];
    /** The SDK version to generate: sdk-config.yml's sdkVersion, as the other SDK Config targets get. */
    version: string | undefined;
}

const GENERATOR_DEFAULTS =
    "SDK Config cannot hold binaryName, customCommands or profiles, so the CLI generator uses its defaults: the binary is named from the API display name, custom commands are on and profiles are off.";

const NO_AUTH_NOTE =
    "sdk-config.yml has no api.auth, so the CLI uses the security schemes the spec declares. If the file came from `fern sdk migrate`, migrate may have dropped the auth block.";

/**
 * Translates the cli target of an SDK Config into a generators.yml object for
 * fernapi/fern-cli-generator: expand the target, read the specs, classify every field, map.
 */
export async function translateCliTarget(options: TranslateCliTargetOptions): Promise<CliTargetTranslation> {
    const configDir = dirname(options.absolutePathToConfig);
    const empty: CliTargetTranslation = {
        generatorsYml: undefined,
        overlayMerges: [],
        diagnostics: [],
        notes: [],
        version: undefined
    };
    const expanded = expandCliTarget(options.sdkConfig, {
        apiName: options.apiName,
        organizationName: options.organization
    });
    if (expanded.ir == null) {
        return { ...empty, diagnostics: expanded.diagnostics };
    }
    const ir = expanded.ir;

    const version = resolveGeneratorVersion({ pinned: ir.target.generatorVersion });
    const inspected = await inspectSpecs(options.context, ir, configDir);
    const mapped = mapSdkConfigToGeneratorsYml(ir, {
        configDir,
        outDir: options.outDir,
        specFacts: inspected.facts,
        generatorVersion: version.version
    });
    const diagnostics = [
        ...version.diagnostics,
        ...inspected.diagnostics,
        ...mapped.diagnostics,
        ...multiSpecWarning(ir)
    ];
    const failed = diagnostics.some((diagnostic) => diagnostic.severity === "error");
    return {
        generatorsYml: failed ? undefined : mapped.generatorsYml,
        overlayMerges: failed ? [] : mapped.overlayMerges,
        diagnostics,
        notes: [GENERATOR_DEFAULTS, ...(ir.api.auth == null ? [NO_AUTH_NOTE] : []), ...mapped.hints],
        version: ir.target.sdkVersion
    };
}

function multiSpecWarning(ir: SdkConfigIrV1): CliTargetDiagnostic[] {
    if (ir.source.specs.length < 2) {
        return [];
    }
    return [
        {
            severity: "warning",
            path: "source.specs",
            code: "CLI_TARGET_MULTI_SPEC_BINARY_NAME",
            message:
                "With several specs, SDK Config has no binaryName, so the generator names the binary and crates from the API display name."
        }
    ];
}

/** Loads each OpenAPI spec the way `fern generate` does, merging several overlays into a temporary file. */
async function inspectSpecs(
    context: TaskContext,
    ir: SdkConfigIrV1,
    configDir: string
): Promise<{ facts: Array<SpecFacts | undefined>; diagnostics: CliTargetDiagnostic[] }> {
    const temporary = await mkdtemp(join(tmpdir(), "fern-cli-target-specs-"));
    try {
        const results = await Promise.all(
            ir.source.specs.map(async (spec, index) => {
                if (/^https?:\/\//.test(spec.specUrl) || !["openapi", "swagger"].includes(spec.specType)) {
                    // The specs rule reports these.
                    return { facts: undefined, diagnostics: [] };
                }
                const resolve = (path: string) => resolveFromConfigDir(configDir, path);
                const overlays = (spec.overlays ?? []).map(resolve);
                const [firstOverlay] = overlays;
                let overlayPath = firstOverlay;
                if (overlays.length > 1) {
                    overlayPath = join(temporary, `overlay-${index}.yml`);
                    await writeFile(overlayPath, await mergeOverlays(overlays));
                }
                return loadSpecFacts({
                    context,
                    specPath: resolve(spec.specUrl),
                    overridePaths: (spec.overrides ?? []).map(resolve),
                    overlayPath,
                    diagnosticPath: `source.specs[${index}]`
                });
            })
        );
        return {
            facts: results.map((entry) => entry.facts),
            diagnostics: results.flatMap((entry) => entry.diagnostics)
        };
    } finally {
        await rm(temporary, { recursive: true, force: true });
    }
}

export function formatDiagnostic(diagnostic: CliTargetDiagnostic): string {
    return `[${diagnostic.severity}] [${diagnostic.code}] ${diagnostic.path}: ${diagnostic.message}${
        diagnostic.action != null ? `; ${diagnostic.action}` : ""
    }`;
}
