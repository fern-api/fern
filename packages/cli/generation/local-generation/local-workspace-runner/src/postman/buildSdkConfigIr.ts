import type { generatorsYml } from "@fern-api/configuration";
import type { SdkConfigIrV1, SdkConfigIrV1Input } from "@postman/sdk-config";
import { parseSdkConfigIrV1, SDK_CONFIG_IR_V1_SCHEMA_VERSION } from "@postman/sdk-config";

import type { RawSpecsManifest, RawSpecsManifestEntry } from "../rawSpecs.js";

type TargetLanguage = SdkConfigIrV1["target"]["language"];
type SourceSpec = SdkConfigIrV1["source"]["specs"][number];
type UnsupportedField = NonNullable<NonNullable<SdkConfigIrV1["compatibility"]>["unsupportedFields"]>[number];

/**
 * Generator config keys this translator consumes. Anything else a customer sets under `config:` is
 * reported in `compatibility.unsupportedFields` rather than dropped, so a partially supported
 * configuration stays visible to the consumer instead of silently changing the generated SDK.
 */
const TRANSLATED_CONFIG_KEYS = new Set(["language", "sdkName", "sdkVersion", "baseUrl", "apiVersion"]);

const DEFAULT_SDK_VERSION = "0.0.1";

/** Fern spec types that map onto an IR source spec. Protobuf is carried separately as a source mount. */
const SPEC_TYPE_BY_FERN_TYPE: Partial<Record<RawSpecsManifestEntry["type"], SourceSpec["specType"]>> = {
    openapi: "openapi",
    asyncapi: "asyncapi",
    graphql: "graphql"
};

function asRecord(value: unknown): Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
}

function optionalString(source: Record<string, unknown>, key: string): string | undefined {
    const value = source[key];
    return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function resolveLanguage(
    generatorInvocation: generatorsYml.GeneratorInvocation,
    config: Record<string, unknown>
): TargetLanguage | undefined {
    // One Postman adapter image serves every language, so the target cannot be inferred from the
    // generator name the way a per-language Fern generator allows. `config.language` is authoritative;
    // the invocation's own language is a fallback for a generators.yml that declares it there.
    const requested = optionalString(config, "language") ?? generatorInvocation.language;
    if (requested == null) {
        return undefined;
    }
    const normalized = requested.trim().toLowerCase();
    return normalized as TargetLanguage;
}

function collectSourceSpecs(manifest: RawSpecsManifest | undefined): SourceSpec[] {
    if (manifest == null) {
        return [];
    }
    return manifest.specs.flatMap((entry): SourceSpec[] => {
        const specType = SPEC_TYPE_BY_FERN_TYPE[entry.type];
        if (specType == null) {
            return [];
        }
        return [
            {
                specUrl: entry.specPath,
                specType,
                ...(entry.namespace != null ? { namespace: entry.namespace } : {})
            }
        ];
    });
}

function collectUnsupportedConfigFields(config: Record<string, unknown>): UnsupportedField[] {
    return Object.keys(config)
        .filter((key) => !TRANSLATED_CONFIG_KEYS.has(key))
        .map((key) => ({
            source: "fern" as const,
            path: ["generation", "language", key],
            code: "FERN_GENERATOR_CONFIG_NOT_TRANSLATED",
            reason: `config.${key} is not translated by the Postman adapter`,
            severity: "warning" as const,
            risk: "medium" as const,
            owner: "fern-cli",
            suggestedAction: `Confirm whether ${key} needs an SDK Config IR mapping before relying on it`
        }));
}

export declare namespace buildSdkConfigIr {
    interface Args {
        generatorInvocation: generatorsYml.GeneratorInvocation;
        organization: string;
        workspaceName: string;
        /** Resolved output version, already language-mapped by the caller. */
        version: string | undefined;
        /** Directory the adapter writes the SDK into, in the coordinates the adapter will see. */
        outputPath: string;
        /** Manifest of pre-processed raw specs, in the coordinates the adapter will see. */
        rawSpecsManifest: RawSpecsManifest | undefined;
    }

    type Result = { success: true; sdkConfigIr: SdkConfigIrV1 } | { success: false; message: string };
}

/**
 * Translates a selected Fern generator invocation into SDK Config IR v1.
 *
 * The IR is the contract the Postman adapter consumes, and it exists to replace exactly two
 * configuration surfaces: sdk-gen-core `BuildParameters` and a selected Fern generator invocation.
 * Producing it here means Fern's configuration is normalized once, on the producer side, rather than
 * each consumer re-deriving it.
 *
 * This is the subset required for local (`fern generate --local`) SDK generation. Publishing, GitHub
 * delivery, docs and per-language behaviour are deliberately not translated yet; anything a customer
 * configured that is not carried across is reported in `compatibility.unsupportedFields`.
 */
export function buildSdkConfigIr({
    generatorInvocation,
    organization,
    workspaceName,
    version,
    outputPath,
    rawSpecsManifest
}: buildSdkConfigIr.Args): buildSdkConfigIr.Result {
    const config = asRecord(generatorInvocation.config);

    const language = resolveLanguage(generatorInvocation, config);
    if (language == null) {
        return {
            success: false,
            message:
                `Generator "${generatorInvocation.name}" does not declare a target language. ` +
                "Set `config.language` in generators.yml, since one Postman adapter image serves every language."
        };
    }

    const specs = collectSourceSpecs(rawSpecsManifest);
    if (specs.length === 0) {
        return {
            success: false,
            message:
                `Generator "${generatorInvocation.name}" received no API specs. The Postman adapter ` +
                "generates from the API spec rather than the Fern IR, so it must be registered in " +
                "GENERATORS_WANTING_SPECS and the workspace must be an OpenAPI (OSS) workspace."
        };
    }

    const unsupportedFields = collectUnsupportedConfigFields(config);
    const baseUrl = optionalString(config, "baseUrl");
    const apiVersion = optionalString(config, "apiVersion");

    const candidate: SdkConfigIrV1Input = {
        schemaVersion: SDK_CONFIG_IR_V1_SCHEMA_VERSION,
        source: { specs },
        target: {
            language,
            sourceOrigin: "fern",
            sdkName: optionalString(config, "sdkName") ?? workspaceName,
            sdkVersion: optionalString(config, "sdkVersion") ?? version ?? DEFAULT_SDK_VERSION,
            organization,
            ...(apiVersion != null ? { apiVersion } : {})
        },
        output: { delivery: "files", path: outputPath },
        api: baseUrl != null ? { baseUrl } : {},
        client: {},
        package: {},
        docs: {},
        generation: {},
        compatibility: {
            // A Fern-origin request keeps Fern's output defaults so a migrating customer's generated
            // SDK does not change shape underneath them.
            outputProfile: "fern-legacy",
            legacyInput: {
                kind: "fern-generator-invocation",
                value: {
                    name: generatorInvocation.name,
                    version: generatorInvocation.version,
                    config: config as never
                }
            },
            ...(unsupportedFields.length > 0 ? { unsupportedFields } : {})
        }
    };

    // Validated here rather than left to the consumer: the schema applies its own defaults, so this
    // both fails fast on the producer side and yields the filled document the adapter expects.
    try {
        return { success: true, sdkConfigIr: parseSdkConfigIrV1(candidate) };
    } catch (error) {
        return {
            success: false,
            message:
                `Could not build SDK Config IR for "${generatorInvocation.name}": ` +
                (error instanceof Error ? error.message : String(error))
        };
    }
}
