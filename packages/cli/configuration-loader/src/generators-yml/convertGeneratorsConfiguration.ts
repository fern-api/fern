import { readFile } from "fs/promises";
import path from "path";

import { generatorsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { visitRawApiAuth } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, RelativeFilePath, dirname, join, resolve } from "@fern-api/fs-utils";

import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { GithubPullRequestReviewer, OutputMetadata, PublishingMetadata, PypiMetadata } from "@fern-fern/fiddle-sdk/api";

export async function convertGeneratorsConfiguration({
    absolutePathToGeneratorsConfiguration,
    rawGeneratorsConfiguration
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    rawGeneratorsConfiguration: generatorsYml.GeneratorsConfigurationSchema;
}): Promise<generatorsYml.GeneratorsConfiguration> {
    const maybeTopLevelMetadata = getOutputMetadata(rawGeneratorsConfiguration.metadata);
    const readme = rawGeneratorsConfiguration.readme;
    const parsedApiConfiguration = await parseAPIConfiguration(rawGeneratorsConfiguration);
    return {
        absolutePathToConfiguration: absolutePathToGeneratorsConfiguration,
        api: parsedApiConfiguration,
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

async function parseAPIConfigurationToApiLocations(
    apiConfiguration: generatorsYml.ApiConfigurationSchemaInternal | undefined,
    rawConfiguration: generatorsYml.GeneratorsConfigurationSchema
): Promise<generatorsYml.APIDefinitionLocation[]> {
    const apiDefinitions: generatorsYml.APIDefinitionLocation[] = [];

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
                    onlyIncludeReferencedSchemas: undefined,
                    shouldUseOptionalAdditionalProperties: undefined,
                    coerceEnumsToLiterals: undefined,
                    objectQueryParameters: undefined,
                    respectReadonlySchemas: undefined,
                    inlinePathParameters: undefined,
                    filter: undefined,
                    exampleGeneration: undefined
                }
            });
        } else if (generatorsYml.isRawProtobufAPIDefinitionSchema(apiConfiguration)) {
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
                    coerceEnumsToLiterals: undefined,
                    objectQueryParameters: undefined,
                    respectReadonlySchemas: undefined,
                    onlyIncludeReferencedSchemas: undefined,
                    inlinePathParameters: undefined,
                    filter: undefined,
                    exampleGeneration: undefined
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
                            coerceEnumsToLiterals: undefined,
                            objectQueryParameters: undefined,
                            respectReadonlySchemas: undefined,
                            onlyIncludeReferencedSchemas: undefined,
                            inlinePathParameters: undefined,
                            filter: undefined,
                            exampleGeneration: undefined
                        }
                    });
                } else if (generatorsYml.isRawProtobufAPIDefinitionSchema(definition)) {
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
                            coerceEnumsToLiterals: undefined,
                            objectQueryParameters: undefined,
                            respectReadonlySchemas: undefined,
                            onlyIncludeReferencedSchemas: undefined,
                            inlinePathParameters: undefined,
                            filter: undefined,
                            exampleGeneration: undefined
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
                            onlyIncludeReferencedSchemas: definition.settings?.["only-include-referenced-schemas"],
                            shouldUseOptionalAdditionalProperties: undefined,
                            coerceEnumsToLiterals: undefined,
                            objectQueryParameters: undefined,
                            respectReadonlySchemas: undefined,
                            inlinePathParameters: undefined,
                            filter: undefined,
                            exampleGeneration: undefined
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
                    onlyIncludeReferencedSchemas: apiConfiguration.settings?.["only-include-referenced-schemas"],
                    shouldUseOptionalAdditionalProperties: undefined,
                    coerceEnumsToLiterals: undefined,
                    objectQueryParameters: undefined,
                    respectReadonlySchemas: undefined,
                    inlinePathParameters: undefined,
                    filter: undefined,
                    exampleGeneration: undefined
                }
            });
        }
    } else {
        const openapi = rawConfiguration[generatorsYml.OPENAPI_LOCATION_KEY];
        const apiOrigin = rawConfiguration[generatorsYml.API_ORIGIN_LOCATION_KEY];
        const openapiOverrides = rawConfiguration[generatorsYml.OPENAPI_OVERRIDES_LOCATION_KEY];
        const asyncapi = rawConfiguration[generatorsYml.ASYNC_API_LOCATION_KEY];
        const settings = rawConfiguration[generatorsYml.API_SETTINGS_KEY];
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
                    onlyIncludeReferencedSchemas: settings?.["only-include-referenced-schemas"],
                    asyncApiMessageNaming: undefined,
                    shouldUseOptionalAdditionalProperties: undefined,
                    coerceEnumsToLiterals: undefined,
                    objectQueryParameters: undefined,
                    respectReadonlySchemas: undefined,
                    inlinePathParameters: undefined,
                    filter: undefined,
                    exampleGeneration: undefined
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
                    onlyIncludeReferencedSchemas: openapi.settings?.["only-include-referenced-schemas"],
                    asyncApiMessageNaming: undefined,
                    shouldUseOptionalAdditionalProperties: undefined,
                    coerceEnumsToLiterals: undefined,
                    objectQueryParameters: undefined,
                    respectReadonlySchemas: undefined,
                    inlinePathParameters: undefined,
                    filter: undefined,
                    exampleGeneration: undefined
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
                    onlyIncludeReferencedSchemas: settings?.["only-include-referenced-schemas"],
                    shouldUseOptionalAdditionalProperties: undefined,
                    coerceEnumsToLiterals: undefined,
                    objectQueryParameters: undefined,
                    respectReadonlySchemas: undefined,
                    inlinePathParameters: undefined,
                    filter: undefined,
                    exampleGeneration: undefined
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
    apiConfiguration: generatorsYml.ApiConfigurationV2Schema;
    rawConfiguration: generatorsYml.GeneratorsConfigurationSchema;
}): Promise<generatorsYml.APIDefinition> {
    const partialConfig = {
        "auth-schemes":
            apiConfiguration.auth != null
                ? Object.fromEntries(
                      Object.entries(rawConfiguration["auth-schemes"] ?? {}).filter(([name, _]) => {
                          if (apiConfiguration.auth == null) {
                              return false;
                          }
                          return visitRawApiAuth(apiConfiguration.auth, {
                              any: (any) => {
                                  return any.any.includes(name);
                              },
                              single: (single) => {
                                  return single === name;
                              }
                          });
                      })
                  )
                : undefined,
        ...apiConfiguration
    };

    if (generatorsYml.isConjureSchema(apiConfiguration.specs)) {
        return {
            type: "conjure",
            pathToConjureDefinition: apiConfiguration.specs.conjure,
            ...partialConfig
        };
    }

    const rootDefinitions: generatorsYml.APIDefinitionLocation[] = [];
    const namespacedDefinitions: Record<string, generatorsYml.APIDefinitionLocation[]> = {};

    for (const spec of apiConfiguration.specs ?? []) {
        if (generatorsYml.isOpenAPISchema(spec)) {
            const definitionLocation: generatorsYml.APIDefinitionLocation = {
                schema: {
                    type: "oss",
                    path: spec.openapi
                },
                origin: spec.origin,
                overrides: spec.overrides,
                audiences: [],
                settings: {
                    shouldUseTitleAsName: spec.settings?.["title-as-schema-name"],
                    shouldUseUndiscriminatedUnionsWithLiterals:
                        spec.settings?.["prefer-undiscriminated-unions-with-literals"] ?? false,
                    asyncApiMessageNaming: undefined,
                    onlyIncludeReferencedSchemas: spec.settings?.["only-include-referenced-schemas"],
                    shouldUseOptionalAdditionalProperties: spec.settings?.["optional-additional-properties"] ?? true,
                    coerceEnumsToLiterals: spec.settings?.["coerce-enums-to-literals"],
                    objectQueryParameters: spec.settings?.["object-query-parameters"],
                    respectReadonlySchemas: spec.settings?.["respect-readonly-schemas"],
                    inlinePathParameters: spec.settings?.["inline-path-parameters"],
                    filter: spec.settings?.filter,
                    exampleGeneration: spec.settings?.["example-generation"]
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
    rawGeneratorsConfiguration: generatorsYml.GeneratorsConfigurationSchema
): Promise<generatorsYml.APIDefinition> {
    const apiConfiguration = rawGeneratorsConfiguration.api;

    if (apiConfiguration != null && generatorsYml.isApiConfigurationV2Schema(apiConfiguration)) {
        return parseApiConfigurationV2Schema({ apiConfiguration, rawConfiguration: rawGeneratorsConfiguration });
    }

    if (apiConfiguration != null && generatorsYml.isNamespacedApiConfiguration(apiConfiguration)) {
        const namespacedDefinitions: Record<string, generatorsYml.APIDefinitionLocation[]> = {};
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
    group: generatorsYml.GeneratorGroupSchema;
    maybeTopLevelMetadata: OutputMetadata | undefined;
    maybeTopLevelReviewers: generatorsYml.ReviewersSchema | undefined;
    readme: generatorsYml.ReadmeSchema | undefined;
}): Promise<generatorsYml.GeneratorGroup> {
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
    generator: generatorsYml.GeneratorInvocationSchema;
    maybeGroupLevelMetadata: OutputMetadata | undefined;
    maybeTopLevelMetadata: OutputMetadata | undefined;
    maybeGroupLevelReviewers: generatorsYml.ReviewersSchema | undefined;
    maybeTopLevelReviewers: generatorsYml.ReviewersSchema | undefined;
    readme: generatorsYml.ReadmeSchema | undefined;
}): Promise<generatorsYml.GeneratorInvocation> {
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
    generatorInvocation: generatorsYml.GeneratorInvocationSchema;
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
    pypiOutputMetadata: generatorsYml.PypiOutputMetadataSchema | undefined;
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
    topLevelReviewers: generatorsYml.ReviewersSchema | undefined;
    groupLevelReviewers: generatorsYml.ReviewersSchema | undefined;
    outputModeReviewers: generatorsYml.ReviewersSchema | undefined;
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
    generator: generatorsYml.GeneratorInvocationSchema;
    maybeGroupLevelMetadata: OutputMetadata | undefined;
    maybeTopLevelMetadata: OutputMetadata | undefined;
    maybeGroupLevelReviewers: generatorsYml.ReviewersSchema | undefined;
    maybeTopLevelReviewers: generatorsYml.ReviewersSchema | undefined;
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
                    outputModeReviewers: (generator.github as generatorsYml.GithubPullRequestSchema).reviewers
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
                    username: generator.output.token != null ? "__token__" : (generator.output.password ?? ""),
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
    githubLicense: generatorsYml.GithubLicenseSchema;
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

// TODO: This is where we should add support for Go and PHP.
function getGithubPublishInfo(
    output: generatorsYml.GeneratorOutputSchema,
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
        return generatorsYml.GenerationLanguage.CSHARP;
    }
    if (generatorName.includes("go")) {
        return generatorsYml.GenerationLanguage.GO;
    }
    if (generatorName.includes("java") || generatorName.includes("spring")) {
        return generatorsYml.GenerationLanguage.JAVA;
    }
    if (generatorName.includes("php")) {
        return generatorsYml.GenerationLanguage.PHP;
    }
    if (generatorName.includes("python") || generatorName.includes("fastapi") || generatorName.includes("pydantic")) {
        return generatorsYml.GenerationLanguage.PYTHON;
    }
    if (generatorName.includes("ruby")) {
        return generatorsYml.GenerationLanguage.RUBY;
    }
    if (generatorName.includes("swift")) {
        return generatorsYml.GenerationLanguage.SWIFT;
    }
    if (generatorName.includes("typescript")) {
        return generatorsYml.GenerationLanguage.TYPESCRIPT;
    }
    return undefined;
}

function getMavenRegistryUrl(maven: generatorsYml.MavenOutputLocationSchema) {
    if (maven.url != null) {
        return maven.url;
    }
    return maven.signature != null
        ? "https://oss.sonatype.org/service/local/staging/deploy/maven2/"
        : "https://s01.oss.sonatype.org/content/repositories/releases/";
}

function getGithubLicenseSchema(
    generator: generatorsYml.GeneratorInvocationSchema
): generatorsYml.GithubLicenseSchema | undefined {
    if (generator["publish-metadata"]?.license != null) {
        return generator["publish-metadata"].license;
    } else if (generator.metadata?.license != null) {
        return generator.metadata.license;
    }
    return generator.github?.license;
}

function getOutputMetadata(metadata: generatorsYml.OutputMetadataSchema | undefined): OutputMetadata | undefined {
    return metadata != null
        ? {
              description: metadata.description,
              authors: metadata.authors?.map((author) => ({ name: author.name, email: author.email }))
          }
        : undefined;
}

function getPyPiMetadata(metadata: generatorsYml.PypiOutputMetadataSchema | undefined): PypiMetadata | undefined {
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
