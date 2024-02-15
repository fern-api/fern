import { loadDependenciesConfiguration } from "@fern-api/dependencies-configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorsConfiguration, loadGeneratorsConfiguration } from "@fern-api/generators-configuration";
import { ASYNCAPI_DIRECTORY, DEFINITION_DIRECTORY, OPENAPI_DIRECTORY } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { listFiles } from "./listFiles";
import { getValidAbsolutePathToAsyncAPI, getValidAbsolutePathToAsyncAPIFromFolder } from "./loadAsyncAPIFile";
import { getValidAbsolutePathToOpenAPI, getValidAbsolutePathToOpenAPIFromFolder } from "./loadOpenAPIFile";
import { parseYamlFiles } from "./parseYamlFiles";
import { processPackageMarkers } from "./processPackageMarkers";
import { WorkspaceLoader } from "./types/Result";
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

    const absolutePathToOpenAPIFolder = join(absolutePathToWorkspace, RelativeFilePath.of(OPENAPI_DIRECTORY));
    const openApiDirectoryExists = await doesPathExist(absolutePathToOpenAPIFolder);

    const absolutePathToAsyncAPIFolder = join(absolutePathToWorkspace, RelativeFilePath.of(ASYNCAPI_DIRECTORY));
    const asyncApiDirectoryExists = await doesPathExist(absolutePathToAsyncAPIFolder);

    if (generatorsConfiguration?.absolutePathToOpenAPI != null) {
        const absolutePathToAsyncAPI =
            generatorsConfiguration.absolutePathToAsyncAPI != null
                ? await getValidAbsolutePathToAsyncAPI(context, generatorsConfiguration.absolutePathToAsyncAPI)
                : undefined;
        const absolutePathToOpenAPI = await getValidAbsolutePathToOpenAPI(
            context,
            generatorsConfiguration.absolutePathToOpenAPI
        );
        return {
            didSucceed: true,
            workspace: {
                type: "openapi",
                name: "api",
                workspaceName,
                absoluteFilepath: absolutePathToWorkspace,
                generatorsConfiguration,
                absolutePathToOpenAPI,
                absolutePathToAsyncAPI
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
        return {
            didSucceed: true,
            workspace: {
                type: "openapi",
                name: "api",
                workspaceName,
                absoluteFilepath: absolutePathToWorkspace,
                generatorsConfiguration,
                absolutePathToOpenAPI,
                absolutePathToAsyncAPI
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

    return {
        didSucceed: true,
        workspace: {
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
            }
        }
    };
}
