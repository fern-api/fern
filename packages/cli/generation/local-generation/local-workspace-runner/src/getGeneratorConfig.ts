import { GeneratorInvocation, generatorsYml } from "@fern-api/configuration";
import { isGithubSelfhosted } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import * as fs from "fs";
import * as path from "path";

import {
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

const DEFAULT_OUTPUT_VERSION = "0.0.1";

function extractLicenseInfo(generatorInvocation: GeneratorInvocation): FernGeneratorExec.LicenseConfig | undefined {
    // Check if there's a license field in github config
    if (generatorInvocation.raw?.github != null && typeof generatorInvocation.raw.github === 'object' && 'license' in generatorInvocation.raw.github) {
        const githubConfig = generatorInvocation.raw.github as any;
        
        if (githubConfig.license != null) {
            // Handle standard licenses
            if (typeof githubConfig.license === 'string') {
                if (githubConfig.license === 'MIT' || githubConfig.license === 'Apache-2.0') {
                    return FernGeneratorExec.LicenseConfig.basic({
                        id: githubConfig.license === 'MIT' ? FernGeneratorExec.LicenseId.Mit : FernGeneratorExec.LicenseId.Apache2
                    });
                }
            }
            // Handle custom license
            else if (typeof githubConfig.license === 'object' && 'custom' in githubConfig.license) {
                const licensePath = githubConfig.license.custom;
                
                try {
                    const absoluteLicensePath = path.isAbsolute(licensePath) ? licensePath : path.resolve(process.cwd(), licensePath);
                    
                    const content = fs.readFileSync(absoluteLicensePath, 'utf-8');
                    
                    // Extract the first non-empty line as the license name
                    let firstLine = content.split('\n').find(line => line.trim().length > 0) || 'Custom License';
                    
                    // Remove leading # if present (markdown headers)
                    firstLine = firstLine.trim().replace(/^#+\s*/, '');
                    
                    // Remove trailing punctuation
                    firstLine = firstLine.replace(/[.:;]+$/, '').trim();
                    
                    // For now, return the custom license with the filename
                    // In the future, we may want to extend CustomLicense to include a name field
                    return FernGeneratorExec.LicenseConfig.custom({
                        filename: path.basename(licensePath)
                    });
                } catch (error) {
                    // Return custom license with just the filename
                    return FernGeneratorExec.LicenseConfig.custom({
                        filename: path.basename(licensePath)
                    });
                }
            }
        }
    }
    
    // Check raw configuration for metadata license as a fallback
    if (generatorInvocation.raw?.metadata?.license != null) {
        const license = generatorInvocation.raw.metadata.license;
        if (typeof license === 'string') {
            if (license === 'MIT' || license === 'Apache-2.0') {
                return FernGeneratorExec.LicenseConfig.basic({
                    id: license === 'MIT' ? FernGeneratorExec.LicenseId.Mit : FernGeneratorExec.LicenseId.Apache2
                });
            }
        } else if (typeof license === 'object' && 'custom' in license) {
            return FernGeneratorExec.LicenseConfig.custom({
                filename: path.basename(license.custom)
            });
        }
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
              nuget: (value) =>
                  FernGeneratorExec.GithubPublishInfo.nuget({
                      registryUrl: value.registryUrl,
                      packageName: value.packageName,
                      apiKeyEnvironmentVariable: EnvironmentVariable(value.apiKey ?? "")
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
    writeUnitTests,
    generateOauthClients,
    generatePaginatedClients,
    paths
}: getGeneratorConfig.Args): FernGeneratorExec.GeneratorConfig {
    // Extract license name and add it to customConfig if we have a custom license
    let enhancedCustomConfig = customConfig;
    const licenseInfo = extractLicenseInfo(generatorInvocation);
    
    if (licenseInfo != null && licenseInfo.type === 'custom') {
        // Extract the license name from the file
        let licenseName: string | undefined;
        if (generatorInvocation.raw?.github != null && typeof generatorInvocation.raw.github === 'object' && 'license' in generatorInvocation.raw.github) {
            const githubConfig = generatorInvocation.raw.github as any;
            if (githubConfig.license != null && typeof githubConfig.license === 'object' && 'custom' in githubConfig.license) {
                const licensePath = githubConfig.license.custom;
                
                try {
                    const absoluteLicensePath = path.isAbsolute(licensePath) ? licensePath : path.resolve(process.cwd(), licensePath);
                    const content = fs.readFileSync(absoluteLicensePath, 'utf-8');
                    
                    // Extract the first non-empty line as the license name
                    let firstLine = content.split('\n').find(line => line.trim().length > 0) || 'Custom License';
                    
                    // Remove leading # if present (markdown headers)
                    firstLine = firstLine.trim().replace(/^#+\s*/, '');
                    
                    // Remove trailing punctuation
                    firstLine = firstLine.replace(/[.:;]+$/, '').trim();
                    
                    licenseName = firstLine;
                } catch (error) {
                    // Silently fall back to no license name
                }
            }
        }
        
        // Add the license name to custom config
        if (licenseName != null) {
            enhancedCustomConfig = {
                ...(customConfig as any),
                _fernLicenseName: licenseName
            };
        }
    }
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
        customConfig: enhancedCustomConfig,
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
    let outputMode: NpmOutput | MavenOutput | PypiOutput | RubyGemsOutput | PostmanOutput | NugetOutput | undefined;
    if ("registryOverrides" in multipleOutputMode) {
        outputMode = multipleOutputMode.registryOverrides.maven ?? multipleOutputMode.registryOverrides.npm;
    } else if (outputMode != null) {
        outputMode = multipleOutputMode._visit<
            NpmOutput | MavenOutput | PypiOutput | RubyGemsOutput | PostmanOutput | NugetOutput | undefined
        >({
            mavenOverride: (value) => value,
            npmOverride: (value) => value,
            pypiOverride: (value) => value,
            rubyGemsOverride: (value) => value,
            postman: (value) => value,
            nugetOverride: (value) => value,
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
