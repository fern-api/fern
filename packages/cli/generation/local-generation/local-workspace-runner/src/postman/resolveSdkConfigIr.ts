import type { generatorsYml } from "@fern-api/configuration";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { SdkConfigIrV1 } from "@postman/sdk-config";

import { onPremAdapterLanguage } from "../constants.js";
import type { RawSpecsManifest } from "../rawSpecs.js";
import { buildSdkConfigIrFromSdkConfig } from "./buildSdkConfigIrFromSdkConfig.js";
import { loadSdkConfig, SDK_CONFIG_FILENAME } from "./loadSdkConfig.js";

type TargetLanguage = SdkConfigIrV1["target"]["language"];

export declare namespace resolveSdkConfigIr {
    interface Args {
        generatorInvocation: generatorsYml.GeneratorInvocation;
        /** Path to `fern.config.json`; `sdk-config.yml` sits beside it. */
        absolutePathToFernConfig: AbsoluteFilePath | undefined;
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
 * Produces the SDK Config IR for a Postman adapter invocation, from the workspace's `sdk-config.yml`.
 *
 * Only the new generators reach this path, and they are configured by the new file -- so an
 * unmigrated workspace is refused here rather than served from `generators.yml`. That refusal is the
 * point: `generators.yml` cannot express what these generators are configured with, and translating
 * it on the fly would produce an SDK shaped by a configuration the customer never wrote. Generators
 * below the cutover never get here, which is what keeps an unmigrated workspace working untouched.
 */
export async function resolveSdkConfigIr({
    generatorInvocation,
    absolutePathToFernConfig,
    organization,
    outputPath,
    rawSpecsManifest
}: resolveSdkConfigIr.Args): Promise<resolveSdkConfigIr.Result> {
    const language = onPremAdapterLanguage(generatorInvocation.name);
    if (language == null) {
        return {
            success: false,
            message:
                `Generator "${generatorInvocation.name}" is a Postman generator, but the CLI does not know ` +
                "which language it generates. Upgrade the Fern CLI to a version that knows this generator."
        };
    }

    const loaded = await loadSdkConfig({ absolutePathToFernConfig });
    switch (loaded.type) {
        case "invalid":
            return { success: false, message: `${loaded.absolutePath}: ${loaded.message}` };
        case "absent":
            return { success: false, message: migrationRequiredMessage(generatorInvocation) };
        case "loaded":
            return buildSdkConfigIrFromSdkConfig({
                sdkConfig: loaded.sdkConfig,
                language: language as TargetLanguage,
                generatorName: generatorInvocation.name,
                organization,
                outputPath,
                rawSpecsManifest
            });
    }
}

/**
 * Names the generator that forced the migration, since a `generators.yml` with several entries gives
 * no other clue which one the CLI is objecting to -- the rest continue to run untouched.
 */
function migrationRequiredMessage(generatorInvocation: generatorsYml.GeneratorInvocation): string {
    return (
        `${generatorInvocation.name}@${generatorInvocation.version} is configured by ${SDK_CONFIG_FILENAME}, ` +
        `which this workspace does not have. Migrate your generator configuration:\n\n` +
        `    fern sdk migrate\n\n` +
        `That writes ${SDK_CONFIG_FILENAME} and archives your generators.yml as generators.archived.yml. ` +
        `Your other generators keep running from generators.yml either way.`
    );
}
