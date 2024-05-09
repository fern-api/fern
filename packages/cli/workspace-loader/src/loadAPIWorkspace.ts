import {
    ASYNCAPI_DIRECTORY,
    DEFINITION_DIRECTORY,
    dependenciesYml,
    generatorsYml,
    OPENAPI_DIRECTORY
} from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { listFiles } from "./listFiles";
import { loadAPIChangelog } from "./loadAPIChangelog";
import { getValidAbsolutePathToAsyncAPIFromFolder } from "./loadAsyncAPIFile";
import { getValidAbsolutePathToOpenAPIFromFolder } from "./loadOpenAPIFile";
import { parseYamlFiles } from "./parseYamlFiles";
import { processPackageMarkers } from "./processPackageMarkers";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "./types/Result";
import { APIChangelog, FernWorkspace, Spec } from "./types/Workspace";
import { validateStructureOfYamlFiles } from "./validateStructureOfYamlFiles";

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
    let generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined = undefined;
    try {
        generatorsConfiguration = await generatorsYml.loadGeneratorsConfiguration({ absolutePathToWorkspace, context });
    } catch (err) {}

    let changelog: APIChangelog | undefined = undefined;
    try {
        changelog = await loadAPIChangelog({ absolutePathToWorkspace });
    } catch (err) {}

    const absolutePathToOpenAPIFolder = join(absolutePathToWorkspace, RelativeFilePath.of(OPENAPI_DIRECTORY));
    const openApiDirectoryExists = await doesPathExist(absolutePathToOpenAPIFolder);

    const absolutePathToAsyncAPIFolder = join(absolutePathToWorkspace, RelativeFilePath.of(ASYNCAPI_DIRECTORY));
    const asyncApiDirectoryExists = await doesPathExist(absolutePathToAsyncAPIFolder);

    if (generatorsConfiguration?.api != null && generatorsConfiguration.api.definitions.length > 0) {
        const specs: Spec[] = [];

        for (const definition of generatorsConfiguration.api.definitions) {
            const absoluteFilepath = join(absolutePathToWorkspace, RelativeFilePath.of(definition.path));
            const absoluteFilepathToOverrides =
                definition.overrides != null
                    ? join(absolutePathToWorkspace, RelativeFilePath.of(definition.overrides))
                    : undefined;
            if (!(await doesPathExist(absoluteFilepath))) {
                return {
                    didSucceed: false,
                    failures: {
                        [RelativeFilePath.of(definition.path)]: {
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
                absoluteFilepath,
                absoluteFilepathToOverrides,
                settings: {
                    audiences: definition.audiences ?? [],
                    shouldUseTitleAsName: definition.shouldUseTitleAsName ?? true
                }
            });
        }
        return {
            didSucceed: true,
            workspace: {
                type: "oss",
                name: "api",
                specs,
                workspaceName,
                absoluteFilepath: absolutePathToWorkspace,
                generatorsConfiguration,
                changelog
            }
        };
    }

    if (openApiDirectoryExists) {
        const absolutePathToAsyncAPI = asyncApiDirectoryExists
            ? await getValidAbsolutePathToAsyncAPIFromFolder(context, absolutePathToAsyncAPIFolder)
            : undefined;
        const absolutePathToOpenAPI = await getValidAbsolutePathToOpenAPIFromFolder(
            context,
            absolutePathToOpenAPIFolder
        );
        const specs: Spec[] = [];
        if (absolutePathToOpenAPI != null) {
            specs.push({
                absoluteFilepath: absolutePathToOpenAPI,
                absoluteFilepathToOverrides: undefined
            });
        }
        if (absolutePathToAsyncAPI != null) {
            specs.push({
                absoluteFilepath: absolutePathToAsyncAPI,
                absoluteFilepathToOverrides: undefined
            });
        }
        if (absolutePathToOpenAPI != null && absolutePathToAsyncAPI != null) {
            return {
                didSucceed: false,
                failures: {
                    [RelativeFilePath.of("openapi/openapi.yml")]: {
                        type: WorkspaceLoaderFailureType.FILE_MISSING
                    }
                }
            };
        }
        return {
            didSucceed: true,
            workspace: {
                type: "oss",
                name: "api",
                specs,
                workspaceName,
                absoluteFilepath: absolutePathToWorkspace,
                generatorsConfiguration,
                changelog
            }
        };
    }

    const absolutePathToDefinition = join(absolutePathToWorkspace, RelativeFilePath.of(DEFINITION_DIRECTORY));

    const dependenciesConfiguration = await dependenciesYml.loadDependenciesConfiguration({
        absolutePathToWorkspace,
        context
    });
    const yamlFiles = await listFiles(absolutePathToDefinition, "{yml,yaml}");

    const parseResult = await parseYamlFiles(yamlFiles);
    if (!parseResult.didSucceed) {
        return parseResult;
    }

    const structuralValidationResult = validateStructureOfYamlFiles({
        files: parseResult.files,
        absolutePathToDefinition
    });
    if (!structuralValidationResult.didSucceed) {
        return structuralValidationResult;
    }

    const processPackageMarkersResult = await processPackageMarkers({
        dependenciesConfiguration,
        structuralValidationResult,
        context,
        cliVersion
    });
    if (!processPackageMarkersResult.didSucceed) {
        return processPackageMarkersResult;
    }

    const fernWorkspace: FernWorkspace = {
        type: "fern",
        name: structuralValidationResult.rootApiFile.contents.name,
        absoluteFilepath: absolutePathToWorkspace,
        generatorsConfiguration,
        dependenciesConfiguration,
        workspaceName,
        definition: {
            absoluteFilepath: absolutePathToDefinition,
            rootApiFile: structuralValidationResult.rootApiFile,
            namedDefinitionFiles: structuralValidationResult.namedDefinitionFiles,
            packageMarkers: processPackageMarkersResult.packageMarkers,
            importedDefinitions: processPackageMarkersResult.importedDefinitions
        },
        changelog
    };

    return {
        didSucceed: true,
        workspace: fernWorkspace
    };
}
