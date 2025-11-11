import { OpenAPISpec, ProtobufSpec, Spec } from "@fern-api/api-workspace-commons";
import {
    DEFINITION_DIRECTORY,
    generatorsYml,
    loadGeneratorsConfiguration,
    OPENAPI_DIRECTORY
} from "@fern-api/configuration-loader";
import { AbsoluteFilePath, doesPathExist, isPathEmpty, join, RelativeFilePath } from "@fern-api/fs-utils";
import {
    ConjureWorkspace,
    LazyFernWorkspace,
    OSSWorkspace,
    WorkspaceLoader,
    WorkspaceLoaderFailureType
} from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";
import { loadAPIChangelog } from "./loadAPIChangelog";

export async function loadSingleNamespaceAPIWorkspace({
    absolutePathToWorkspace,
    namespace,
    definitions
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    namespace: string | undefined;
    definitions: generatorsYml.APIDefinitionLocation[];
}): Promise<Spec[] | WorkspaceLoader.Result> {
    const specs: Spec[] = [];

    for (const definition of definitions) {
        const absoluteFilepathToOverrides =
            definition.overrides != null
                ? join(absolutePathToWorkspace, RelativeFilePath.of(definition.overrides))
                : undefined;
        if (definition.schema.type === "protobuf") {
            const relativeFilepathToProtobufRoot = RelativeFilePath.of(definition.schema.root);
            const absoluteFilepathToProtobufRoot = join(absolutePathToWorkspace, relativeFilepathToProtobufRoot);
            if (!(await doesPathExist(absoluteFilepathToProtobufRoot))) {
                return {
                    didSucceed: false,
                    failures: {
                        [RelativeFilePath.of(definition.schema.root)]: {
                            type: WorkspaceLoaderFailureType.FILE_MISSING
                        }
                    }
                };
            }

            // if the target is empty, don't specify a target because we are using 'strategy: all' from the root
            const absoluteFilepathToTarget: AbsoluteFilePath | undefined =
                definition.schema.target.length === 0
                    ? undefined
                    : join(absolutePathToWorkspace, RelativeFilePath.of(definition.schema.target));

            if (absoluteFilepathToTarget != null) {
                if (!(await doesPathExist(absoluteFilepathToTarget))) {
                    return {
                        didSucceed: false,
                        failures: {
                            [RelativeFilePath.of(definition.schema.target)]: {
                                type: WorkspaceLoaderFailureType.FILE_MISSING
                            }
                        }
                    };
                }
            }

            specs.push({
                type: "protobuf",
                absoluteFilepathToProtobufRoot,
                absoluteFilepathToProtobufTarget: absoluteFilepathToTarget,
                absoluteFilepathToOverrides,
                relativeFilepathToProtobufRoot,
                dependencies: definition.schema.dependencies,
                generateLocally: definition.schema.localGeneration,
                fromOpenAPI: definition.schema.fromOpenAPI,
                settings: {
                    audiences: definition.audiences ?? [],
                    useTitlesAsName: definition.settings?.shouldUseTitleAsName ?? false,
                    shouldUseUndiscriminatedUnionsWithLiterals:
                        definition.settings?.shouldUseUndiscriminatedUnionsWithLiterals ?? false,
                    shouldUseIdiomaticRequestNames: definition.settings?.shouldUseIdiomaticRequestNames ?? true,
                    optionalAdditionalProperties: definition.settings?.shouldUseOptionalAdditionalProperties ?? true,
                    coerceEnumsToLiterals: definition.settings?.coerceEnumsToLiterals ?? true,
                    objectQueryParameters: definition.settings?.objectQueryParameters ?? true,
                    respectReadonlySchemas: definition.settings?.respectReadonlySchemas ?? false,
                    respectNullableSchemas: definition.settings?.respectNullableSchemas ?? true,
                    onlyIncludeReferencedSchemas: definition.settings?.onlyIncludeReferencedSchemas ?? false,
                    inlinePathParameters: definition.settings?.inlinePathParameters ?? true,
                    disableExamples: false,
                    discriminatedUnionV2: definition.settings?.shouldUseUndiscriminatedUnionsWithLiterals ?? false,
                    preserveSchemaIds: false,
                    asyncApiNaming: definition.settings?.asyncApiMessageNaming ?? "v1",
                    filter: definition.settings?.filter,
                    exampleGeneration: undefined,
                    defaultFormParameterEncoding: definition.settings?.defaultFormParameterEncoding,
                    useBytesForBinaryResponse: definition.settings?.useBytesForBinaryResponse ?? false,
                    respectForwardCompatibleEnums: definition.settings?.respectForwardCompatibleEnums ?? false,
                    additionalPropertiesDefaultsTo: definition.settings?.additionalPropertiesDefaultsTo ?? false,
                    typeDatesAsStrings: definition.settings?.typeDatesAsStrings ?? false,
                    preserveSingleSchemaOneOf: definition.settings?.preserveSingleSchemaOneOf ?? false,
                    inlineAllOfSchemas: definition.settings?.inlineAllOfSchemas ?? false,
                    resolveAliases: definition.settings?.resolveAliases ?? false,
                    groupMultiApiEnvironments: definition.settings?.groupMultiApiEnvironments ?? false,
                    wrapReferencesToNullableInOptional:
                        definition.settings?.wrapReferencesToNullableInOptional ?? false,
                    coerceOptionalSchemasToNullable: definition.settings?.coerceOptionalSchemasToNullable ?? false,
                    groupEnvironmentsByHost: definition.settings?.groupEnvironmentsByHost ?? false,
                    removeDiscriminantsFromSchemas:
                        definition.settings?.removeDiscriminantsFromSchemas ??
                        generatorsYml.RemoveDiscriminantsFromSchemas.Always
                }
            });
            continue;
        }

        if (definition.schema.type === "openrpc") {
            const relativeFilepathToOpenRpc = RelativeFilePath.of(definition.schema.path);
            const absoluteFilepathToOpenRpc = join(absolutePathToWorkspace, relativeFilepathToOpenRpc);
            specs.push({
                type: "openrpc",
                absoluteFilepath: absoluteFilepathToOpenRpc,
                absoluteFilepathToOverrides,
                namespace
            });
            continue;
        }

        const absoluteFilepath = join(absolutePathToWorkspace, RelativeFilePath.of(definition.schema.path));
        if (!(await doesPathExist(absoluteFilepath))) {
            return {
                didSucceed: false,
                failures: {
                    [RelativeFilePath.of(definition.schema.path)]: {
                        type: WorkspaceLoaderFailureType.FILE_MISSING
                    }
                }
            };
        }
        if (
            definition.overrides != null &&
            absoluteFilepathToOverrides != null &&
            !(await doesPathExist(absoluteFilepathToOverrides))
        ) {
            return {
                didSucceed: false,
                failures: {
                    [RelativeFilePath.of(definition.overrides)]: {
                        type: WorkspaceLoaderFailureType.FILE_MISSING
                    }
                }
            };
        }
        specs.push({
            type: "openapi",
            absoluteFilepath,
            absoluteFilepathToOverrides,
            settings: {
                audiences: definition.audiences ?? [],
                useTitlesAsName: definition.settings?.shouldUseTitleAsName ?? false,
                shouldUseUndiscriminatedUnionsWithLiterals:
                    definition.settings?.shouldUseUndiscriminatedUnionsWithLiterals ?? false,
                shouldUseIdiomaticRequestNames: definition.settings?.shouldUseIdiomaticRequestNames ?? true,
                optionalAdditionalProperties: definition.settings?.shouldUseOptionalAdditionalProperties ?? true,
                coerceEnumsToLiterals: definition.settings?.coerceEnumsToLiterals ?? true,
                objectQueryParameters: definition.settings?.objectQueryParameters ?? true,
                respectReadonlySchemas: definition.settings?.respectReadonlySchemas ?? false,
                respectNullableSchemas: definition.settings?.respectNullableSchemas ?? true,
                onlyIncludeReferencedSchemas: definition.settings?.onlyIncludeReferencedSchemas ?? false,
                inlinePathParameters: definition.settings?.inlinePathParameters ?? true,
                disableExamples: false,
                discriminatedUnionV2: definition.settings?.shouldUseUndiscriminatedUnionsWithLiterals ?? false,
                preserveSchemaIds: false,
                asyncApiNaming: definition.settings?.asyncApiMessageNaming ?? "v1",
                filter: definition.settings?.filter,
                exampleGeneration: definition.settings?.exampleGeneration,
                defaultFormParameterEncoding: definition.settings?.defaultFormParameterEncoding,
                useBytesForBinaryResponse: definition.settings?.useBytesForBinaryResponse ?? false,
                respectForwardCompatibleEnums: definition.settings?.respectForwardCompatibleEnums ?? false,
                additionalPropertiesDefaultsTo: definition.settings?.additionalPropertiesDefaultsTo ?? false,
                typeDatesAsStrings: definition.settings?.typeDatesAsStrings ?? false,
                preserveSingleSchemaOneOf: definition.settings?.preserveSingleSchemaOneOf ?? false,
                inlineAllOfSchemas: definition.settings?.inlineAllOfSchemas ?? false,
                resolveAliases: definition.settings?.resolveAliases ?? false,
                groupMultiApiEnvironments: definition.settings?.groupMultiApiEnvironments ?? false,
                wrapReferencesToNullableInOptional: definition.settings?.wrapReferencesToNullableInOptional ?? false,
                coerceOptionalSchemasToNullable: definition.settings?.coerceOptionalSchemasToNullable ?? false,
                groupEnvironmentsByHost: definition.settings?.groupEnvironmentsByHost ?? false,
                removeDiscriminantsFromSchemas:
                    definition.settings?.removeDiscriminantsFromSchemas ??
                    generatorsYml.RemoveDiscriminantsFromSchemas.Always
            },
            source: {
                type: "openapi",
                file: absoluteFilepath
            },
            namespace
        });
    }

    return specs;
}

export async function loadAPIWorkspace({
    absolutePathToWorkspace,
    context,
    cliVersion,
    workspaceName
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
    cliVersion: string;
    workspaceName: string | undefined;
}): Promise<WorkspaceLoader.Result> {
    const generatorsConfiguration = await loadGeneratorsConfiguration({
        absolutePathToWorkspace,
        context
    });

    let changelog = undefined;
    try {
        changelog = await loadAPIChangelog({ absolutePathToWorkspace });
        // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
    } catch (err) {}

    if (generatorsConfiguration?.api != null && generatorsConfiguration?.api.type === "conjure") {
        return {
            didSucceed: true,
            workspace: new ConjureWorkspace({
                workspaceName,
                absoluteFilePath: absolutePathToWorkspace,
                generatorsConfiguration,
                changelog,
                cliVersion,
                context,
                relativePathToConjureDirectory: RelativeFilePath.of(generatorsConfiguration.api.pathToConjureDefinition)
            })
        };
    }

    if (
        generatorsConfiguration?.api != null &&
        ((generatorsConfiguration.api.type === "singleNamespace" &&
            generatorsConfiguration.api.definitions.length > 0) ||
            generatorsConfiguration.api.type === "multiNamespace")
    ) {
        const specs: Spec[] = [];

        if (generatorsConfiguration.api.type === "singleNamespace") {
            const maybeSpecs = await loadSingleNamespaceAPIWorkspace({
                absolutePathToWorkspace,
                namespace: undefined,
                definitions: generatorsConfiguration.api.definitions
            });
            if (!Array.isArray(maybeSpecs)) {
                return maybeSpecs;
            }
            specs.push(...maybeSpecs);
        } else {
            for (const [namespace, definitions] of Object.entries(generatorsConfiguration.api.definitions)) {
                const maybeSpecs = await loadSingleNamespaceAPIWorkspace({
                    absolutePathToWorkspace,
                    namespace,
                    definitions
                });
                if (!Array.isArray(maybeSpecs)) {
                    return maybeSpecs;
                }
                specs.push(...maybeSpecs);
            }

            if (generatorsConfiguration.api.rootDefinitions != null) {
                const maybeRootSpecs = await loadSingleNamespaceAPIWorkspace({
                    absolutePathToWorkspace,
                    namespace: undefined,
                    definitions: generatorsConfiguration.api.rootDefinitions
                });
                if (!Array.isArray(maybeRootSpecs)) {
                    return maybeRootSpecs;
                }
                specs.push(...maybeRootSpecs);
            }
        }

        return {
            didSucceed: true,
            workspace: new OSSWorkspace({
                specs: specs.filter((spec) => {
                    if (spec.type === "openrpc") {
                        return false;
                    }
                    if (spec.type === "protobuf") {
                        if (!spec.fromOpenAPI) {
                            return false;
                        }
                    }
                    return true;
                }) as (OpenAPISpec | ProtobufSpec)[],
                allSpecs: specs.filter((spec) => {
                    if (spec.type === "protobuf") {
                        if (spec.fromOpenAPI) {
                            return false;
                        }
                    }
                    return true;
                }),
                workspaceName,
                absoluteFilePath: absolutePathToWorkspace,
                generatorsConfiguration,
                changelog,
                cliVersion
            })
        };
    }

    if (await doesPathExist(join(absolutePathToWorkspace, RelativeFilePath.of(DEFINITION_DIRECTORY)))) {
        const fernWorkspace = new LazyFernWorkspace({
            absoluteFilePath: absolutePathToWorkspace,
            generatorsConfiguration,
            workspaceName,
            changelog,
            context,
            cliVersion,
            loadAPIWorkspace
        });

        return {
            didSucceed: true,
            workspace: fernWorkspace
        };
    }

    // check if directory is empty
    if (await isPathEmpty(join(absolutePathToWorkspace, RelativeFilePath.of(DEFINITION_DIRECTORY)))) {
        const apiFolderName = absolutePathToWorkspace.split("/").pop();
        context.logger.warn(`Detected empty API definiton: ${apiFolderName}. Remove to resolve error.`);
    }

    return {
        didSucceed: false,
        failures: {
            [RelativeFilePath.of(OPENAPI_DIRECTORY)]: {
                type: WorkspaceLoaderFailureType.MISCONFIGURED_DIRECTORY
            }
        }
    };
}
