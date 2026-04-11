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
 * Extracts the GitHub owner and repo from a generator's existing output mode.
 * Returns undefined if the generator doesn't have a githubV2 or github output mode.
 */
export function getGithubOwnerRepo(
    outputMode: FernFiddle.remoteGen.OutputMode
): { owner: string; repo: string } | undefined {
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
        // publishV2 is registry-only (npmOverride, mavenOverride, pypiOverride, etc.)
        // and does not carry github owner/repo info. GitHub publish info is only
        // available on githubV2 variants via the publishInfo field.
        publishV2: () => undefined,
        _other: () => undefined
    });
}

/**
 * Creates a publishV2(npmOverride) output mode for preview registry publishing.
 */
function createNpmOverrideOutputMode({
    registryUrl,
    packageName,
    token
}: {
    registryUrl: string;
    packageName: string;
    token: string;
}): FernFiddle.OutputMode {
    return FernFiddle.OutputMode.publishV2(
        FernFiddle.remoteGen.PublishOutputModeV2.npmOverride({
            registryUrl,
            packageName,
            token,
            downloadSnippets: false
        })
    );
}

/**
 * Overrides a generator group's output mode to downloadFiles (disk-only, no publish).
 * Used for remote generation with --output when no registry URL is provided.
 */
export function overrideGroupOutputForDownload({
    group
}: {
    group: generatorsYml.GeneratorGroup;
}): generatorsYml.GeneratorGroup {
    const modifiedGenerators = group.generators.map((generator) => ({
        ...generator,
        outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles({}),
        absolutePathToLocalOutput: undefined
    }));
    return {
        ...group,
        generators: modifiedGenerators
    };
}

/**
 * Overrides a generator group's output mode to publish to the preview registry.
 *
 * Used for both local Docker generation and remote Fiddle generation.
 * By default, uses publishV2(npmOverride) for registry-only publishing.
 *
 * When pushDiff is true AND the generator has github configuration (owner/repo),
 * uses githubV2(push) with npm publishInfo so Fiddle routes the task to
 * GithubFiddleTask, which handles both npm publishing and pushing a preview
 * diff branch to the SDK repo.
 *
 * @param token - The Fern org token (FERN_TOKEN). Used for registry auth.
 * @param pushDiff - When true, use githubV2(push) to push a diff branch to the SDK repo.
 */
export function overrideGroupOutputForPreview({
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
                return {
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
            }
        }

        return {
            ...generator,
            outputMode: createNpmOverrideOutputMode({ registryUrl, packageName, token }),
            absolutePathToLocalOutput: undefined
        };
    });

    return {
        ...group,
        generators: modifiedGenerators
    };
}
