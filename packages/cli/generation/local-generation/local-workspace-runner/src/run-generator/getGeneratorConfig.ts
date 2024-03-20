import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import {
    GithubPublishInfo as FiddleGithubPublishInfo,
    MavenOutput,
    NpmOutput,
    PostmanOutput,
    PublishOutputMode,
    PublishOutputModeV2,
    PypiOutput,
    RubyGemsOutput
} from "@fern-fern/fiddle-sdk/api";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { EnvironmentVariable } from "@fern-fern/generator-exec-sdk/api";
import { DOCKER_CODEGEN_OUTPUT_DIRECTORY, DOCKER_PATH_TO_IR, DOCKER_PATH_TO_SNIPPET } from "./constants";

const DEFAULT_OUTPUT_VERSION = "0.0.1";

export declare namespace getGeneratorConfig {
    export interface Args {
        workspaceName: string;
        organization: string;
        outputVersion?: string | undefined;
        customConfig: unknown;
        generatorInvocation: generatorsYml.GeneratorInvocation;
        absolutePathToSnippet: AbsoluteFilePath | undefined;
        writeUnitTests: boolean;
    }

    export interface Return {
        config: FernGeneratorExec.GeneratorConfig;
        binds: string[];
    }
}

function getGithubPublishConfig(
    githubPublishInfo: FiddleGithubPublishInfo | undefined
): FernGeneratorExec.GithubPublishInfo | undefined {
    return githubPublishInfo != null
        ? FiddleGithubPublishInfo._visit<FernGeneratorExec.GithubPublishInfo | undefined>(githubPublishInfo, {
              npm: (value) =>
                  FernGeneratorExec.GithubPublishInfo.npm({
                      registryUrl: value.registryUrl,
                      packageName: value.packageName,
                      tokenEnvironmentVariable: EnvironmentVariable(value.token ?? "")
                  }),
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
                      usernameEnvironmentVariable: EnvironmentVariable(value.credentials?.username ?? ""),
                      passwordEnvironmentVariable: EnvironmentVariable(value.credentials?.password ?? "")
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
    writeUnitTests
}: getGeneratorConfig.Args): getGeneratorConfig.Return {
    const binds: string[] = [];
    const output = generatorInvocation.outputMode._visit<FernGeneratorExec.GeneratorOutputConfig>({
        publish: (value) => {
            return newDummyPublishOutputConfig(outputVersion, value);
        },
        publishV2: (value) => {
            return newDummyPublishOutputConfig(outputVersion, value);
        },
        downloadFiles: () => {
            return {
                mode: FernGeneratorExec.OutputMode.downloadFiles(),
                path: DOCKER_CODEGEN_OUTPUT_DIRECTORY
            };
        },
        github: (value) => {
            const outputConfig: FernGeneratorExec.GeneratorOutputConfig = {
                mode: FernGeneratorExec.OutputMode.github({
                    repoUrl: `https://github.com/${value.owner}/${value.repo}`,
                    version: outputVersion,
                    publishInfo: getGithubPublishConfig(value.publishInfo)
                }),
                path: DOCKER_CODEGEN_OUTPUT_DIRECTORY
            };
            if (absolutePathToSnippet !== undefined) {
                binds.push(`${absolutePathToSnippet}:${DOCKER_PATH_TO_SNIPPET}`);
                outputConfig.snippetFilepath = DOCKER_PATH_TO_SNIPPET;
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
                path: DOCKER_CODEGEN_OUTPUT_DIRECTORY
            };
            if (absolutePathToSnippet !== undefined) {
                binds.push(`${absolutePathToSnippet}:${DOCKER_PATH_TO_SNIPPET}`);
                outputConfig.snippetFilepath = DOCKER_PATH_TO_SNIPPET;
            }
            return outputConfig;
        },
        _other: () => {
            throw new Error("Output type did not match any of the types supported by Fern");
        }
    });
    return {
        binds,
        config: {
            irFilepath: DOCKER_PATH_TO_IR,
            output,
            publish: undefined,
            customConfig,
            workspaceName,
            organization,
            environment: FernGeneratorExec.GeneratorEnvironment.local(),
            dryRun: false,
            whitelabel: false,
            writeUnitTests
        }
    };
}

function newDummyPublishOutputConfig(
    version: string,
    multipleOutputMode: PublishOutputMode | PublishOutputModeV2
): FernGeneratorExec.GeneratorOutputConfig {
    let outputMode: NpmOutput | MavenOutput | PypiOutput | RubyGemsOutput | PostmanOutput | undefined;
    if ("registryOverrides" in multipleOutputMode) {
        outputMode = multipleOutputMode.registryOverrides.maven ?? multipleOutputMode.registryOverrides.npm;
    } else if (outputMode != null) {
        outputMode = multipleOutputMode._visit<
            NpmOutput | MavenOutput | PypiOutput | RubyGemsOutput | PostmanOutput | undefined
        >({
            mavenOverride: (value) => value,
            npmOverride: (value) => value,
            pypiOverride: (value) => value,
            rubyGemsOverride: (value) => value,
            postman: (value) => value,
            _other: () => undefined
        });
    }

    return {
        mode: FernGeneratorExec.OutputMode.publish({
            registries: {
                maven: {
                    group: "",
                    password: (outputMode as MavenOutput)?.password ?? "",
                    registryUrl: (outputMode as MavenOutput)?.registryUrl ?? "",
                    username: (outputMode as MavenOutput)?.username ?? ""
                },
                npm: {
                    registryUrl: (outputMode as NpmOutput)?.registryUrl ?? "",
                    scope: "",
                    token: (outputMode as NpmOutput)?.token ?? ""
                }
            },
            publishTarget: undefined,
            registriesV2: {
                maven: {
                    password: (outputMode as MavenOutput)?.password ?? "",
                    registryUrl: (outputMode as MavenOutput)?.registryUrl ?? "",
                    username: (outputMode as MavenOutput)?.username ?? "",
                    coordinate: (outputMode as MavenOutput)?.coordinate ?? "",
                    signature: (outputMode as MavenOutput)?.signature
                },
                npm: {
                    registryUrl: (outputMode as NpmOutput)?.registryUrl ?? "",
                    token: (outputMode as NpmOutput)?.token ?? "",
                    packageName: (outputMode as NpmOutput)?.packageName ?? ""
                },
                pypi: {
                    packageName: (outputMode as PypiOutput)?.coordinate ?? "",
                    password: (outputMode as PypiOutput)?.password ?? "",
                    registryUrl: (outputMode as PypiOutput)?.registryUrl ?? "",
                    username: (outputMode as PypiOutput)?.username ?? ""
                },
                rubygems: {
                    registryUrl: (outputMode as RubyGemsOutput)?.registryUrl ?? "",
                    apiKey: (outputMode as RubyGemsOutput)?.apiKey ?? "",
                    packageName: (outputMode as RubyGemsOutput)?.packageName ?? ""
                }
            },
            version
        }),
        path: DOCKER_CODEGEN_OUTPUT_DIRECTORY
    };
}
