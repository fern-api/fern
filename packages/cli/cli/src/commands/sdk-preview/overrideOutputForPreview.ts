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
 * Overrides a generator group's output mode to publish to the preview registry
 * via local Docker generation (publishV2 / npmOverride).
 *
 * Used when --output is provided and local Docker generation is used.
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

/**
 * Extracts the GitHub owner and repo from a generator's existing output mode.
 * Returns undefined if the generator doesn't have a githubV2 or github output mode.
 */
function getGithubOwnerRepo(outputMode: FernFiddle.remoteGen.OutputMode): { owner: string; repo: string } | undefined {
    return outputMode._visit<{ owner: string; repo: string } | undefined>({
        downloadFiles: () => undefined,
        github: (val) => ({ owner: val.owner, repo: val.repo }),
        githubV2: (val) =>
            val._visit<{ owner: string; repo: string }>({
                push: (v) => ({ owner: v.owner, repo: v.repo }),
                commitAndRelease: (v) => ({ owner: v.owner, repo: v.repo }),
                pullRequest: (v) => ({ owner: v.owner, repo: v.repo }),
                _other: () => ({ owner: "", repo: "" })
            }),
        publish: () => undefined,
        publishV2: () => undefined,
        _other: () => undefined
    });
}

/**
 * Overrides a generator group's output mode for remote Fiddle generation.
 *
 * Uses githubV2(push) with npm publishInfo so that Fiddle routes the task to
 * GithubFiddleTask, which handles both npm publishing and pushing the preview
 * diff branch to the SDK repo.
 *
 * Falls back to publishV2(npmOverride) if the generator doesn't have github
 * configuration (owner/repo) — this still publishes to the preview registry
 * but skips the diff branch push.
 *
 * @param token - The Fern org token (FERN_TOKEN). Used for registry auth.
 */
export function overrideGroupOutputForRemotePreview({
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
        const githubInfo = getGithubOwnerRepo(generator.outputMode);

        if (githubInfo != null && githubInfo.owner !== "" && githubInfo.repo !== "") {
            // Use githubV2(push) so Fiddle routes to GithubFiddleTask, which
            // handles publishing + pushing the preview diff branch.
            const modifiedGenerator: generatorsYml.GeneratorInvocation = {
                ...generator,
                outputMode: FernFiddle.OutputMode.githubV2(
                    FernFiddle.GithubOutputModeV2.push({
                        owner: githubInfo.owner,
                        repo: githubInfo.repo,
                        branch: undefined,
                        license: undefined,
                        publishInfo: FernFiddle.GithubPublishInfo.npm({
                            registryUrl,
                            packageName,
                            token
                        }),
                        downloadSnippets: false
                    })
                ),
                absolutePathToLocalOutput: undefined
            };
            return modifiedGenerator;
        }

        // Fallback: no github config — use publishV2 for registry-only publish.
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
            absolutePathToLocalOutput: undefined
        };
        return modifiedGenerator;
    });

    return {
        ...group,
        generators: modifiedGenerators
    };
}
