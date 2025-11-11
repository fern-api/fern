import { GeneratorInvocation, generatorsYml } from "@fern-api/configuration";
import { isGithubSelfhosted } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import {
    CratesOutput,
    GithubPublishInfo as FiddleGithubPublishInfo,
    MavenOutput,
    NpmOutput,
    NugetOutput,
    PostmanOutput,
    PublishOutputMode,
    PublishOutputModeV2,
    PypiOutput,
    RubyGemsOutput
} from "@fern-fern/fiddle-sdk/api";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { EnvironmentVariable } from "@fern-fern/generator-exec-sdk/api";
import * as path from "path";

const DEFAULT_OUTPUT_VERSION = "0.0.1";

export function getLicensePathFromConfig(
    generatorInvocation: GeneratorInvocation
): { type: "basic"; value: string } | { type: "custom"; value: string } | undefined {
    if (
        generatorInvocation.raw?.github != null &&
        typeof generatorInvocation.raw.github === "object" &&
        "license" in generatorInvocation.raw.github
    ) {
        const githubConfig = generatorInvocation.raw.github as { license?: string | { custom: string } };

        if (githubConfig.license != null) {
            if (typeof githubConfig.license === "string") {
                return { type: "basic", value: githubConfig.license };
            } else if (typeof githubConfig.license === "object" && "custom" in githubConfig.license) {
                return { type: "custom", value: githubConfig.license.custom };
            }
        }
    }

    if (generatorInvocation.raw?.metadata?.license != null) {
        const license = generatorInvocation.raw.metadata.license;
        if (typeof license === "string") {
            return { type: "basic", value: license };
        } else if (typeof license === "object" && "custom" in license) {
            return { type: "custom", value: license.custom };
        }
    }

    return undefined;
}

function extractLicenseInfo(
    generatorInvocation: GeneratorInvocation,
    absolutePathToFernConfig?: AbsoluteFilePath
): FernGeneratorExec.LicenseConfig | undefined {
    const licenseConfig = getLicensePathFromConfig(generatorInvocation);

    if (licenseConfig == null) {
        return undefined;
    }

    if (licenseConfig.type === "basic") {
        if (licenseConfig.value === "MIT" || licenseConfig.value === "Apache-2.0") {
            return FernGeneratorExec.LicenseConfig.basic({
                id:
                    licenseConfig.value === "MIT"
                        ? FernGeneratorExec.LicenseId.Mit
                        : FernGeneratorExec.LicenseId.Apache2
            });
        }
    } else if (licenseConfig.type === "custom") {
        return FernGeneratorExec.LicenseConfig.custom({
            filename: path.basename(licenseConfig.value)
        });
    }

    return undefined;
}

export declare namespace getGeneratorConfig {
    export interface Args {
        workspaceName: string;
        organization: string;
        outputVersion?: string | undefined;
        customConfig: unknown;
        generatorInvocation: generatorsYml.GeneratorInvocation;
        absolutePathToSnippet: AbsoluteFilePath | undefined;
        absolutePathToSnippetTemplates: AbsoluteFilePath | undefined;
        absolutePathToFernConfig: AbsoluteFilePath | undefined;
        writeUnitTests: boolean;
        generateOauthClients: boolean;
        generatePaginatedClients: boolean;
        paths: {
            snippetPath: AbsoluteFilePath | undefined;
            snippetTemplatePath: AbsoluteFilePath | undefined;
            irPath: AbsoluteFilePath;
            outputDirectory: AbsoluteFilePath;
        };
    }
}

function getGithubPublishConfig(
    githubPublishInfo: FiddleGithubPublishInfo | undefined
): FernGeneratorExec.GithubPublishInfo | undefined {
    return githubPublishInfo != null
        ? FiddleGithubPublishInfo._visit<FernGeneratorExec.GithubPublishInfo | undefined>(githubPublishInfo, {
              npm: (value) => {
                  const token = (value.token || "${NPM_TOKEN}").trim();
                  const useOidc = token === "<USE_OIDC>" || token === "OIDC";
                  return FernGeneratorExec.GithubPublishInfo.npm({
                      registryUrl: value.registryUrl,
                      packageName: value.packageName,
                      tokenEnvironmentVariable: EnvironmentVariable(
                          useOidc
                              ? "<USE_OIDC>"
                              : token.startsWith("${") && token.endsWith("}")
                                ? token.slice(2, -1).trim()
                                : ""
                      )
                  });
              },
              maven: (value) =>
                  FernGeneratorExec.GithubPublishInfo.maven({
                      registryUrl: value.registryUrl,
                      coordinate: value.coordinate,
                      usernameEnvironmentVariable: EnvironmentVariable(value.credentials?.username ?? ""),
                      passwordEnvironmentVariable: EnvironmentVariable(value.credentials?.password ?? ""),
                      signature:
                          value.signature != null
                              ? {
                                    keyIdEnvironmentVariable: EnvironmentVariable(value.signature.keyId ?? ""),
                                    passwordEnvironmentVariable: EnvironmentVariable(value.signature.password ?? ""),
                                    secretKeyEnvironmentVariable: EnvironmentVariable(value.signature.secretKey ?? "")
                                }
                              : undefined
                  }),
              pypi: (value) =>
                  FernGeneratorExec.GithubPublishInfo.pypi({
                      registryUrl: value.registryUrl,
                      packageName: value.packageName,
                      usernameEnvironmentVariable: EnvironmentVariable("PYPI_USERNAME"),
                      passwordEnvironmentVariable: EnvironmentVariable("PYPI_PASSWORD"),
                      pypiMetadata: value.pypiMetadata
                  }),
              rubygems: (value) =>
                  FernGeneratorExec.GithubPublishInfo.rubygems({
                      registryUrl: value.registryUrl,
                      packageName: value.packageName,
                      apiKeyEnvironmentVariable: EnvironmentVariable(value.apiKey ?? "")
                  }),
              postman: (value) =>
                  FernGeneratorExec.GithubPublishInfo.postman({
                      apiKeyEnvironmentVariable: EnvironmentVariable(value.apiKey ?? ""),
                      workspaceIdEnvironmentVariable: EnvironmentVariable(value.workspaceId ?? "")
                  }),
              nuget: (value) =>
                  FernGeneratorExec.GithubPublishInfo.nuget({
                      registryUrl: value.registryUrl,
                      packageName: value.packageName,
                      apiKeyEnvironmentVariable: EnvironmentVariable(value.apiKey ?? "")
                  }),
              crates: (value) =>
                  FernGeneratorExec.GithubPublishInfo.crates({
                      registryUrl: value.registryUrl,
                      packageName: value.packageName,
                      tokenEnvironmentVariable: EnvironmentVariable(value.token ?? "")
                  }),
              _other: () => undefined
          })
        : undefined;
}

export function getGeneratorConfig({
    generatorInvocation,
    customConfig,
    workspaceName,
    organization,
    outputVersion = DEFAULT_OUTPUT_VERSION,
    absolutePathToSnippet,
    absolutePathToSnippetTemplates,
    absolutePathToFernConfig,
    writeUnitTests,
    generateOauthClients,
    generatePaginatedClients,
    paths
}: getGeneratorConfig.Args): FernGeneratorExec.GeneratorConfig {
    const licenseInfo = extractLicenseInfo(generatorInvocation, absolutePathToFernConfig);
    const { snippetPath, snippetTemplatePath, irPath, outputDirectory } = paths;
    const output = generatorInvocation.outputMode._visit<FernGeneratorExec.GeneratorOutputConfig>({
        publish: (value) => {
            return {
                ...newDummyPublishOutputConfig(outputVersion, value, generatorInvocation, paths),
                snippetFilepath: snippetPath,
                publishingMetadata: generatorInvocation.publishMetadata
            };
        },
        publishV2: (value) => {
            return {
                ...newDummyPublishOutputConfig(outputVersion, value, generatorInvocation, paths),
                snippetFilepath: snippetPath,
                publishingMetadata: generatorInvocation.publishMetadata
            };
        },
        downloadFiles: () => {
            const outputConfig: FernGeneratorExec.GeneratorOutputConfig = {
                mode: FernGeneratorExec.OutputMode.downloadFiles(),
                path: outputDirectory,
                snippetFilepath: snippetPath,
                publishingMetadata: generatorInvocation.publishMetadata
            };
            return outputConfig;
        },
        github: (value) => {
            const outputConfig: FernGeneratorExec.GeneratorOutputConfig = {
                mode: FernGeneratorExec.OutputMode.github({
                    repoUrl: `https://github.com/${value.owner}/${value.repo}`,
                    version: outputVersion,
                    publishInfo: getGithubPublishConfig(value.publishInfo),
                    installationToken: undefined // Don't attempt to clone the repository when generating locally.
                }),
                path: outputDirectory,
                publishingMetadata: generatorInvocation.publishMetadata
            };
            if (absolutePathToSnippet !== undefined) {
                outputConfig.snippetFilepath = snippetPath;
            }
            if (absolutePathToSnippetTemplates !== undefined) {
                outputConfig.snippetTemplateFilepath = snippetTemplatePath;
            }
            return outputConfig;
        },
        githubV2: (value) => {
            const repoUrl = value._visit({
                commitAndRelease: (value) => `https://github.com/${value.owner}/${value.repo}`,
                push: (value) => `https://github.com/${value.owner}/${value.repo}`,
                pullRequest: (value) => `https://github.com/${value.owner}/${value.repo}`,
                _other: () => {
                    throw new Error("Encountered unknown github mode");
                }
            });
            const outputConfig: FernGeneratorExec.GeneratorOutputConfig = {
                mode: FernGeneratorExec.OutputMode.github({
                    repoUrl,
                    version: outputVersion,
                    publishInfo: getGithubPublishConfig(value.publishInfo)
                }),
                path: outputDirectory,
                publishingMetadata: generatorInvocation.publishMetadata
            };
            if (absolutePathToSnippet !== undefined) {
                outputConfig.snippetFilepath = snippetPath;
            }
            if (absolutePathToSnippetTemplates !== undefined) {
                outputConfig.snippetTemplateFilepath = snippetTemplatePath;
            }
            return outputConfig;
        },
        _other: () => {
            throw new Error("Output type did not match any of the types supported by Fern");
        }
    });
    return {
        irFilepath: irPath,
        output,
        publish: undefined,
        customConfig: customConfig,
        workspaceName,
        organization,
        environment: FernGeneratorExec.GeneratorEnvironment.local(),
        dryRun: false,
        whitelabel: false,
        writeUnitTests,
        generateOauthClients,
        generatePaginatedClients,
        license: licenseInfo
    };
}

function newDummyPublishOutputConfig(
    version: string,
    multipleOutputMode: PublishOutputMode | PublishOutputModeV2,
    generatorInvocation: GeneratorInvocation,
    paths: {
        outputDirectory: AbsoluteFilePath;
    }
): FernGeneratorExec.GeneratorOutputConfig {
    const { outputDirectory } = paths;
    let outputMode:
        | NpmOutput
        | MavenOutput
        | PypiOutput
        | RubyGemsOutput
        | PostmanOutput
        | NugetOutput
        | CratesOutput
        | undefined;
    if ("registryOverrides" in multipleOutputMode) {
        outputMode = multipleOutputMode.registryOverrides.maven ?? multipleOutputMode.registryOverrides.npm;
    } else if (outputMode != null) {
        outputMode = multipleOutputMode._visit<
            | NpmOutput
            | MavenOutput
            | PypiOutput
            | RubyGemsOutput
            | PostmanOutput
            | NugetOutput
            | CratesOutput
            | undefined
        >({
            mavenOverride: (value) => value,
            npmOverride: (value) => value,
            pypiOverride: (value) => value,
            rubyGemsOverride: (value) => value,
            postman: (value) => value,
            nugetOverride: (value) => value,
            cratesOverride: (value) => value,
            _other: () => undefined
        });
    }

    let repoUrl = "";
    if (generatorInvocation.raw?.github != null) {
        if (isGithubSelfhosted(generatorInvocation.raw.github)) {
            repoUrl = generatorInvocation.raw.github.uri;
        } else {
            repoUrl = generatorInvocation.raw?.github.repository;
        }
    }

    return {
        mode: FernGeneratorExec.OutputMode.github({
            repoUrl,
            version
        }),
        path: outputDirectory
    };
}
