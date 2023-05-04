import { loadDependenciesConfiguration } from "@fern-api/dependencies-configuration";
import { loadDocsConfiguration } from "@fern-api/docs-configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loadGeneratorsConfiguration } from "@fern-api/generators-configuration";
import { DEFINITION_DIRECTORY, OPENAPI_DIRECTORY } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { listYamlFilesForWorkspace } from "./listYamlFilesForWorkspace";
import { loadAndValidateOpenAPIDefinition } from "./loadAndValidateOpenAPIWorkspace";
import { parseYamlFiles } from "./parseYamlFiles";
import { processPackageMarkers } from "./processPackageMarkers";
import { WorkspaceLoader } from "./types/Result";
import { validateStructureOfYamlFiles } from "./validateStructureOfYamlFiles";

export async function loadWorkspace({
    absolutePathToWorkspace,
    context,
    cliVersion,
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
    cliVersion: string;
}): Promise<WorkspaceLoader.Result> {
    const generatorsConfiguration = await loadGeneratorsConfiguration({ absolutePathToWorkspace, context });
    const docsConfiguration = await loadDocsConfiguration({ absolutePathToWorkspace, context });

    const absolutePathToOpenAPIDefinition = join(absolutePathToWorkspace, RelativeFilePath.of(OPENAPI_DIRECTORY));
    const openApiDirectoryExists = await doesPathExist(absolutePathToOpenAPIDefinition);

    if (openApiDirectoryExists) {
        const openApiDirectory = await loadAndValidateOpenAPIDefinition(absolutePathToOpenAPIDefinition);
        return {
            didSucceed: true,
            workspace: {
                type: "openapi",
                name: "api",
                absolutePathToWorkspace,
                absolutePathToDefinition: absolutePathToOpenAPIDefinition,
                generatorsConfiguration,
                docsConfiguration,
                definition: openApiDirectory,
            },
        };
    }

    const absolutePathToDefinition = join(absolutePathToWorkspace, RelativeFilePath.of(DEFINITION_DIRECTORY));

    const dependenciesConfiguration = await loadDependenciesConfiguration({ absolutePathToWorkspace, context });
    const yamlFiles = await listYamlFilesForWorkspace(absolutePathToDefinition);

    const parseResult = await parseYamlFiles(yamlFiles);
    if (!parseResult.didSucceed) {
        return parseResult;
    }

    const structuralValidationResult = validateStructureOfYamlFiles({
        files: parseResult.files,
        absolutePathToDefinition,
    });
    if (!structuralValidationResult.didSucceed) {
        return structuralValidationResult;
    }

    const processPackageMarkersResult = await processPackageMarkers({
        dependenciesConfiguration,
        structuralValidationResult,
        context,
        cliVersion,
    });
    if (!processPackageMarkersResult.didSucceed) {
        return processPackageMarkersResult;
    }

    return {
        didSucceed: true,
        workspace: {
            type: "fern",
            name: structuralValidationResult.rootApiFile.contents.name,
            absolutePathToWorkspace,
            absolutePathToDefinition,
            generatorsConfiguration,
            dependenciesConfiguration,
            docsConfiguration,
            definition: {
                rootApiFile: structuralValidationResult.rootApiFile,
                namedDefinitionFiles: structuralValidationResult.namedDefinitionFiles,
                packageMarkers: processPackageMarkersResult.packageMarkers,
                importedDefinitions: processPackageMarkersResult.importedDefinitions,
            },
        },
    };
}
