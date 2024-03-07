import { loadDependenciesConfiguration } from "@fern-api/dependencies-configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorsConfiguration, loadGeneratorsConfiguration } from "@fern-api/generators-configuration";
import { ASYNCAPI_DIRECTORY, DEFINITION_DIRECTORY, OPENAPI_DIRECTORY } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { listFiles } from "./listFiles";
import { loadAPIChangelog } from "./loadAPIChangelog";
import { getValidAbsolutePathToAsyncAPIFromFolder } from "./loadAsyncAPIFile";
import { getValidAbsolutePathToOpenAPIFromFolder } from "./loadOpenAPIFile";
import { parseYamlFiles } from "./parseYamlFiles";
import { processPackageMarkers } from "./processPackageMarkers";
import { WorkspaceLoader } from "./types/Result";
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
    let generatorsConfiguration: GeneratorsConfiguration | undefined = undefined;
    try {
        generatorsConfiguration = await loadGeneratorsConfiguration({ absolutePathToWorkspace, context });
    } catch (err) {}

    let changelog: APIChangelog | undefined = undefined;
    try {
        changelog = await loadAPIChangelog({ absolutePathToWorkspace });
    } catch (err) {}

    const absolutePathToOpenAPIFolder = join(absolutePathToWorkspace, RelativeFilePath.of(OPENAPI_DIRECTORY));
    const openApiDirectoryExists = await doesPathExist(absolutePathToOpenAPIFolder);

    const absolutePathToAsyncAPIFolder = join(absolutePathToWorkspace, RelativeFilePath.of(ASYNCAPI_DIRECTORY));
    const asyncApiDirectoryExists = await doesPathExist(absolutePathToAsyncAPIFolder);

    if (generatorsConfiguration?.api != null) {
        const specs: Spec[] = [];
        for (const definition of generatorsConfiguration.api.definitions) {
            specs.push({
                absoluteFilepath: join(absolutePathToWorkspace, RelativeFilePath.of(definition.path)),
                absoluteFilepathToOverrides:
                    definition.overrides != null
                        ? join(absolutePathToWorkspace, RelativeFilePath.of(definition.overrides))
                        : undefined
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

    const dependenciesConfiguration = await loadDependenciesConfiguration({ absolutePathToWorkspace, context });
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
