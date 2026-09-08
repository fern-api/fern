import type { SdkConfigIrV1, SdkConfigIrV1Input } from "@postman/sdk-config";
import { parseSdkConfigIrV1, SDK_CONFIG_IR_V1_SCHEMA_VERSION } from "@postman/sdk-config";
import type { SdkConfigV1, SdkConfigV1Target } from "@postman/sdk-config/sdk-config/v1";
import { splitSdkConfigV1TargetGeneration } from "@postman/sdk-config/sdk-config/v1";

import type { RawSpecsManifest } from "../rawSpecs.js";
import { collectOnPremSourceSpecs } from "./onPremSourceSpecs.js";

type TargetLanguage = SdkConfigIrV1["target"]["language"];
type LanguageGeneration = NonNullable<SdkConfigIrV1["generation"]["language"]>;
type UnsupportedField = NonNullable<NonNullable<SdkConfigIrV1["compatibility"]>["unsupportedFields"]>[number];

export declare namespace buildSdkConfigIrFromSdkConfig {
    interface Args {
        /** The customer's `sdk-config.yml`, with its schema defaults already materialized. */
        sdkConfig: SdkConfigV1;
        /** The language this generator invocation produces, derived from the generator name. */
        language: TargetLanguage;
        generatorName: string;
        organization: string;
        /** Directory the adapter writes the SDK into, in the coordinates the adapter will see. */
        outputPath: string;
        /** Manifest of pre-processed raw specs, in the coordinates the adapter will see. */
        rawSpecsManifest: RawSpecsManifest | undefined;
    }

    type Result =
        | { success: true; sdkConfigIr: SdkConfigIrV1; warnings: string[] }
        | { success: false; message: string };
}

/**
 * Translates the customer's `sdk-config.yml` into the SDK Config IR the Postman adapter consumes.
 *
 * The external document describes every target at once; the IR describes exactly one. This selects
 * the target matching the language of the generator being run and flattens the document's two
 * configuration levels onto it -- root values, then that target's overrides.
 *
 * Two fields are imposed rather than carried, because the adapter rejects a document that says
 * otherwise and the local route can only mean one thing:
 *
 * - `target.sourceOrigin` is always `fern`. The adapter refuses any other value, and it is the sole
 *   input to `fernMode`, which selects Fern's generated surface (`PetsClient`) over Postman's
 *   (`PetsService`). Deriving it from the document would let a customer silently change the shape of
 *   their SDK.
 * - `output` is always files delivery at the container's output mount. A `sdk-config.yml` written
 *   for publishing may well say `zip` or `github`; on a local run the artifact is the mounted
 *   directory, and passing the document's own delivery through would fail the container.
 */
export function buildSdkConfigIrFromSdkConfig({
    sdkConfig,
    language,
    generatorName,
    organization,
    outputPath,
    rawSpecsManifest
}: buildSdkConfigIrFromSdkConfig.Args): buildSdkConfigIrFromSdkConfig.Result {
    const target = sdkConfig.targets.find((candidate) => candidate.language === language);
    if (target == null) {
        const configured = sdkConfig.targets.map((candidate) => candidate.language).join(", ");
        return {
            success: false,
            message:
                `sdk-config.yml has no "${language}" target, which is what generator "${generatorName}" ` +
                `generates. Configured targets: ${configured === "" ? "none" : configured}.`
        };
    }

    const specs = collectOnPremSourceSpecs(rawSpecsManifest, { generatorName });
    if (!specs.success) {
        return specs;
    }

    const { warnings, unsupportedFields } = describeImposedOutput({ sdkConfig, target });

    const candidate: SdkConfigIrV1Input = {
        schemaVersion: SDK_CONFIG_IR_V1_SCHEMA_VERSION,
        source: {
            specs: specs.specs,
            ...(sdkConfig.source.apiImportSettings != null
                ? { apiImportSettings: sdkConfig.source.apiImportSettings }
                : {})
        },
        target: {
            language,
            sourceOrigin: "fern",
            sdkName: target.sdkName ?? sdkConfig.sdkName,
            sdkVersion: target.sdkVersion ?? sdkConfig.sdkVersion,
            organization,
            ...(target.generatorVersion != null ? { generatorVersion: target.generatorVersion } : {}),
            ...(sdkConfig.apiVersion != null ? { apiVersion: sdkConfig.apiVersion } : {})
        },
        api: sdkConfig.api,
        client: { ...sdkConfig.client, ...target.client },
        package: { ...sdkConfig.package, ...target.package },
        docs: target.docs ?? sdkConfig.docs,
        generation: mergeGeneration({ sdkConfig, target, language }),
        output: { delivery: "files", path: outputPath },
        compatibility: {
            // `converged` rather than `fern-legacy`: a customer on sdk-config.yml has migrated off
            // Fern's generator configuration, so there is no legacy output shape to preserve. The
            // generators.yml path keeps `fern-legacy` for exactly the opposite reason.
            outputProfile: "converged",
            ...(unsupportedFields.length > 0 ? { unsupportedFields } : {})
        }
    };

    try {
        return { success: true, sdkConfigIr: parseSdkConfigIrV1(candidate), warnings };
    } catch (error) {
        return {
            success: false,
            message:
                `Could not build SDK Config IR from sdk-config.yml for "${generatorName}": ` +
                (error instanceof Error ? error.message : String(error))
        };
    }
}

/**
 * Root generation settings, overridden by the target's own.
 *
 * A target's `generation` block is flat, mixing settings common to every language with ones only
 * that language has. `splitSdkConfigV1TargetGeneration` separates them, which is what lets the
 * language-specific half land under `generation.language.<language>` where the IR expects it.
 */
function mergeGeneration({
    sdkConfig,
    target,
    language
}: {
    sdkConfig: SdkConfigV1;
    target: SdkConfigV1Target;
    language: TargetLanguage;
}): SdkConfigIrV1Input["generation"] {
    const { common, language: languageSpecific } = splitSdkConfigV1TargetGeneration(
        target.generation as Record<string, unknown> | undefined
    );

    return {
        ...sdkConfig.generation,
        ...common,
        ...(Object.keys(languageSpecific).length > 0
            ? { language: { [language]: languageSpecific } as LanguageGeneration }
            : {})
    };
}

/**
 * Reports the delivery the document asked for when the local run cannot honour it.
 *
 * Recorded in `compatibility.unsupportedFields` as well as warned about, so the substitution is
 * visible to whatever reads the IR rather than only to whoever is watching the terminal.
 */
function describeImposedOutput({ sdkConfig, target }: { sdkConfig: SdkConfigV1; target: SdkConfigV1Target }): {
    warnings: string[];
    unsupportedFields: UnsupportedField[];
} {
    const configured = target.output ?? sdkConfig.output;
    if (configured == null || configured.delivery === "files") {
        return { warnings: [], unsupportedFields: [] };
    }

    const path = target.output != null ? ["targets", target.language, "output"] : ["output"];
    return {
        warnings: [
            `sdk-config.yml requests "${configured.delivery}" delivery, which a local generation run cannot ` +
                "perform. Generating into the output directory instead; publishing and GitHub delivery are " +
                "unchanged and still run from wherever they run today."
        ],
        unsupportedFields: [
            {
                source: "sdk-config-ir",
                path,
                code: "LOCAL_RUN_REQUIRES_FILES_DELIVERY",
                reason: `output.delivery "${configured.delivery}" is not performed by a local generation run`,
                severity: "warning",
                risk: "low",
                owner: "fern-cli",
                suggestedAction:
                    "Run the configured delivery from the route that performs it, not from `fern generate --local`"
            }
        ]
    };
}
