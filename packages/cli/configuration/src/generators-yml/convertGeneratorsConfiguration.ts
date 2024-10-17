import { assertNever, isPlainObject } from "@fern-api/core-utils";
import { AbsoluteFilePath, dirname, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { GithubPullRequestReviewer, OutputMetadata, PublishingMetadata, PypiMetadata } from "@fern-fern/fiddle-sdk/api";
import { readFile } from "fs/promises";
import path from "path";
import {
    APIDefinition,
    APIDefinitionLocation,
    APIWideSettings,
    GenerationLanguage,
    GeneratorGroup,
    GeneratorInvocation,
    GeneratorsConfiguration
} from "./GeneratorsConfiguration";
import { isRawProtobufAPIDefinitionSchema } from "./isRawProtobufAPIDefinitionSchema";
import { APIConfigurationSchemaInternal, APIConfigurationV2Schema } from "./schemas/APIConfigurationSchema";
import { GeneratorGroupSchema } from "./schemas/GeneratorGroupSchema";
import { GeneratorInvocationSchema } from "./schemas/GeneratorInvocationSchema";
import { GeneratorOutputSchema } from "./schemas/GeneratorOutputSchema";
import { isApiConfigurationV2Schema, isConjureSchema, isOpenAPISchema } from "./schemas/utils";
import {
    API_ORIGIN_LOCATION_KEY,
    API_SETTINGS_KEY,
    ASYNC_API_LOCATION_KEY,
    GeneratorsConfigurationSchema,
    OPENAPI_LOCATION_KEY,
    OPENAPI_OVERRIDES_LOCATION_KEY
} from "./schemas/GeneratorsConfigurationSchema";
import { GithubLicenseSchema } from "./schemas/GithubLicenseSchema";
import { GithubPullRequestSchema } from "./schemas/GithubPullRequestSchema";
import { MavenOutputLocationSchema } from "./schemas/MavenOutputLocationSchema";
import { OutputMetadataSchema } from "./schemas/OutputMetadataSchema";
import { PypiOutputMetadataSchema } from "./schemas/PypiOutputMetadataSchema";
import { ReadmeSchema } from "./schemas/ReadmeSchema";
import { ReviewersSchema } from "./schemas/ReviewersSchema";
import { visitRawApiAuth } from "@fern-api/fern-definition-schema";

export async function convertGeneratorsConfiguration({
    absolutePathToGeneratorsConfiguration,
    rawGeneratorsConfiguration
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    rawGeneratorsConfiguration: GeneratorsConfigurationSchema;
}): Promise<GeneratorsConfiguration> {
    const maybeTopLevelMetadata = getOutputMetadata(rawGeneratorsConfiguration.metadata);
    const readme = rawGeneratorsConfiguration.readme;
    const parsedApiConfiguration = await parseAPIConfiguration(rawGeneratorsConfiguration);
    const parsedApiWideSettings = await parseAPIWideSettingsConfiguration(rawGeneratorsConfiguration);
    return {
        absolutePathToConfiguration: absolutePathToGeneratorsConfiguration,
        api: parsedApiConfiguration,
        apiWideSettings: parsedApiWideSettings,
        rawConfiguration: rawGeneratorsConfiguration,
        defaultGroup: rawGeneratorsConfiguration["default-group"],
        reviewers: rawGeneratorsConfiguration.reviewers,
        groups:
            rawGeneratorsConfiguration.groups != null
                ? await Promise.all(
                      Object.entries(rawGeneratorsConfiguration.groups).map(([groupName, group]) =>
                          convertGroup({
                              absolutePathToGeneratorsConfiguration,
                              groupName,
                              group,
                              maybeTopLevelMetadata,
                              maybeTopLevelReviewers: rawGeneratorsConfiguration.reviewers,
                              readme
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

async function parseAPIWideSettingsConfiguration(
    rawGeneratorsConfiguration: GeneratorsConfigurationSchema
): Promise<APIWideSettings | undefined> {
    const apiConfiguration = rawGeneratorsConfiguration.api;

    if (apiConfiguration != null && isApiConfigurationV2Schema(apiConfiguration)) {
        return {
            shouldInlineTypes: apiConfiguration.settings?.["inline-types"]
        };
    }
    return undefined;
}

async function parseAPIConfigurationToApiLocations(
    apiConfiguration: APIConfigurationSchemaInternal | undefined,
    rawConfiguration: GeneratorsConfigurationSchema
): Promise<APIDefinitionLocation[]> {
    const apiDefinitions: APIDefinitionLocation[] = [];

    if (apiConfiguration != null) {
        if (typeof apiConfiguration === "string") {
            apiDefinitions.push({
                schema: {
                    type: "oss",
                    path: apiConfiguration
                },
                origin: undefined,
                overrides: undefined,
                audiences: [],
                settings: {
                    shouldUseTitleAsName: undefined,
                    shouldUseUndiscriminatedUnionsWithLiterals: undefined,
                    asyncApiMessageNaming: undefined,
                    shouldUseOptionalAdditionalProperties: undefined,
                    coerceEnumsToLiterals: undefined
                }
            });
        } else if (isRawProtobufAPIDefinitionSchema(apiConfiguration)) {
            apiDefinitions.push({
                schema: {
                    type: "protobuf",
                    root: apiConfiguration.proto.root,
                    target: apiConfiguration.proto.target,
                    localGeneration: apiConfiguration.proto["local-generation"] ?? false
                },
                origin: undefined,
                overrides: apiConfiguration.proto.overrides,
                audiences: [],
                settings: {
                    shouldUseTitleAsName: undefined,
                    shouldUseUndiscriminatedUnionsWithLiterals: undefined,
                    asyncApiMessageNaming: undefined,
                    shouldUseOptionalAdditionalProperties: undefined,
                    coerceEnumsToLiterals: undefined
                }
            });
        } else if (Array.isArray(apiConfiguration)) {
            for (const definition of apiConfiguration) {
                if (typeof definition === "string") {
                    apiDefinitions.push({
                        schema: {
                            type: "oss",
                            path: definition
                        },
                        origin: undefined,
                        overrides: undefined,
                        audiences: [],
                        settings: {
                            shouldUseTitleAsName: undefined,
                            shouldUseUndiscriminatedUnionsWithLiterals: undefined,
                            asyncApiMessageNaming: undefined,
                            shouldUseOptionalAdditionalProperties: undefined,
                            coerceEnumsToLiterals: undefined
                        }
                    });
                } else if (isRawProtobufAPIDefinitionSchema(definition)) {
                    apiDefinitions.push({
                        schema: {
                            type: "protobuf",
                            root: definition.proto.root,
                            target: definition.proto.target,
                            localGeneration: definition.proto["local-generation"] ?? false
                        },
                        origin: undefined,
                        overrides: definition.proto.overrides,
                        audiences: [],
                        settings: {
                            shouldUseTitleAsName: undefined,
                            shouldUseUndiscriminatedUnionsWithLiterals: undefined,
                            asyncApiMessageNaming: undefined,
                            shouldUseOptionalAdditionalProperties: undefined,
                            coerceEnumsToLiterals: undefined
                        }
                    });
                } else {
                    apiDefinitions.push({
                        schema: {
                            type: "oss",
                            path: definition.path
                        },
                        origin: definition.origin,
                        overrides: definition.overrides,
                        audiences: definition.audiences,
                        settings: {
                            shouldUseTitleAsName: definition.settings?.["use-title"],
                            shouldUseUndiscriminatedUnionsWithLiterals: definition.settings?.unions === "v1",
                            asyncApiMessageNaming: definition.settings?.["message-naming"],
                            shouldUseOptionalAdditionalProperties: undefined,
                            coerceEnumsToLiterals: undefined
                        }
                    });
                }
            }
        } else {
            apiDefinitions.push({
                schema: {
                    type: "oss",
                    path: apiConfiguration.path
                },
                origin: apiConfiguration.origin,
                overrides: apiConfiguration.overrides,
                audiences: apiConfiguration.audiences,
                settings: {
                    shouldUseTitleAsName: apiConfiguration.settings?.["use-title"],
                    shouldUseUndiscriminatedUnionsWithLiterals: apiConfiguration.settings?.unions === "v1",
                    asyncApiMessageNaming: apiConfiguration.settings?.["message-naming"],
                    shouldUseOptionalAdditionalProperties: undefined,
                    coerceEnumsToLiterals: undefined
                }
            });
        }
    } else {
        const openapi = rawConfiguration[OPENAPI_LOCATION_KEY];
        const apiOrigin = rawConfiguration[API_ORIGIN_LOCATION_KEY];
        const openapiOverrides = rawConfiguration[OPENAPI_OVERRIDES_LOCATION_KEY];
        const asyncapi = rawConfiguration[ASYNC_API_LOCATION_KEY];
        const settings = rawConfiguration[API_SETTINGS_KEY];
        if (openapi != null && typeof openapi === "string") {
            apiDefinitions.push({
                schema: {
                    type: "oss",
                    path: openapi
                },
                origin: apiOrigin,
                overrides: openapiOverrides,
                audiences: [],
                settings: {
                    shouldUseTitleAsName: settings?.["use-title"],
                    shouldUseUndiscriminatedUnionsWithLiterals: settings?.unions === "v1",
                    asyncApiMessageNaming: undefined,
                    shouldUseOptionalAdditionalProperties: undefined,
                    coerceEnumsToLiterals: undefined
                }
            });
        } else if (openapi != null) {
            apiDefinitions.push({
                schema: {
                    type: "oss",
                    path: openapi.path
                },
                origin: openapi.origin,
                overrides: openapi.overrides,
                audiences: [],
                settings: {
                    shouldUseTitleAsName: openapi.settings?.["use-title"],
                    shouldUseUndiscriminatedUnionsWithLiterals: openapi.settings?.unions === "v1",
                    asyncApiMessageNaming: undefined,
                    shouldUseOptionalAdditionalProperties: undefined,
                    coerceEnumsToLiterals: undefined
                }
            });
        }

        if (asyncapi != null) {
            apiDefinitions.push({
                schema: {
                    type: "oss",
                    path: asyncapi
                },
                origin: apiOrigin,
                overrides: undefined,
                audiences: [],
                settings: {
                    shouldUseTitleAsName: settings?.["use-title"],
                    shouldUseUndiscriminatedUnionsWithLiterals: settings?.unions === "v1",
                    asyncApiMessageNaming: settings?.["message-naming"],
                    shouldUseOptionalAdditionalProperties: undefined,
                    coerceEnumsToLiterals: undefined
                }
            });
        }
    }

    return apiDefinitions;
}

async function parseApiConfigurationV2Schema({
    apiConfiguration,
    rawConfiguration
}: {
    apiConfiguration: APIConfigurationV2Schema;
    rawConfiguration: GeneratorsConfigurationSchema;
}): Promise<APIDefinition> {
    const partialConfig = {
        "auth-schemes": undefined,
        // apiConfiguration.auth != null
        //     ? Object.fromEntries(
        //           Object.entries(rawConfiguration["auth-schemes"] ?? {}).filter(([name, _]) => {
        //               if (apiConfiguration.auth == null) {
        //                   return false;
        //               }
        //               return visitRawApiAuth(apiConfiguration.auth, {
        //                   any: (any) => {
        //                       return any.any.includes(name);
        //                   },
        //                   single: (single) => {
        //                       return single === name;
        //                   }
        //               });
        //           })
        //       )
        //     : undefined,
        ...apiConfiguration
    };

    if (isConjureSchema(apiConfiguration.specs)) {
        return {
            type: "conjure",
            pathToConjureDefinition: apiConfiguration.specs.conjure,
            ...partialConfig
        };
    }

    const rootDefinitions: APIDefinitionLocation[] = [];
    const namespacedDefinitions: Record<string, APIDefinitionLocation[]> = {};

    for (const spec of apiConfiguration.specs ?? []) {
        if (isOpenAPISchema(spec)) {
            const definitionLocation: APIDefinitionLocation = {
                schema: {
                    type: "oss",
                    path: spec.openapi
                },
                origin: spec.origin,
                overrides: spec.overrides,
                audiences: [],
                settings: {
                    shouldUseTitleAsName: spec.settings?.["title-as-schema-name"],
                    shouldUseUndiscriminatedUnionsWithLiterals: undefined,
                    asyncApiMessageNaming: undefined,
                    shouldUseOptionalAdditionalProperties: spec.settings?.["optional-additional-properties"] ?? true,
                    coerceEnumsToLiterals: spec.settings?.["coerce-enums-to-literals"]
                }
            };
            if (spec.namespace == null) {
                rootDefinitions.push(definitionLocation);
            } else {
                namespacedDefinitions[spec.namespace] ??= [];
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                namespacedDefinitions[spec.namespace]!.push(definitionLocation);
            }
        }
    }

    // No namespaces
    if (Object.keys(namespacedDefinitions).length === 0) {
        return {
            type: "singleNamespace",
            definitions: rootDefinitions,
            ...partialConfig
        };
    }
    // Yes namespaces
    return {
        type: "multiNamespace",
        rootDefinitions,
        definitions: namespacedDefinitions,
        ...partialConfig
    };
}

async function parseAPIConfiguration(
    rawGeneratorsConfiguration: GeneratorsConfigurationSchema
): Promise<APIDefinition> {
    const apiConfiguration = rawGeneratorsConfiguration.api;

    if (apiConfiguration != null && isApiConfigurationV2Schema(apiConfiguration)) {
        return parseApiConfigurationV2Schema({ apiConfiguration, rawConfiguration: rawGeneratorsConfiguration });
    }

    if (isPlainObject(apiConfiguration) && "namespaces" in apiConfiguration) {
        const namespacedDefinitions: Record<string, APIDefinitionLocation[]> = {};
        for (const [namespace, configuration] of Object.entries(apiConfiguration.namespaces)) {
            namespacedDefinitions[namespace] = await parseAPIConfigurationToApiLocations(
                configuration,
                rawGeneratorsConfiguration
            );
        }
        return {
            type: "multiNamespace",
            rootDefinitions: undefined,
            definitions: namespacedDefinitions
        };
    }

    return {
        type: "singleNamespace",
        definitions: await parseAPIConfigurationToApiLocations(apiConfiguration, rawGeneratorsConfiguration)
    };
}

async function convertGroup({
    absolutePathToGeneratorsConfiguration,
    groupName,
    group,
    maybeTopLevelMetadata,
    maybeTopLevelReviewers,
    readme
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    groupName: string;
    group: GeneratorGroupSchema;
    maybeTopLevelMetadata: OutputMetadata | undefined;
    maybeTopLevelReviewers: ReviewersSchema | undefined;
    readme: ReadmeSchema | undefined;
}): Promise<GeneratorGroup> {
    const maybeGroupLevelMetadata = getOutputMetadata(group.metadata);
    return {
        groupName,
        reviewers: group.reviewers,
        audiences: group.audiences == null ? { type: "all" } : { type: "select", audiences: group.audiences },
        generators: await Promise.all(
            group.generators.map((generator) =>
                convertGenerator({
                    absolutePathToGeneratorsConfiguration,
                    generator,
                    maybeTopLevelMetadata,
                    maybeGroupLevelMetadata,
                    maybeTopLevelReviewers,
                    maybeGroupLevelReviewers: group.reviewers,
                    readme
                })
            )
        )
    };
}

async function convertGenerator({
    absolutePathToGeneratorsConfiguration,
    generator,
    maybeGroupLevelMetadata,
    maybeTopLevelMetadata,
    maybeGroupLevelReviewers,
    maybeTopLevelReviewers,
    readme
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    generator: GeneratorInvocationSchema;
    maybeGroupLevelMetadata: OutputMetadata | undefined;
    maybeTopLevelMetadata: OutputMetadata | undefined;
    maybeGroupLevelReviewers: ReviewersSchema | undefined;
    maybeTopLevelReviewers: ReviewersSchema | undefined;
    readme: ReadmeSchema | undefined;
}): Promise<GeneratorInvocation> {
    return {
        raw: generator,
        name: generator.name,
        version: generator.version,
        config: generator.config,
        outputMode: await convertOutputMode({
            absolutePathToGeneratorsConfiguration,
            generator,
            maybeGroupLevelMetadata,
            maybeTopLevelMetadata,
            maybeGroupLevelReviewers,
            maybeTopLevelReviewers
        }),
        keywords: generator.keywords,
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
        publishMetadata: getPublishMetadata({ generatorInvocation: generator }),
        readme,
        settings: generator.api?.settings ?? undefined
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

function _getPypiMetadata({
    pypiOutputMetadata,
    maybeGroupLevelMetadata,
    maybeTopLevelMetadata
}: {
    pypiOutputMetadata: PypiOutputMetadataSchema | undefined;
    maybeGroupLevelMetadata: OutputMetadata | undefined;
    maybeTopLevelMetadata: OutputMetadata | undefined;
}): PypiMetadata | undefined {
    let maybePyPiMetadata: PypiMetadata | undefined;
    if (pypiOutputMetadata != null) {
        maybePyPiMetadata = getPyPiMetadata(pypiOutputMetadata);
        maybePyPiMetadata = { ...maybeTopLevelMetadata, ...maybeGroupLevelMetadata, ...maybePyPiMetadata };
    }
    return maybePyPiMetadata;
}

function _getReviewers({
    topLevelReviewers,
    groupLevelReviewers,
    outputModeReviewers
}: {
    topLevelReviewers: ReviewersSchema | undefined;
    groupLevelReviewers: ReviewersSchema | undefined;
    outputModeReviewers: ReviewersSchema | undefined;
}): GithubPullRequestReviewer[] {
    const teamNames = new Set<string>();
    const userNames = new Set<string>();

    const reviewers: GithubPullRequestReviewer[] = [];

    const allTeamReviewers = [
        ...(topLevelReviewers?.teams ?? []),
        ...(groupLevelReviewers?.teams ?? []),
        ...(outputModeReviewers?.teams ?? [])
    ];
    const allUserReviewers = [
        ...(topLevelReviewers?.users ?? []),
        ...(groupLevelReviewers?.users ?? []),
        ...(outputModeReviewers?.users ?? [])
    ];

    for (const team of allTeamReviewers) {
        if (!teamNames.has(team.name)) {
            reviewers.push(GithubPullRequestReviewer.team({ name: team.name }));
            teamNames.add(team.name);
        }
    }

    for (const user of allUserReviewers) {
        if (!userNames.has(user.name)) {
            reviewers.push(GithubPullRequestReviewer.user({ name: user.name }));
            userNames.add(user.name);
        }
    }

    return reviewers;
}

async function convertOutputMode({
    absolutePathToGeneratorsConfiguration,
    generator,
    maybeGroupLevelMetadata = {},
    maybeTopLevelMetadata = {},
    maybeGroupLevelReviewers,
    maybeTopLevelReviewers
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    generator: GeneratorInvocationSchema;
    maybeGroupLevelMetadata: OutputMetadata | undefined;
    maybeTopLevelMetadata: OutputMetadata | undefined;
    maybeGroupLevelReviewers: ReviewersSchema | undefined;
    maybeTopLevelReviewers: ReviewersSchema | undefined;
}): Promise<FernFiddle.OutputMode> {
    const downloadSnippets = generator.snippets != null && generator.snippets.path !== "";
    if (generator.github != null) {
        const indexOfFirstSlash = generator.github.repository.indexOf("/");
        const owner = generator.github.repository.slice(0, indexOfFirstSlash);
        const repo = generator.github.repository.slice(indexOfFirstSlash + 1);
        const publishInfo =
            generator.output != null
                ? getGithubPublishInfo(generator.output, maybeGroupLevelMetadata, maybeTopLevelMetadata)
                : undefined;
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
            case "pull-request": {
                const reviewers = _getReviewers({
                    topLevelReviewers: maybeTopLevelReviewers,
                    groupLevelReviewers: maybeGroupLevelReviewers,
                    outputModeReviewers: (generator.github as GithubPullRequestSchema).reviewers
                });
                return FernFiddle.OutputMode.githubV2(
                    FernFiddle.GithubOutputModeV2.pullRequest({
                        owner,
                        repo,
                        license,
                        publishInfo,
                        downloadSnippets,
                        reviewers
                    })
                );
            }
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
                    pypiMetadata: _getPypiMetadata({
                        pypiOutputMetadata: generator.output.metadata,
                        maybeGroupLevelMetadata,
                        maybeTopLevelMetadata
                    })
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
                    id: FernFiddle.GithubLicenseId.Apache
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

function getGithubPublishInfo(
    output: GeneratorOutputSchema,
    maybeGroupLevelMetadata: OutputMetadata | undefined,
    maybeTopLevelMetadata: OutputMetadata | undefined
): FernFiddle.GithubPublishInfo {
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
                          },
                pypiMetadata: _getPypiMetadata({
                    pypiOutputMetadata: output.metadata,
                    maybeGroupLevelMetadata,
                    maybeTopLevelMetadata
                })
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
    if (generatorName.includes("csharp")) {
        return GenerationLanguage.CSHARP;
    }
    if (generatorName.includes("go")) {
        return GenerationLanguage.GO;
    }
    if (generatorName.includes("java") || generatorName.includes("spring")) {
        return GenerationLanguage.JAVA;
    }
    if (generatorName.includes("php")) {
        return GenerationLanguage.PHP;
    }
    if (generatorName.includes("python") || generatorName.includes("fastapi") || generatorName.includes("pydantic")) {
        return GenerationLanguage.PYTHON;
    }
    if (generatorName.includes("ruby")) {
        return GenerationLanguage.RUBY;
    }
    if (generatorName.includes("swift")) {
        return GenerationLanguage.SWIFT;
    }
    if (generatorName.includes("typescript")) {
        return GenerationLanguage.TYPESCRIPT;
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

function getOutputMetadata(metadata: OutputMetadataSchema | undefined): OutputMetadata | undefined {
    return metadata != null
        ? {
              description: metadata.description,
              authors: metadata.authors?.map((author) => ({ name: author.name, email: author.email }))
          }
        : undefined;
}

function getPyPiMetadata(metadata: PypiOutputMetadataSchema | undefined): PypiMetadata | undefined {
    return metadata != null
        ? {
              description: metadata.description,
              authors: metadata.authors?.map((author) => ({ name: author.name, email: author.email })),
              keywords: metadata.keywords,
              documentationLink: metadata["documentation-link"],
              homepageLink: metadata["homepage-link"]
          }
        : undefined;
}
