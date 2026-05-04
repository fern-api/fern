import type { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernFiddle } from "@fern-fern/fiddle-sdk";

/**
 * Creates a minimal GeneratorInvocation for testing. NO language defaults;
 * callers MUST pass a `name` via overrides or use `makeNpmGenerator` /
 * `makePypiGenerator` factories below.
 */
export function makeGenerator(
    name: string,
    outputMode: FernFiddle.remoteGen.OutputMode,
    overrides?: Partial<generatorsYml.GeneratorInvocation>
): generatorsYml.GeneratorInvocation {
    // Test stubs may pass plain objects (e.g. `{ type: "downloadFiles" } as never`).
    // Normalize to a proper FernFiddle instance so _visit() is always available.
    const safeOutputMode =
        typeof (outputMode as unknown as Record<string, unknown>)?._visit === "function"
            ? outputMode
            : FernFiddle.remoteGen.OutputMode.downloadFiles({});
    return {
        name,
        version: "0.0.1",
        config: {},
        outputMode: safeOutputMode,
        automation: { generate: false, upgrade: false, preview: false, verify: false },
        containerImage: undefined,
        irVersionOverride: undefined,
        absolutePathToLocalOutput: AbsoluteFilePath.of("/tmp/test-output"),
        absolutePathToLocalSnippets: undefined,
        keywords: undefined,
        smartCasing: false,
        disableExamples: false,
        language: undefined,
        publishMetadata: undefined,
        readme: undefined,
        settings: undefined,
        ...overrides
    };
}

export function makeNpmGenerator(
    outputMode: FernFiddle.remoteGen.OutputMode,
    overrides?: Partial<generatorsYml.GeneratorInvocation>
): generatorsYml.GeneratorInvocation {
    return makeGenerator("fernapi/fern-typescript-node-sdk", outputMode, {
        version: "0.57.10",
        raw: { output: { location: "npm", "package-name": "@acme/sdk" } } as never,
        ...overrides
    });
}

export function makePypiGenerator(
    outputMode: FernFiddle.remoteGen.OutputMode,
    overrides?: Partial<generatorsYml.GeneratorInvocation>
): generatorsYml.GeneratorInvocation {
    return makeGenerator("fernapi/fern-python-sdk", outputMode, {
        version: "4.3.8",
        raw: { output: { location: "pypi", "package-name": "acme-sdk" } } as never,
        ...overrides
    });
}

export function makeGroup(generators: generatorsYml.GeneratorInvocation[]): generatorsYml.GeneratorGroup {
    return {
        groupName: "preview",
        audiences: { type: "all" },
        generators,
        reviewers: undefined
    };
}


