import { loadDependenciesConfiguration } from "@fern-api/dependencies-configuration";
import { AbsoluteFilePath, getDirectoryContents, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loadGeneratorsConfiguration } from "@fern-api/generators-configuration";
import { DEFINITION_DIRECTORY } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { listYamlFilesForWorkspace } from "./listYamlFilesForWorkspace";
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
    const absolutePathToDefinition = join(absolutePathToWorkspace, RelativeFilePath.of(DEFINITION_DIRECTORY));

    const definitionDirectoryContents = await getDirectoryContents(absolutePathToDefinition, {
        fileExtensions: ["yml", "yaml", "json"],
    });
    if (
        definitionDirectoryContents.length === 1 &&
        definitionDirectoryContents[0] != null &&
        definitionDirectoryContents[0].type === "file" &&
        definitionDirectoryContents[0].name.startsWith("openapi")
    ) {
        const openApiSpec = definitionDirectoryContents[0];
        return {
            didSucceed: true,
            workspace: {
                type: "openapi",
                name: "api",
                absolutePathToWorkspace,
                absolutePathToDefinition,
                generatorsConfiguration,
                definition: {
                    path: RelativeFilePath.of(openApiSpec.name),
                    contents: openApiSpec.contents,
                    format: "yaml",
                },
            },
        };
    }

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
            definition: {
                rootApiFile: structuralValidationResult.rootApiFile,
                namedDefinitionFiles: structuralValidationResult.namedDefinitionFiles,
                packageMarkers: processPackageMarkersResult.packageMarkers,
                importedDefinitions: processPackageMarkersResult.importedDefinitions,
            },
        },
    };
}
