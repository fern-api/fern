import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, dirname, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { GeneratorMetadata, PublishingMetadata, PypiMetadata } from "@fern-fern/fiddle-sdk/api";
import { readFile } from "fs/promises";
import path from "path";
import {
    APIDefinition,
    APIDefinitionLocation,
    GenerationLanguage,
    GeneratorGroup,
    GeneratorInvocation,
    GeneratorsConfiguration
} from "./GeneratorsConfiguration";
import { GeneratorGroupSchema } from "./schemas/GeneratorGroupSchema";
import { GeneratorInvocationSchema } from "./schemas/GeneratorInvocationSchema";
import { GeneratorMetadataSchema } from "./schemas/GeneratorMetadataSchema";
import { GeneratorOutputSchema } from "./schemas/GeneratorOutputSchema";
import {
    API_ORIGIN_LOCATION_KEY,
    API_SETTINGS_KEY,
    ASYNC_API_LOCATION_KEY,
    GeneratorsConfigurationSchema,
    OPENAPI_LOCATION_KEY,
    OPENAPI_OVERRIDES_LOCATION_KEY
} from "./schemas/GeneratorsConfigurationSchema";
import { GithubLicenseSchema } from "./schemas/GithubLicenseSchema";
import { MavenOutputLocationSchema } from "./schemas/MavenOutputLocationSchema";
import { PypiGeneratorMetadataSchema } from "./schemas/PypiGeneratorMetadataSchema";

export async function convertGeneratorsConfiguration({
    absolutePathToGeneratorsConfiguration,
    rawGeneratorsConfiguration
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    rawGeneratorsConfiguration: GeneratorsConfigurationSchema;
}): Promise<GeneratorsConfiguration> {
    const maybeTopLevelMetadata = getGeneratorMetadata(rawGeneratorsConfiguration.metadata);
    return {
        absolutePathToConfiguration: absolutePathToGeneratorsConfiguration,
        api: await parseAPIConfiguration(rawGeneratorsConfiguration),
        rawConfiguration: rawGeneratorsConfiguration,
        defaultGroup: rawGeneratorsConfiguration["default-group"],
        groups:
            rawGeneratorsConfiguration.groups != null
                ? await Promise.all(
                      Object.entries(rawGeneratorsConfiguration.groups).map(([groupName, group]) =>
                          convertGroup({
                              absolutePathToGeneratorsConfiguration,
                              groupName,
                              group
                          })
                      )
                  )
                : [],
        whitelabel:
            rawGeneratorsConfiguration.whitelabel != null && rawGeneratorsConfiguration.whitelabel.github != null
                ? {
                      github: rawGeneratorsConfiguration.whitelabel.github
                  }
                : undefined
    };
}

async function parseAPIConfiguration(
    rawGeneratorsConfiguration: GeneratorsConfigurationSchema
): Promise<APIDefinition> {
    const apiConfiguration = rawGeneratorsConfiguration.api;
    const apiDefinitions: APIDefinitionLocation[] = [];
    if (apiConfiguration != null) {
        if (typeof apiConfiguration === "string") {
            apiDefinitions.push({
                path: apiConfiguration,
                origin: undefined,
                overrides: undefined,
                audiences: [],
                shouldUseTitleAsName: undefined
            });
        } else if (Array.isArray(apiConfiguration)) {
            for (const definition of apiConfiguration) {
                if (typeof definition === "string") {
                    apiDefinitions.push({
                        path: definition,
                        origin: undefined,
                        overrides: undefined,
                        audiences: [],
                        shouldUseTitleAsName: undefined
                    });
                } else {
                    apiDefinitions.push({
                        path: definition.path,
                        origin: definition.origin,
                        overrides: definition.overrides,
                        audiences: definition.audiences,
                        shouldUseTitleAsName: definition.settings?.["use-title"]
                    });
                }
            }
        } else {
            apiDefinitions.push({
                path: apiConfiguration.path,
                origin: apiConfiguration.origin,
                overrides: apiConfiguration.overrides,
                audiences: apiConfiguration.audiences,
                shouldUseTitleAsName: apiConfiguration.settings?.["use-title"]
            });
        }
    } else {
        const openapi = rawGeneratorsConfiguration[OPENAPI_LOCATION_KEY];
        const apiOrigin = rawGeneratorsConfiguration[API_ORIGIN_LOCATION_KEY];
        const openapiOverrides = rawGeneratorsConfiguration[OPENAPI_OVERRIDES_LOCATION_KEY];
        const asyncapi = rawGeneratorsConfiguration[ASYNC_API_LOCATION_KEY];
        const settings = rawGeneratorsConfiguration[API_SETTINGS_KEY];

        if (openapi != null && typeof openapi === "string") {
            apiDefinitions.push({
                path: openapi,
                origin: apiOrigin,
                overrides: openapiOverrides,
                audiences: [],
                shouldUseTitleAsName: settings?.["use-title"]
            });
        } else if (openapi != null) {
            apiDefinitions.push({
                path: openapi.path,
                origin: openapi.origin,
                overrides: openapi.overrides,
                audiences: [],
                shouldUseTitleAsName: openapi.settings?.["use-title"]
            });
        }

        if (asyncapi != null) {
            apiDefinitions.push({
                path: asyncapi,
                origin: apiOrigin,
                overrides: undefined,
                audiences: [],
                shouldUseTitleAsName: settings?.["use-title"]
            });
        }
    }

    return {
        type: "singleNamespace",
        definitions: apiDefinitions
    };
}

async function convertGroup({
    absolutePathToGeneratorsConfiguration,
    groupName,
    group,
    maybeTopLevelMetadata
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    groupName: string;
    group: GeneratorGroupSchema;
    maybeTopLevelMetadata: GeneratorMetadata | undefined;
}): Promise<GeneratorGroup> {
    const groupLevelMetadata = getGeneratorMetadata(group.metadata);
    const mergedMetadata = mergeGeneratorMetadata(maybeTopLevelMetadata, groupLevelMetadata);
    return {
        groupName,
        audiences: group.audiences == null ? { type: "all" } : { type: "select", audiences: group.audiences },
        generators: await Promise.all(
            group.generators.map((generator) =>
                convertGenerator({ absolutePathToGeneratorsConfiguration, generator, mergedMetadata })
            )
        )
    };
}

function mergeGeneratorMetadata(
    preceedingMetadata: GeneratorMetadata | undefined,
    priorityMetadata: GeneratorMetadata | undefined
): GeneratorMetadata | undefined {
    if (preceedingMetadata == null || priorityMetadata == null) {
        return priorityMetadata ?? priorityMetadata;
    } else if (preceedingMetadata.description == null && preceedingMetadata.authors == null) {
        return undefined;
    }

    return {
        description: priorityMetadata.description ?? preceedingMetadata.description,
        authors: priorityMetadata.authors ?? preceedingMetadata.authors
    };
}

async function convertGenerator({
    absolutePathToGeneratorsConfiguration,
    generator,
    mergedMetadata
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    generator: GeneratorInvocationSchema;
    mergedMetadata: GeneratorMetadata | undefined;
}): Promise<GeneratorInvocation> {
    return {
        name: generator.name,
        version: generator.version,
        config: generator.config,
        outputMode: await convertOutputMode({ absolutePathToGeneratorsConfiguration, generator, mergedMetadata }),
        smartCasing: generator["smart-casing"] ?? false,
        disableExamples: generator["disable-examples"] ?? false,
        absolutePathToLocalOutput:
            generator.output?.location === "local-file-system"
                ? resolve(dirname(absolutePathToGeneratorsConfiguration), generator.output.path)
                : undefined,
        absolutePathToLocalSnippets:
            generator.snippets?.path != null
                ? resolve(dirname(absolutePathToGeneratorsConfiguration), generator.snippets.path)
                : undefined,
        language: getLanguageFromGeneratorName(generator.name),
        irVersionOverride: generator["ir-version"] ?? undefined,
        publishMetadata: getPublishMetadata({ generatorInvocation: generator })
    };
}

function getPublishMetadata({
    generatorInvocation
}: {
    generatorInvocation: GeneratorInvocationSchema;
}): PublishingMetadata | undefined {
    const publishMetadata = generatorInvocation["publish-metadata"];
    if (publishMetadata != null) {
        return {
            packageDescription: publishMetadata["package-description"],
            publisherEmail: publishMetadata.email,
            publisherName: publishMetadata.author,
            referenceUrl: publishMetadata["reference-url"]
        };
    } else if (generatorInvocation.metadata != null) {
        return {
            packageDescription: generatorInvocation.metadata["package-description"],
            publisherEmail: generatorInvocation.metadata.email,
            publisherName: generatorInvocation.metadata.author,
            referenceUrl: generatorInvocation.metadata["reference-url"]
        };
    }
    return undefined;
}

async function convertOutputMode({
    absolutePathToGeneratorsConfiguration,
    generator,
    mergedMetadata
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    generator: GeneratorInvocationSchema;
    mergedMetadata: GeneratorMetadata | undefined;
}): Promise<FernFiddle.OutputMode> {
    let maybePyPiMetadata: PypiMetadata | undefined;
    if (generator.output != null && generator.output.location === "pypi") {
        maybePyPiMetadata = getPyPiMetadata(generator.output?.metadata);
        const generatorSpecificMetadata = {
            description: maybePyPiMetadata?.description,
            authors: maybePyPiMetadata?.authors
        };
        const finalMergedMetadata = mergeGeneratorMetadata(mergedMetadata, generatorSpecificMetadata);

        maybePyPiMetadata = { ...maybePyPiMetadata, ...finalMergedMetadata };
    }
    const downloadSnippets = generator.snippets != null && generator.snippets.path !== "";
    if (generator.github != null) {
        const indexOfFirstSlash = generator.github.repository.indexOf("/");
        const owner = generator.github.repository.slice(0, indexOfFirstSlash);
        const repo = generator.github.repository.slice(indexOfFirstSlash + 1);
        const publishInfo = generator.output != null ? getGithubPublishInfo(generator.output) : undefined;
        const licenseSchema = getGithubLicenseSchema(generator);
        const license =
            licenseSchema != null
                ? await getGithubLicense({
                      absolutePathToGeneratorsConfiguration,
                      githubLicense: licenseSchema
                  })
                : undefined;
        const mode = generator.github.mode ?? "release";
        switch (mode) {
            case "commit":
            case "release":
                return FernFiddle.OutputMode.githubV2(
                    FernFiddle.GithubOutputModeV2.commitAndRelease({
                        owner,
                        repo,
                        license,
                        publishInfo,
                        downloadSnippets
                    })
                );
            case "pull-request":
                return FernFiddle.OutputMode.githubV2(
                    FernFiddle.GithubOutputModeV2.pullRequest({
                        owner,
                        repo,
                        license,
                        publishInfo,
                        downloadSnippets
                    })
                );
            case "push":
                return FernFiddle.OutputMode.githubV2(
                    FernFiddle.GithubOutputModeV2.push({
                        owner,
                        repo,
                        branch: generator.github.mode === "push" ? generator.github.branch : undefined,
                        license,
                        publishInfo,
                        downloadSnippets
                    })
                );
            default:
                assertNever(mode);
        }
    }
    if (generator.output == null) {
        return FernFiddle.remoteGen.OutputMode.publish({ registryOverrides: {} });
    }
    switch (generator.output.location) {
        case "local-file-system":
            return FernFiddle.OutputMode.downloadFiles({
                downloadSnippets
            });
        case "npm":
            return FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.npmOverride({
                    registryUrl: generator.output.url ?? "https://registry.npmjs.org",
                    packageName: generator.output["package-name"],
                    token: generator.output.token ?? "",
                    downloadSnippets
                })
            );
        case "maven": {
            return FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.mavenOverride({
                    registryUrl: getMavenRegistryUrl(generator.output),
                    username: generator.output.username ?? "",
                    password: generator.output.password ?? "",
                    coordinate: generator.output.coordinate,
                    signature:
                        generator.output.signature != null
                            ? {
                                  keyId: generator.output.signature.keyId,
                                  secretKey: generator.output.signature.secretKey,
                                  password: generator.output.signature.password
                              }
                            : undefined,
                    downloadSnippets
                })
            );
        }
        case "postman":
            return FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.postman({
                    apiKey: generator.output["api-key"],
                    workspaceId: generator.output["workspace-id"]
                })
            );
        case "pypi":
            return FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.pypiOverride({
                    registryUrl: generator.output.url ?? "https://upload.pypi.org/legacy/",
                    username: generator.output.token != null ? "__token__" : generator.output.password ?? "",
                    password: generator.output.token ?? generator.output.password ?? "",
                    coordinate: generator.output["package-name"],
                    downloadSnippets,
                    pypiMetadata: maybePyPiMetadata
                })
            );
        case "nuget":
            return FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.nugetOverride({
                    registryUrl: generator.output.url ?? "https://nuget.org/",
                    packageName: generator.output["package-name"],
                    apiKey: generator.output["api-key"] ?? "",
                    downloadSnippets
                })
            );
        case "rubygems":
            return FernFiddle.OutputMode.publishV2(
                FernFiddle.remoteGen.PublishOutputModeV2.rubyGemsOverride({
                    registryUrl: generator.output.url ?? "https://rubygems.org/",
                    packageName: generator.output["package-name"],
                    apiKey: generator.output["api-key"] ?? "",
                    downloadSnippets
                })
            );
        default:
            assertNever(generator.output);
    }
}

async function getGithubLicense({
    absolutePathToGeneratorsConfiguration,
    githubLicense
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    githubLicense: GithubLicenseSchema;
}): Promise<FernFiddle.GithubLicense> {
    if (typeof githubLicense === "string") {
        switch (githubLicense) {
            case "MIT":
                return FernFiddle.GithubLicense.basic({
                    id: FernFiddle.GithubLicenseId.Mit
                });
            case "Apache-2.0":
                return FernFiddle.GithubLicense.basic({
                    id: FernFiddle.GithubLicenseId.Apache2
                });
            default:
                assertNever(githubLicense);
        }
    }
    const absolutePathToLicense = join(
        AbsoluteFilePath.of(path.dirname(absolutePathToGeneratorsConfiguration)),
        RelativeFilePath.of(githubLicense.custom)
    );
    const licenseContent = await readFile(absolutePathToLicense);
    return FernFiddle.GithubLicense.custom({
        contents: licenseContent.toString()
    });
}

function getGithubPublishInfo(output: GeneratorOutputSchema): FernFiddle.GithubPublishInfo {
    switch (output.location) {
        case "local-file-system":
            throw new Error("Cannot use local-file-system with github publishing");
        case "npm":
            return FernFiddle.GithubPublishInfo.npm({
                registryUrl: output.url ?? "https://registry.npmjs.org",
                packageName: output["package-name"],
                token: output.token
            });
        case "maven":
            return FernFiddle.GithubPublishInfo.maven({
                registryUrl: getMavenRegistryUrl(output),
                coordinate: output.coordinate,
                credentials:
                    output.username != null && output.password != null
                        ? {
                              username: output.username,
                              password: output.password
                          }
                        : undefined,
                signature:
                    output.signature != null
                        ? {
                              keyId: output.signature.keyId,
                              password: output.signature.password,
                              secretKey: output.signature.secretKey
                          }
                        : undefined
            });
        case "postman":
            return FernFiddle.GithubPublishInfo.postman({
                apiKey: output["api-key"],
                workspaceId: output["workspace-id"]
            });
        case "pypi":
            return FernFiddle.GithubPublishInfo.pypi({
                registryUrl: output.url ?? "https://upload.pypi.org/legacy/",
                packageName: output["package-name"],
                credentials:
                    output.token != null
                        ? {
                              username: "__token__",
                              password: output.token
                          }
                        : {
                              username: output.username ?? "",
                              password: output.password ?? ""
                          }
            });
        case "nuget":
            return FernFiddle.GithubPublishInfo.nuget({
                registryUrl: output.url ?? "https://nuget.org/",
                packageName: output["package-name"],
                apiKey: output["api-key"]
            });
        case "rubygems":
            return FernFiddle.GithubPublishInfo.rubygems({
                registryUrl: output.url ?? "https://rubygems.org/",
                packageName: output["package-name"],
                apiKey: output["api-key"]
            });
        default:
            assertNever(output);
    }
}

function getLanguageFromGeneratorName(generatorName: string) {
    if (generatorName.includes("typescript")) {
        return GenerationLanguage.TYPESCRIPT;
    }
    if (generatorName.includes("java") || generatorName.includes("spring")) {
        return GenerationLanguage.JAVA;
    }
    if (generatorName.includes("python") || generatorName.includes("fastapi") || generatorName.includes("pydantic")) {
        return GenerationLanguage.PYTHON;
    }
    if (generatorName.includes("go")) {
        return GenerationLanguage.GO;
    }
    if (generatorName.includes("ruby")) {
        return GenerationLanguage.RUBY;
    }
    if (generatorName.includes("csharp")) {
        return GenerationLanguage.CSHARP;
    }
    return undefined;
}

function getMavenRegistryUrl(maven: MavenOutputLocationSchema) {
    if (maven.url != null) {
        return maven.url;
    }
    return maven.signature != null
        ? "https://oss.sonatype.org/service/local/staging/deploy/maven2/"
        : "https://s01.oss.sonatype.org/content/repositories/releases/";
}

function getGithubLicenseSchema(generator: GeneratorInvocationSchema): GithubLicenseSchema | undefined {
    if (generator["publish-metadata"]?.license != null) {
        return generator["publish-metadata"].license;
    } else if (generator.metadata?.license != null) {
        return generator.metadata.license;
    }
    return generator.github?.license;
}

function getGeneratorMetadata(metadata: GeneratorMetadataSchema | undefined): GeneratorMetadata | undefined {
    return metadata != null
        ? {
              description: metadata.description,
              authors: metadata.authors?.map((author) => ({ name: author.name, email: author.email }))
          }
        : undefined;
}

function getPyPiMetadata(metadata: PypiGeneratorMetadataSchema | undefined): PypiMetadata | undefined {
    return metadata != null
        ? {
              description: metadata.description,
              authors: metadata.authors?.map((author) => ({ name: author.name, email: author.email })),
              keywords: metadata.keywords,
              documentationLink: metadata.documentationLink,
              homepageLink: metadata.homepageLink
          }
        : undefined;
}
