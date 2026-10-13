import { parseSdkConfigIrV1, type SdkConfigIrV1 } from "@postman/sdk-config";
import { type SdkConfigV1, splitSdkConfigV1TargetGeneration } from "@postman/sdk-config/sdk-config/v1";

import type { CliTargetDiagnostic } from "./types.js";

const LANGUAGE = "cli";

export interface ExpansionContext {
    /** Fern API name: the workspace name, or the SDK name for a single-API project. */
    apiName: string;
    /** Organization from fern.config.json. */
    organizationName: string;
}

/**
 * Expands the `cli` target of a loaded SDK Config into one SDK Config IR, with sdk-gen-api's
 * precedence rules (`expandSdkConfigTarget` in sdk-gen-api `src/build/fern-sdk-config-expander.ts`):
 * package merges field by field, a target output replaces the root output, client and docs merge
 * recursively (arrays replace), and the target's generation splits into shared and language parts.
 *
 * One deliberate difference: sdk-gen-api forces zip output because it owns delivery; the translation keeps
 * the configured output, which becomes the generator's output block.
 */
export function expandCliTarget(
    config: SdkConfigV1,
    context: ExpansionContext
): { ir: SdkConfigIrV1 | undefined; diagnostics: CliTargetDiagnostic[] } {
    const matches = config.targets.filter((target) => target.language === LANGUAGE);
    const [target, ...others] = matches;
    if (target == null) {
        return failure("CLI_TARGET_NO_CLI_TARGET", "sdk-config.yml has no 'cli' target.", "Add a cli target.");
    }
    if (others.length > 0) {
        return failure(
            "CLI_TARGET_SEVERAL_CLI_TARGETS",
            `sdk-config.yml has ${matches.length} 'cli' targets; only one can be generated.`,
            "Keep one cli target."
        );
    }

    const split = splitSdkConfigV1TargetGeneration(target.generation);
    const generation = {
        ...mergeObjects(config.generation, split.common),
        ...(Object.keys(split.language).length > 0 ? { language: { [LANGUAGE]: split.language } } : {})
    };
    const sdkVersion = target.sdkVersion ?? config.sdkVersion;
    const candidate = {
        schemaVersion: "sdk-config-ir/v1",
        source: {
            // Local paths stay paths: the translation reads the files from disk.
            specs: config.source.specs.map((spec) => ({
                specType: spec.type,
                specUrl: specLocation(spec),
                ...(spec.id != null ? { id: spec.id } : {}),
                ...(spec.name != null ? { name: spec.name } : {}),
                ...(spec.namespace != null ? { namespace: spec.namespace } : {}),
                ...(spec.overrides != null ? { overrides: spec.overrides } : {}),
                ...(spec.overlays != null ? { overlays: spec.overlays } : {}),
                ...(spec.apiImportSettings != null ? { apiImportSettings: spec.apiImportSettings } : {})
            })),
            ...(config.source.apiImportSettings != null ? { apiImportSettings: config.source.apiImportSettings } : {})
        },
        target: {
            language: LANGUAGE,
            ...(target.generatorVersion != null ? { generatorVersion: target.generatorVersion } : {}),
            sourceOrigin: "postman",
            sdkName: target.sdkName ?? config.sdkName,
            sdkVersion: sdkVersion ?? "0.0.0",
            apiName: context.apiName,
            organizationName: context.organizationName,
            ...(config.apiVersion != null ? { apiVersion: config.apiVersion } : {})
        },
        api: config.api,
        client: mergeObjects(config.client, target.client),
        package: { ...config.package, ...target.package },
        output: target.output ?? config.output ?? { delivery: "files" },
        docs: mergeObjects(config.docs, target.docs),
        generation,
        ...(config.replay != null ? { replay: config.replay } : {})
    };
    try {
        return { ir: parseSdkConfigIrV1(candidate), diagnostics: [] };
    } catch (error) {
        return failure(
            "CLI_TARGET_EXPANSION",
            `The cli target could not be expanded to SDK Config IR v1: ${error instanceof Error ? error.message : String(error)}`,
            "Fix the reported fields in sdk-config.yml."
        );
    }
}

type SourceSpec = SdkConfigV1["source"]["specs"][number];

/** A spec's local path, or its URL (which the specs rule rejects). */
function specLocation(spec: SourceSpec): string {
    return isPathSource(spec) ? spec.path : spec.url;
}

function isPathSource(spec: SourceSpec): spec is Extract<SourceSpec, { path: string }> {
    return "path" in spec;
}

function failure(code: string, message: string, action: string): { ir: undefined; diagnostics: CliTargetDiagnostic[] } {
    return { ir: undefined, diagnostics: [{ severity: "error", path: "targets", code, message, action }] };
}

/** Recursive merge where `override` wins; arrays and scalars replace. */
function mergeObjects(base: object, override: object | undefined): Record<string, unknown> {
    const merged: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(override ?? {})) {
        const inherited = merged[key];
        merged[key] = isRecord(inherited) && isRecord(value) ? mergeObjects(inherited, value) : value;
    }
    return merged;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
