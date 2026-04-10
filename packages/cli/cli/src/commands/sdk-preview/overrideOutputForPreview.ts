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
            val._visit<{ owner: string; repo: string } | undefined>({
                push: (v) => ({ owner: v.owner, repo: v.repo }),
                commitAndRelease: (v) => ({ owner: v.owner, repo: v.repo }),
                pullRequest: (v) => ({ owner: v.owner, repo: v.repo }),
                _other: () => undefined
            }),
        publish: () => undefined,
        publishV2: () => undefined,
        _other: () => undefined
    });
}

/**
 * Overrides a generator group's output mode for remote Fiddle generation.
 *
 * By default, uses publishV2(npmOverride) so Fiddle publishes to the preview
 * registry without touching the SDK repo.
 *
 * When pushDiff is true AND the generator has github configuration (owner/repo),
 * uses githubV2(push) with npm publishInfo so Fiddle routes the task to
 * GithubFiddleTask, which handles both npm publishing and pushing a preview
 * diff branch to the SDK repo.
 *
 * @param token - The Fern org token (FERN_TOKEN). Used for registry auth.
 * @param pushDiff - When true, use githubV2(push) to push a diff branch to the SDK repo.
 */
export function overrideGroupOutputForRemotePreview({
    group,
    packageName,
    token,
    registryUrl,
    pushDiff
}: {
    group: generatorsYml.GeneratorGroup;
    packageName: string;
    token: string;
    registryUrl: string;
    pushDiff?: boolean;
}): generatorsYml.GeneratorGroup {
    const modifiedGenerators = group.generators.map((generator) => {
        if (pushDiff === true) {
            const githubInfo = getGithubOwnerRepo(generator.outputMode);
            if (githubInfo != null) {
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
        }

        // Default: publishV2 for registry-only publish (no SDK repo push).
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
