import { generatorsYml } from "@fern-api/configuration-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";

export const PREVIEW_REGISTRY_URL = process.env.FERN_PREVIEW_REGISTRY_URL ?? "https://npm.buildwithfern.com";

const SUPPORTED_TYPESCRIPT_GENERATORS = new Set([
    "fernapi/fern-typescript-node-sdk",
    "fernapi/fern-typescript-browser-sdk",
    "fernapi/fern-typescript-sdk"
]);

/**
 * Returns true if the generator is a TypeScript/npm generator.
 * SDK preview v1 only supports npm publishing.
 */
export function isNpmGenerator(generatorName: string): boolean {
    return SUPPORTED_TYPESCRIPT_GENERATORS.has(generatorName);
}

/**
 * Overrides a generator group's output mode to publish to the preview registry.
 *
 * Follows the same pattern as `applyLfsOverride` in generateAPIWorkspace.ts:
 * clone the group with modified generators that have their outputMode replaced.
 *
 * Only supports npm (TypeScript) generators for v1.
 *
 * @param token - The Fern org token (FERN_TOKEN). The preview registry must
 *   accept this token for publish authentication.
 */
export function overrideGroupOutputForPreview({
    group,
    packageName,
    token,
    registryUrl
}: {
    group: generatorsYml.GeneratorGroup;
    packageName: string;
    token: string;
    registryUrl: string;
}): generatorsYml.GeneratorGroup {
    const modifiedGenerators = group.generators.map((generator) => {
        const modifiedGenerator: generatorsYml.GeneratorInvocation = {
            ...generator,
            outputMode: FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.npmOverride({
                    registryUrl,
                    packageName,
                    token,
                    downloadSnippets: false
                })
            ),
            // Clear local output path — we're publishing, not writing to disk
            absolutePathToLocalOutput: undefined
        };
        return modifiedGenerator;
    });

    return {
        ...group,
        generators: modifiedGenerators
    };
}
