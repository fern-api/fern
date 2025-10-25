import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { generatorsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { APIV1Write } from "@fern-api/fdr-sdk";
import { convertIrToDynamicSnippetsIr, generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { dynamic } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";

interface DynamicIr {
    dynamicIR: dynamic.DynamicIntermediateRepresentation;
}

export async function generateLanguageSpecificDynamicIRs({
    workspace,
    organization,
    context,
    snippetsConfig
}: {
    workspace: FernWorkspace | undefined;
    organization: string;
    context: TaskContext;
    snippetsConfig: APIV1Write.SnippetsConfig;
}): Promise<Record<string, DynamicIr> | undefined> {
    let languageSpecificIRs: Record<string, DynamicIr> = {};

    if (!workspace) {
        return undefined;
    }

    if (Object.keys(snippetsConfig).length === 0) {
        context.logger.warn(`WARNING: No snippets defined for ${workspace.workspaceName}.`);
        context.logger.warn("Did you add snippets to your docs configuration?");
        context.logger.warn("For more info: https://buildwithfern.com/learn/docs/api-references/sdk-snippets");
    }

    let snippetConfiguration = {
        typescript: snippetsConfig.typescriptSdk?.package,
        python: snippetsConfig.pythonSdk?.package,
        java: snippetsConfig.javaSdk?.coordinate,
        go: snippetsConfig.goSdk?.githubRepo,
        csharp: snippetsConfig.csharpSdk?.package,
        ruby: snippetsConfig.rubySdk?.gem,
        php: snippetsConfig.phpSdk?.package,
        swift: snippetsConfig.swiftSdk?.package,
        rust: snippetsConfig.rustSdk?.package
    };

    if (workspace.generatorsConfiguration?.groups) {
        for (const group of workspace.generatorsConfiguration.groups) {
            for (const generatorInvocation of group.generators) {
                let dynamicGeneratorConfig = getDynamicGeneratorConfig({
                    apiName: workspace.workspaceName ?? "",
                    organization,
                    generatorInvocation
                });
                let packageName = "";

                if (dynamicGeneratorConfig?.outputConfig.type === "publish") {
                    switch (dynamicGeneratorConfig.outputConfig.value.type) {
                        case "npm":
                        case "nuget":
                        case "pypi":
                        case "rubygems":
                            packageName = dynamicGeneratorConfig.outputConfig.value.packageName;
                            break;
                        case "maven":
                            packageName = dynamicGeneratorConfig.outputConfig.value.coordinate;
                            break;
                        case "go":
                            packageName = dynamicGeneratorConfig.outputConfig.value.repoUrl;
                            break;
                        case "swift":
                            packageName = dynamicGeneratorConfig.outputConfig.value.repoUrl;
                            break;
                        case "crates":
                            packageName = dynamicGeneratorConfig.outputConfig.value.packageName;
                            break;
                    }
                }

                // construct a generatorConfig for php since it is not parsed by getDynamicGeneratorConfig
                if (
                    generatorInvocation.language === "php" &&
                    generatorInvocation.config &&
                    typeof generatorInvocation.config === "object" &&
                    "packageName" in generatorInvocation.config
                ) {
                    packageName = (generatorInvocation.config as { packageName?: string }).packageName ?? "";
                }

                if (!generatorInvocation.language) {
                    continue;
                }

                // generate a dynamic IR for configuration that matches the requested api snippet
                if (
                    generatorInvocation.language &&
                    snippetConfiguration[generatorInvocation.language] === packageName
                ) {
                    const irForDynamicSnippets = generateIntermediateRepresentation({
                        workspace,
                        generationLanguage: generatorInvocation.language,
                        keywords: undefined,
                        smartCasing: generatorInvocation.smartCasing,
                        exampleGeneration: {
                            disabled: true,
                            skipAutogenerationIfManualExamplesExist: true,
                            skipErrorAutogenerationIfManualErrorExamplesExist: true
                        },
                        audiences: {
                            type: "all"
                        },
                        readme: undefined,
                        packageName: packageName,
                        version: undefined,
                        context,
                        sourceResolver: new SourceResolverImpl(context, workspace),
                        dynamicGeneratorConfig
                    });

                    const dynamicIR = convertIrToDynamicSnippetsIr({
                        ir: irForDynamicSnippets,
                        disableExamples: true,
                        smartCasing: generatorInvocation.smartCasing,
                        generationLanguage: generatorInvocation.language,
                        generatorConfig: dynamicGeneratorConfig
                    });

                    // include metadata along with the dynamic IR
                    if (dynamicIR) {
                        languageSpecificIRs[generatorInvocation.language] = {
                            dynamicIR
                        };
                    } else {
                        context.logger.debug(`Failed to create dynamic IR for ${generatorInvocation.language}`);
                    }
                }
            }
        }
    }

    for (const [language, packageName] of Object.entries(snippetConfiguration)) {
        if (language && packageName && !Object.keys(languageSpecificIRs).includes(language)) {
            context.logger.warn();
            context.logger.warn(
                `Failed to generate ${language} SDK snippets because of unknown package \`${packageName}\`.`
            );
            context.logger.warn(
                `Please make sure your ${workspace.workspaceName ? `${workspace.workspaceName}/` : ""}generators.yml has a generator that publishes a ${packageName} package.`
            );
            context.logger.warn();
        }
    }

    if (Object.keys(languageSpecificIRs).length > 0) {
        return languageSpecificIRs;
    }

    return undefined;
}

function getDynamicGeneratorConfig({
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
            return undefined;
        default:
            assertNever(outputMode);
            return undefined;
    }
}

function getDynamicGeneratorConfigPublishOutputMode({
    publish,
    version
}: {
    publish: unknown;
    version: string;
}): dynamic.GeneratorOutputConfig | undefined {
    if (typeof publish !== "object" || publish == null || !("type" in publish)) {
        return undefined;
    }

    const publishObj = publish as { type: string; [key: string]: unknown };

    switch (publishObj.type) {
        case "npmOverride": {
            const override = "npmOverride" in publishObj ? publishObj.npmOverride : null;
            if (override == null || typeof override !== "object") {
                return undefined;
            }
            const overrideObj = override as { packageName?: string };
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.npm({
                    version,
                    packageName: overrideObj.packageName ?? "",
                    repoUrl: undefined
                })
            );
        }
        case "mavenOverride": {
            const override = "mavenOverride" in publishObj ? publishObj.mavenOverride : null;
            if (override == null || typeof override !== "object") {
                return undefined;
            }
            const overrideObj = override as { coordinate?: string };
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.maven({
                    version,
                    coordinate: overrideObj.coordinate ?? "",
                    repoUrl: undefined
                })
            );
        }
        case "pypiOverride": {
            const override = "pypiOverride" in publishObj ? publishObj.pypiOverride : null;
            if (override == null || typeof override !== "object") {
                return undefined;
            }
            const overrideObj = override as { coordinate?: string };
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.pypi({
                    version,
                    packageName: overrideObj.coordinate ?? "",
                    repoUrl: undefined
                })
            );
        }
        case "rubyGemsOverride": {
            const override = "rubyGemsOverride" in publishObj ? publishObj.rubyGemsOverride : null;
            if (override == null || typeof override !== "object") {
                return undefined;
            }
            const overrideObj = override as { packageName?: string };
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.rubygems({
                    version,
                    packageName: overrideObj.packageName ?? "",
                    repoUrl: undefined
                })
            );
        }
        case "nugetOverride": {
            const override = "nugetOverride" in publishObj ? publishObj.nugetOverride : null;
            if (override == null || typeof override !== "object") {
                return undefined;
            }
            const overrideObj = override as { packageName?: string };
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.nuget({
                    version,
                    packageName: overrideObj.packageName ?? "",
                    repoUrl: undefined
                })
            );
        }
        case "cratesOverride": {
            const override = "cratesOverride" in publishObj ? publishObj.cratesOverride : null;
            if (override == null || typeof override !== "object") {
                return undefined;
            }
            const overrideObj = override as { packageName?: string };
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.crates({
                    version,
                    packageName: overrideObj.packageName ?? "",
                    repoUrl: undefined
                })
            );
        }
        case "postman":
            return undefined;
        default:
            return undefined;
    }
}

function getDynamicGeneratorConfigGithubOutputMode({
    github,
    version,
    language
}: {
    github: unknown;
    version: string;
    language: generatorsYml.GenerationLanguage | undefined;
}): dynamic.GeneratorOutputConfig | undefined {
    if (typeof github !== "object" || github == null || !("owner" in github) || !("repo" in github)) {
        return undefined;
    }

    const githubObj = github as { owner: string; repo: string; publishInfo?: unknown };
    const repoUrl = getGithubRepoUrl({ owner: githubObj.owner, repo: githubObj.repo });

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

    const publishInfo = githubObj.publishInfo;
    if (publishInfo == null || typeof publishInfo !== "object" || !("type" in publishInfo)) {
        return undefined;
    }

    const publishInfoObj = publishInfo as { type: string; [key: string]: unknown };

    switch (publishInfoObj.type) {
        case "maven": {
            const coordinate = "coordinate" in publishInfoObj ? publishInfoObj.coordinate : undefined;
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.maven({
                    version,
                    coordinate: typeof coordinate === "string" ? coordinate : "",
                    repoUrl
                })
            );
        }
        case "npm": {
            const packageName = "packageName" in publishInfoObj ? publishInfoObj.packageName : undefined;
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.npm({
                    version,
                    packageName: typeof packageName === "string" ? packageName : "",
                    repoUrl
                })
            );
        }
        case "pypi": {
            const packageName = "packageName" in publishInfoObj ? publishInfoObj.packageName : undefined;
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.pypi({
                    version,
                    packageName: typeof packageName === "string" ? packageName : "",
                    repoUrl
                })
            );
        }
        case "rubygems": {
            const packageName = "packageName" in publishInfoObj ? publishInfoObj.packageName : undefined;
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.rubygems({
                    version,
                    packageName: typeof packageName === "string" ? packageName : "",
                    repoUrl
                })
            );
        }
        case "nuget": {
            const packageName = "packageName" in publishInfoObj ? publishInfoObj.packageName : undefined;
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.nuget({
                    version,
                    packageName: typeof packageName === "string" ? packageName : "",
                    repoUrl
                })
            );
        }
        case "crates": {
            const packageName = "packageName" in publishInfoObj ? publishInfoObj.packageName : undefined;
            return dynamic.GeneratorOutputConfig.publish(
                dynamic.PublishInfo.crates({
                    version,
                    packageName: typeof packageName === "string" ? packageName : "",
                    repoUrl
                })
            );
        }
        case "postman":
            return undefined;
        default:
            return undefined;
    }
}

function getGithubRepoUrl({ owner, repo }: { owner: string; repo: string }): string {
    return `https://github.com/${owner}/${repo}`;
}
