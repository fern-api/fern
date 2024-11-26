import { DEFINITION_DIRECTORY, generatorsYml, OPENAPI_DIRECTORY } from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { loadAPIChangelog } from "./loadAPIChangelog";
import { Spec } from "./types/Workspace";
import {
    OSSWorkspace,
    LazyFernWorkspace,
    WorkspaceLoader,
    WorkspaceLoaderFailureType,
    ConjureWorkspace
} from "@fern-api/lazy-fern-workspace";

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
            const absoluteFilepathToProtobufRoot = join(
                absolutePathToWorkspace,
                RelativeFilePath.of(definition.schema.root)
            );
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

            const absoluteFilepathToProtobufTarget = join(
                absolutePathToWorkspace,
                RelativeFilePath.of(definition.schema.target)
            );

            if (!(await doesPathExist(absoluteFilepathToProtobufTarget))) {
                return {
                    didSucceed: false,
                    failures: {
                        [RelativeFilePath.of(definition.schema.target)]: {
                            type: WorkspaceLoaderFailureType.FILE_MISSING
                        }
                    }
                };
            }
            specs.push({
                type: "protobuf",
                absoluteFilepathToProtobufRoot,
                absoluteFilepathToProtobufTarget,
                absoluteFilepathToOverrides,
                generateLocally: definition.schema.localGeneration,
                settings: {
                    audiences: definition.audiences ?? [],
                    shouldUseTitleAsName: definition.settings?.shouldUseTitleAsName ?? true,
                    shouldUseUndiscriminatedUnionsWithLiterals:
                        definition.settings?.shouldUseUndiscriminatedUnionsWithLiterals ?? false,
                    optionalAdditionalProperties: definition.settings?.shouldUseOptionalAdditionalProperties ?? true,
                    cooerceEnumsToLiterals: definition.settings?.coerceEnumsToLiterals ?? true,
                    objectQueryParameters: definition.settings?.objectQueryParameters ?? false,
                    respectReadonlySchemas: definition.settings?.respectReadonlySchemas ?? false,
                    onlyIncludeReferencedSchemas: definition.settings?.onlyIncludeReferencedSchemas ?? false,
                    inlinePathParameters: definition.settings?.inlinePathParameters ?? false
                }
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
                shouldUseTitleAsName: definition.settings?.shouldUseTitleAsName ?? true,
                shouldUseUndiscriminatedUnionsWithLiterals:
                    definition.settings?.shouldUseUndiscriminatedUnionsWithLiterals ?? false,
                asyncApiNaming: definition.settings?.asyncApiMessageNaming,
                optionalAdditionalProperties: definition.settings?.shouldUseOptionalAdditionalProperties ?? true,
                cooerceEnumsToLiterals: definition.settings?.coerceEnumsToLiterals ?? true,
                objectQueryParameters: definition.settings?.objectQueryParameters ?? false,
                respectReadonlySchemas: definition.settings?.respectReadonlySchemas ?? false,
                onlyIncludeReferencedSchemas: definition.settings?.onlyIncludeReferencedSchemas ?? false,
                inlinePathParameters: definition.settings?.inlinePathParameters ?? false
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
    const generatorsConfiguration = await generatorsYml.loadGeneratorsConfiguration({
        absolutePathToWorkspace,
        context
    });

    let changelog = undefined;
    try {
        changelog = await loadAPIChangelog({ absolutePathToWorkspace });
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
                specs,
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

    return {
        didSucceed: false,
        failures: {
            [RelativeFilePath.of(OPENAPI_DIRECTORY)]: {
                type: WorkspaceLoaderFailureType.MISCONFIGURED_DIRECTORY
            }
        }
    };
}
