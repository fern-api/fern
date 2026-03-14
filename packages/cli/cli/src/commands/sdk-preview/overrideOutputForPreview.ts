import { generatorsYml } from "@fern-api/configuration-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";

import { PREVIEW_REGISTRY_URL } from "./computePreviewVersion.js";

/**
 * Overrides a generator group's output mode to publish to the preview registry.
 *
 * Follows the same pattern as `applyLfsOverride` in generateAPIWorkspace.ts:
 * clone the group with modified generators that have their outputMode replaced.
 *
 * Only supports npm (TypeScript) generators for v1.
 */
export function overrideGroupOutputForPreview({
    group,
    packageName,
    previewVersion,
    token
}: {
    group: generatorsYml.GeneratorGroup;
    packageName: string;
    previewVersion: string;
    token: string;
}): generatorsYml.GeneratorGroup {
    const modifiedGenerators = group.generators.map((generator) => {
        const modifiedGenerator: generatorsYml.GeneratorInvocation = {
            ...generator,
            outputMode: FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.npmOverride({
                    registryUrl: PREVIEW_REGISTRY_URL,
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
