import { generatorsYml } from "@fern-api/configuration-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { getPreviewLanguage, getStrategy, type PreviewLanguage } from "./previewStrategies.js";

export const PREVIEW_REGISTRY_URL = process.env.FERN_PREVIEW_REGISTRY_URL ?? "https://npm.buildwithfern.com";

/**
 * Optional PyPI registry URL for SDK preview. NO default - the user must
 * either set this env var or pass `--output <pypi-url>`. Test PyPI is
 * intentionally not the default (rate limits + global namespace).
 */
export const PREVIEW_PYPI_REGISTRY_URL: string | undefined = process.env.FERN_PREVIEW_PYPI_REGISTRY_URL;

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
        publishV2: () => undefined,
        _other: () => undefined
    });
}

/**
 * Internal helper shared by every override function that re-maps every
 * generator in a group while clearing `absolutePathToLocalOutput`.
 */
function mapGenerators(
    group: generatorsYml.GeneratorGroup,
    fn: (generator: generatorsYml.GeneratorInvocation) => generatorsYml.GeneratorInvocation | undefined
): generatorsYml.GeneratorGroup {
    const modifiedGenerators = group.generators
        .map(fn)
        .filter((g): g is generatorsYml.GeneratorInvocation => g != null);
    return { ...group, generators: modifiedGenerators };
}

export function overrideGroupOutputForDownload({
    group
}: {
    group: generatorsYml.GeneratorGroup;
}): generatorsYml.GeneratorGroup {
    return mapGenerators(group, (generator) => ({
        ...generator,
        outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles({}),
        absolutePathToLocalOutput: undefined
    }));
}

/**
 * Overrides a generator group's output mode to publish to the preview
 * registry for the supplied language. Routes through the strategy registry
 * so each language picks its own publishV2 variant.
 *
 * @param language - "npm" or "pypi" - determines the publishV2 variant.
 * @param token - For npm: the registry token. For pypi: the password used
 *                with username "__token__".
 */
export function overrideGroupOutputForPreview({
    group,
    language,
    packageName,
    token,
    registryUrl
}: {
    group: generatorsYml.GeneratorGroup;
    language: PreviewLanguage;
    packageName: string;
    token: string;
    registryUrl: string;
}): generatorsYml.GeneratorGroup {
    const strategy = getStrategy(language);
    return mapGenerators(group, (generator) => ({
        ...generator,
        outputMode: strategy.buildOutputMode({ registryUrl, packageName, token }),
        absolutePathToLocalOutput: undefined
    }));
}

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

export function overrideGroupOutputForDiffBranch({
    group
}: {
    group: generatorsYml.GeneratorGroup;
}): generatorsYml.GeneratorGroup {
    return mapGenerators(group, (generator) => {
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
    });
}

// `isNpmGenerator` is intentionally removed. Use `getPreviewLanguage(name)`
// from `./previewStrategies.js` instead. Re-export here purely so external
// consumers  get a clear deprecation.
export { getPreviewLanguage };
