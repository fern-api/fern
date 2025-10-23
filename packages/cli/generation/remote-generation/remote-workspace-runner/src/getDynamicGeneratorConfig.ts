import { generatorsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { dynamic } from "@fern-api/ir-sdk";

import { FernFiddle } from "@fern-fern/fiddle-sdk";

export function getDynamicGeneratorConfig({
    apiName,
    organization,
    generatorInvocation
}: {
    apiName: string;
    organization: string;
    generatorInvocation: generatorsYml.GeneratorInvocation;
}): dynamic.GeneratorConfig | undefined {
    const outputConfig = getDynamicGeneratorOutputConfig(generatorInvocation);
    return {
        apiName,
        organization,
        customConfig: generatorInvocation.config,
        outputConfig: outputConfig ?? dynamic.GeneratorOutputConfig.local()
    };
}

function getDynamicGeneratorOutputConfig(
    generatorInvocation: generatorsYml.GeneratorInvocation
): dynamic.GeneratorOutputConfig | undefined {
    const outputMode = generatorInvocation.outputMode;
    switch (outputMode.type) {
        case "downloadFiles":
            return dynamic.GeneratorOutputConfig.local();
        case "publishV2":
            return getDynamicGeneratorConfigPublishOutputMode({
                publish: outputMode.publishV2,
                version: generatorInvocation.version
            });
        case "githubV2":
            return getDynamicGeneratorConfigGithubOutputMode({
                github: outputMode.githubV2,
                language: generatorInvocation.language,
                version: generatorInvocation.version
            });
        case "publish":
        case "github":
            // These output modes are no longer supported.
            return undefined;
        default:
            assertNever(outputMode);
    }
}

function getDynamicGeneratorConfigPublishOutputMode({
    publish,
    version
}: {
    publish: FernFiddle.remoteGen.PublishOutputModeV2;
    version: string;
}): dynamic.GeneratorOutputConfig | undefined {
    switch (publish.type) {
        case "npmOverride": {
            const override = publish.npmOverride;
            if (override == null) {
                return undefined;
            }
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.npm({
                    version,
                    packageName: override.packageName,
                    repoUrl: undefined
                })
            );
        }
        case "mavenOverride": {
            const override = publish.mavenOverride;
            if (override == null) {
                return undefined;
            }
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.maven({
                    version,
                    coordinate: override.coordinate,
                    repoUrl: undefined
                })
            );
        }
        case "pypiOverride": {
            const override = publish.pypiOverride;
            if (override == null) {
                return undefined;
            }
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.pypi({
                    version,
                    packageName: override.coordinate,
                    repoUrl: undefined
                })
            );
        }
        case "rubyGemsOverride": {
            const override = publish.rubyGemsOverride;
            if (override == null) {
                return undefined;
            }
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.rubygems({
                    version,
                    packageName: override.packageName,
                    repoUrl: undefined
                })
            );
        }
        case "nugetOverride": {
            const override = publish.nugetOverride;
            if (override == null) {
                return undefined;
            }
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.nuget({
                    version,
                    packageName: override.packageName,
                    repoUrl: undefined
                })
            );
        }
        case "cratesOverride": {
            const override = publish.cratesOverride;
            if (override == null) {
                return undefined;
            }
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.crates({
                    version,
                    packageName: override.packageName,
                    repoUrl: undefined
                })
            );
        }
        case "postman":
            return undefined;
        default:
            assertNever(publish);
    }
}

function getDynamicGeneratorConfigGithubOutputMode({
    github,
    version,
    language
}: {
    github: FernFiddle.remoteGen.BaseGithubInfo;
    version: string;
    language: generatorsYml.GenerationLanguage | undefined;
}): dynamic.GeneratorOutputConfig | undefined {
    const repoUrl = getGithubRepoUrl({ owner: github.owner, repo: github.repo });
    if (language === generatorsYml.GenerationLanguage.GO) {
        return dynamic.GeneratorOutputConfig.publish(
            dynamic.PublishInfo.go({
                version,
                repoUrl
            })
        );
    }
    if (language === generatorsYml.GenerationLanguage.SWIFT) {
        return dynamic.GeneratorOutputConfig.publish(
            dynamic.PublishInfo.swift({
                version,
                repoUrl
            })
        );
    }
    const publishInfo = github.publishInfo;
    if (publishInfo == null) {
        return undefined;
    }
    switch (publishInfo.type) {
        case "maven":
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.maven({
                    version,
                    coordinate: publishInfo.coordinate,
                    repoUrl
                })
            );
        case "npm":
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.npm({
                    version,
                    packageName: publishInfo.packageName,
                    repoUrl
                })
            );
        case "pypi":
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.pypi({
                    version,
                    packageName: publishInfo.packageName,
                    repoUrl
                })
            );
        case "rubygems":
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.rubygems({
                    version,
                    packageName: publishInfo.packageName,
                    repoUrl
                })
            );
        case "nuget":
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.nuget({
                    version,
                    packageName: publishInfo.packageName,
                    repoUrl
                })
            );
        case "crates":
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.crates({
                    version,
                    packageName: publishInfo.packageName,
                    repoUrl
                })
            );
        case "postman":
            return undefined;
        default:
            assertNever(publishInfo);
    }
}

function getGithubRepoUrl({ owner, repo }: { owner: string; repo: string }): string {
    return `https://github.com/${owner}/${repo}`;
}
