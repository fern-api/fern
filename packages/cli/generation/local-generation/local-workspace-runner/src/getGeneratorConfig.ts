import { GeneratorInvocation, generatorsYml } from "@fern-api/configuration";
import { isGithubSelfhosted } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { parseRepository } from "@fern-api/github";
import { CliError } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
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
        whiteLabel?: boolean;
        /**
         * When true, publishV2/publish output modes will create a real `publish` output config
         * so the generator actually publishes to the registry. When false (default), these modes
         * are converted to a dummy github config to prevent accidental publishing during
         * `fern generate --local`.
         */
        publishToRegistry?: boolean;
        paths: {
            snippetPath: AbsoluteFilePath | undefined;
            snippetTemplatePath: AbsoluteFilePath | undefined;
            irPath: AbsoluteFilePath;
            outputDirectory: AbsoluteFilePath;
        };
    }
}

function getGithubPublishConfig(
    githubPublishInfo: FernFiddle.GithubPublishInfo | undefined
): FernGeneratorExec.GithubPublishInfo | undefined {
    return githubPublishInfo != null
        ? FernFiddle.GithubPublishInfo._visit<FernGeneratorExec.GithubPublishInfo | undefined>(githubPublishInfo, {
              npm: (value) => {
                  const token = (value.token ?? "").trim();
                  const useOidc = token === "<USE_OIDC>" || token === "OIDC";
                  const hasToken = token !== "";
                  return FernGeneratorExec.GithubPublishInfo.npm({
                      registryUrl: value.registryUrl,
                      packageName: value.packageName,
                      tokenEnvironmentVariable: EnvironmentVariable(
                          useOidc
                              ? "<USE_OIDC>"
                              : token.startsWith("${") && token.endsWith("}")
                                ? token.slice(2, -1).trim()
                                : ""
                      ),
                      shouldGeneratePublishWorkflow: useOidc || hasToken
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
    whiteLabel,
    publishToRegistry,
    paths
}: getGeneratorConfig.Args): FernGeneratorExec.GeneratorConfig {
    const licenseInfo = extractLicenseInfo(generatorInvocation, absolutePathToFernConfig);
    const { snippetPath, snippetTemplatePath, irPath, outputDirectory } = paths;
    const output = generatorInvocation.outputMode._visit<FernGeneratorExec.GeneratorOutputConfig>({
        publish: (value) => {
            if (publishToRegistry === true) {
                const publishTarget = getPublishTargetFromPublishMode(value);
                return {
                    ...newRealPublishOutputConfig(outputVersion, publishTarget, paths),
                    snippetFilepath: snippetPath,
                    publishingMetadata: generatorInvocation.publishMetadata
                };
            }
            return {
                ...newDummyPublishOutputConfig(outputVersion, value, generatorInvocation, paths),
                snippetFilepath: snippetPath,
                publishingMetadata: generatorInvocation.publishMetadata
            };
        },
        publishV2: (value) => {
            if (publishToRegistry === true) {
                const publishTarget = getPublishTargetFromPublishModeV2(value);
                return {
                    ...newRealPublishOutputConfig(outputVersion, publishTarget, paths),
                    snippetFilepath: snippetPath,
                    publishingMetadata: generatorInvocation.publishMetadata
                };
            }
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
                    throw new CliError({
                        message: "Encountered unknown github mode",
                        code: CliError.Code.InternalError
                    });
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
            throw new CliError({
                message: "Output type did not match any of the types supported by Fern",
                code: CliError.Code.InternalError
            });
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
        whitelabel: whiteLabel ?? false,
        writeUnitTests,
        generateOauthClients,
        generatePaginatedClients,
        license: licenseInfo
    };
}

function newDummyPublishOutputConfig(
    version: string,
    multipleOutputMode: FernFiddle.PublishOutputMode | FernFiddle.PublishOutputModeV2,
    generatorInvocation: GeneratorInvocation,
    paths: {
        outputDirectory: AbsoluteFilePath;
    }
): FernGeneratorExec.GeneratorOutputConfig {
    const { outputDirectory } = paths;
    let outputMode:
        | FernFiddle.NpmOutput
        | FernFiddle.MavenOutput
        | FernFiddle.PypiOutput
        | FernFiddle.RubyGemsOutput
        | FernFiddle.PostmanOutput
        | FernFiddle.NugetOutput
        | FernFiddle.CratesOutput
        | undefined;
    if ("registryOverrides" in multipleOutputMode) {
        outputMode = multipleOutputMode.registryOverrides.maven ?? multipleOutputMode.registryOverrides.npm;
    } else if (outputMode != null) {
        outputMode = multipleOutputMode._visit<
            | FernFiddle.NpmOutput
            | FernFiddle.MavenOutput
            | FernFiddle.PypiOutput
            | FernFiddle.RubyGemsOutput
            | FernFiddle.PostmanOutput
            | FernFiddle.NugetOutput
            | FernFiddle.CratesOutput
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
            const parsed = parseRepository(generatorInvocation.raw.github.uri);
            repoUrl = parsed.repoUrl;
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

function newRealPublishOutputConfig(
    version: string,
    publishTarget: FernGeneratorExec.GeneratorPublishTarget | undefined,
    paths: { outputDirectory: AbsoluteFilePath }
): FernGeneratorExec.GeneratorOutputConfig {
    const { outputDirectory } = paths;
    const { registries, registriesV2 } = buildRegistriesFromPublishTarget(publishTarget);
    return {
        mode: FernGeneratorExec.OutputMode.publish({
            registries,
            registriesV2,
            publishTarget,
            version
        }),
        path: outputDirectory
    };
}

/**
 * Populate the deprecated registries/registriesV2 fields from the publishTarget.
 * Some generators (e.g. TypeScript) read registryUrl/token from registriesV2.npm
 * instead of publishTarget, so both must be set.
 */
function buildRegistriesFromPublishTarget(publishTarget: FernGeneratorExec.GeneratorPublishTarget | undefined): {
    registries: FernGeneratorExec.GeneratorRegistriesConfig;
    registriesV2: FernGeneratorExec.GeneratorRegistriesConfigV2;
} {
    const registries: FernGeneratorExec.GeneratorRegistriesConfig = structuredClone(emptyRegistriesConfig);
    const registriesV2: FernGeneratorExec.GeneratorRegistriesConfigV2 = structuredClone(emptyRegistriesConfigV2);

    if (publishTarget == null) {
        return { registries, registriesV2 };
    }

    switch (publishTarget.type) {
        case "npm":
            registries.npm = { registryUrl: publishTarget.registryUrl, token: publishTarget.token, scope: "" };
            registriesV2.npm = {
                registryUrl: publishTarget.registryUrl,
                token: publishTarget.token,
                packageName: publishTarget.packageName
            };
            break;
        case "maven":
            registries.maven = {
                registryUrl: publishTarget.registryUrl,
                username: publishTarget.username,
                password: publishTarget.password,
                group: "",
                signature: publishTarget.signature
            };
            registriesV2.maven = {
                registryUrl: publishTarget.registryUrl,
                username: publishTarget.username,
                password: publishTarget.password,
                coordinate: publishTarget.coordinate,
                signature: publishTarget.signature
            };
            break;
        case "pypi":
            registriesV2.pypi = {
                registryUrl: publishTarget.registryUrl,
                username: publishTarget.username,
                password: publishTarget.password,
                packageName: publishTarget.packageName,
                pypiMetadata: publishTarget.pypiMetadata
            };
            break;
        case "rubygems":
            registriesV2.rubygems = {
                registryUrl: publishTarget.registryUrl,
                apiKey: publishTarget.apiKey,
                packageName: publishTarget.packageName
            };
            break;
        case "nuget":
            registriesV2.nuget = {
                registryUrl: publishTarget.registryUrl,
                apiKey: publishTarget.apiKey,
                packageName: publishTarget.packageName
            };
            break;
        case "crates":
            registriesV2.crates = {
                registryUrl: publishTarget.registryUrl,
                token: publishTarget.token,
                packageName: publishTarget.packageName
            };
            break;
        default:
            break;
    }

    return { registries, registriesV2 };
}

function getPublishTargetFromPublishMode(
    mode: FernFiddle.PublishOutputMode
): FernGeneratorExec.GeneratorPublishTarget | undefined {
    if ("registryOverrides" in mode) {
        const overrides = mode.registryOverrides;
        if (overrides.npm != null) {
            return FernGeneratorExec.GeneratorPublishTarget.npm({
                registryUrl: overrides.npm.registryUrl,
                token: overrides.npm.token,
                packageName: overrides.npm.packageName
            });
        }
        if (overrides.maven != null) {
            return FernGeneratorExec.GeneratorPublishTarget.maven({
                registryUrl: overrides.maven.registryUrl,
                username: overrides.maven.username ?? "",
                password: overrides.maven.password ?? "",
                coordinate: overrides.maven.coordinate ?? "",
                signature: undefined
            });
        }
    }
    return undefined;
}

function getPublishTargetFromPublishModeV2(
    mode: FernFiddle.PublishOutputModeV2
): FernGeneratorExec.GeneratorPublishTarget | undefined {
    return mode._visit<FernGeneratorExec.GeneratorPublishTarget | undefined>({
        npmOverride: (value) =>
            value != null
                ? FernGeneratorExec.GeneratorPublishTarget.npm({
                      registryUrl: value.registryUrl,
                      token: value.token,
                      packageName: value.packageName
                  })
                : undefined,
        mavenOverride: (value) =>
            value != null
                ? FernGeneratorExec.GeneratorPublishTarget.maven({
                      registryUrl: value.registryUrl,
                      username: value.username,
                      password: value.password,
                      coordinate: value.coordinate,
                      signature: value.signature ?? undefined
                  })
                : undefined,
        pypiOverride: (value) =>
            value != null
                ? FernGeneratorExec.GeneratorPublishTarget.pypi({
                      registryUrl: value.registryUrl,
                      username: value.username,
                      password: value.password,
                      packageName: value.coordinate,
                      pypiMetadata: value.pypiMetadata ?? undefined
                  })
                : undefined,
        rubyGemsOverride: (value) =>
            value != null
                ? FernGeneratorExec.GeneratorPublishTarget.rubygems({
                      registryUrl: value.registryUrl,
                      apiKey: value.apiKey,
                      packageName: value.packageName
                  })
                : undefined,
        nugetOverride: (value) =>
            value != null
                ? FernGeneratorExec.GeneratorPublishTarget.nuget({
                      registryUrl: value.registryUrl,
                      apiKey: value.apiKey,
                      packageName: value.packageName
                  })
                : undefined,
        cratesOverride: (value) =>
            value != null
                ? FernGeneratorExec.GeneratorPublishTarget.crates({
                      registryUrl: value.registryUrl,
                      token: value.token,
                      packageName: value.packageName
                  })
                : undefined,
        postman: (value) =>
            FernGeneratorExec.GeneratorPublishTarget.postman({
                apiKey: value.apiKey,
                workspaceId: value.workspaceId
            }),
        _other: () => undefined
    });
}

const emptyRegistriesConfig: FernGeneratorExec.GeneratorRegistriesConfig = {
    maven: { registryUrl: "", username: "", password: "", group: "", signature: undefined },
    npm: { registryUrl: "", token: "", scope: "" }
};

const emptyRegistriesConfigV2: FernGeneratorExec.GeneratorRegistriesConfigV2 = {
    maven: { registryUrl: "", username: "", password: "", coordinate: "", signature: undefined },
    npm: { registryUrl: "", token: "", packageName: "" },
    pypi: { registryUrl: "", username: "", password: "", packageName: "", pypiMetadata: undefined },
    rubygems: { registryUrl: "", apiKey: "", packageName: "" },
    nuget: { registryUrl: "", apiKey: "", packageName: "" },
    crates: { registryUrl: "", token: "", packageName: "" }
};
