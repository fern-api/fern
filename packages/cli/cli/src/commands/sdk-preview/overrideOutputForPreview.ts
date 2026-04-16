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
 * Always uses publishV2(npmOverride) for registry-only publishing.
 *
 * @param token - The Fern org token (FERN_TOKEN). Used for registry auth.
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
    const modifiedGenerators = group.generators.map((generator) => ({
        ...generator,
        outputMode: createNpmOverrideOutputMode({ registryUrl, packageName, token }),
        absolutePathToLocalOutput: undefined
    }));

    return {
        ...group,
        generators: modifiedGenerators
    };
}

/**
 * Extracts the publishInfo from a githubV2 output mode, stripping all
 * auth tokens/credentials. Only the package name and registry URL are
 * needed for code generation (e.g. package.json name field).
 * Returns undefined for non-github modes.
 */
function getGithubPublishInfoWithoutToken(
    outputMode: FernFiddle.remoteGen.OutputMode
): FernFiddle.GithubPublishInfo | undefined {
    const publishInfo = outputMode._visit<FernFiddle.GithubPublishInfo | undefined>({
        downloadFiles: () => undefined,
        github: () => undefined,
        githubV2: (val) =>
            val._visit<FernFiddle.GithubPublishInfo | undefined>({
                push: (v) => v.publishInfo,
                commitAndRelease: (v) => v.publishInfo,
                pullRequest: (v) => v.publishInfo,
                _other: () => undefined
            }),
        publish: () => undefined,
        publishV2: () => undefined,
        _other: () => undefined
    });

    if (publishInfo == null) {
        return undefined;
    }

    return stripPublishInfoCredentials(publishInfo);
}

/**
 * Returns a copy of GithubPublishInfo with all auth credentials removed.
 * Preserves package name, registry URL, and other non-sensitive metadata.
 * Returns undefined for unknown variants to fail safe rather than leak credentials.
 */
function stripPublishInfoCredentials(
    publishInfo: FernFiddle.GithubPublishInfo
): FernFiddle.GithubPublishInfo | undefined {
    return publishInfo._visit<FernFiddle.GithubPublishInfo | undefined>({
        npm: (val) =>
            FernFiddle.GithubPublishInfo.npm({
                registryUrl: val.registryUrl,
                packageName: val.packageName,
                token: undefined
            }),
        maven: (val) =>
            FernFiddle.GithubPublishInfo.maven({
                registryUrl: val.registryUrl,
                coordinate: val.coordinate,
                credentials: undefined,
                signature: undefined
            }),
        postman: () => undefined,
        pypi: (val) =>
            FernFiddle.GithubPublishInfo.pypi({
                registryUrl: val.registryUrl,
                packageName: val.packageName,
                credentials: undefined,
                pypiMetadata: val.pypiMetadata
            }),
        nuget: (val) =>
            FernFiddle.GithubPublishInfo.nuget({
                registryUrl: val.registryUrl,
                packageName: val.packageName,
                apiKey: undefined
            }),
        rubygems: (val) =>
            FernFiddle.GithubPublishInfo.rubygems({
                registryUrl: val.registryUrl,
                packageName: val.packageName,
                apiKey: undefined
            }),
        crates: (val) =>
            FernFiddle.GithubPublishInfo.crates({
                registryUrl: val.registryUrl,
                packageName: val.packageName,
                token: undefined
            }),
        _other: () => undefined
    });
}

/**
 * Overrides a generator group's output mode to githubV2(push) for pushing a
 * clean diff branch. Preserves the original publishInfo so the generator
 * produces code with the correct package name (e.g. in package.json).
 * Fiddle's dryRun=true prevents actual publishing.
 *
 * Only includes generators that have GitHub configuration (owner/repo).
 * Generators without GitHub config are excluded (they can't push a diff branch).
 */
export function overrideGroupOutputForDiffBranch({
    group
}: {
    group: generatorsYml.GeneratorGroup;
}): generatorsYml.GeneratorGroup {
    const modifiedGenerators = group.generators
        .map((generator) => {
            const githubInfo = getGithubOwnerRepo(generator.outputMode);
            if (githubInfo == null) {
                return undefined;
            }
            return {
                ...generator,
                outputMode: FernFiddle.OutputMode.githubV2(
                    FernFiddle.GithubOutputModeV2.push({
                        owner: githubInfo.owner,
                        repo: githubInfo.repo,
                        branch: undefined,
                        license: undefined,
                        publishInfo: getGithubPublishInfoWithoutToken(generator.outputMode),
                        downloadSnippets: false
                    })
                ),
                absolutePathToLocalOutput: undefined
            };
        })
        .filter((g): g is NonNullable<typeof g> => g != null);

    return {
        ...group,
        generators: modifiedGenerators
    };
}
