import { loadDependenciesConfiguration } from "@fern-api/dependencies-configuration";
import { AbsoluteFilePath, doesPathExist, getDirectoryContents, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loadGeneratorsConfiguration } from "@fern-api/generators-configuration";
import { DEFINITION_DIRECTORY, OPENAPI_DIRECTORY } from "@fern-api/project-configuration";
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

    const absolutePathToOpenAPIDefinition = join(absolutePathToWorkspace, RelativeFilePath.of(OPENAPI_DIRECTORY));
    const openApiDirectoryExists = await doesPathExist(absolutePathToOpenAPIDefinition);

    if (openApiDirectoryExists) {
        const openApiDirectoryContents = await getDirectoryContents(absolutePathToOpenAPIDefinition, {
            fileExtensions: ["yml", "yaml", "json"],
        });
        if (
            openApiDirectoryContents.length === 1 &&
            openApiDirectoryContents[0] != null &&
            openApiDirectoryContents[0].type === "file"
        ) {
            const openApiSpec = openApiDirectoryContents[0];
            return {
                didSucceed: true,
                workspace: {
                    type: "openapi",
                    name: "api",
                    absolutePathToWorkspace,
                    absolutePathToDefinition: absolutePathToOpenAPIDefinition,
                    generatorsConfiguration,
                    definition: {
                        path: RelativeFilePath.of(openApiSpec.name),
                        contents: openApiSpec.contents,
                        format: "yaml",
                    },
                },
            };
        } else {
            return context.failAndThrow(
                "The openapi directory must contain a single file with your OpenAPI definition."
            );
        }
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
            definition: {
                rootApiFile: structuralValidationResult.rootApiFile,
                namedDefinitionFiles: structuralValidationResult.namedDefinitionFiles,
                packageMarkers: processPackageMarkersResult.packageMarkers,
                importedDefinitions: processPackageMarkersResult.importedDefinitions,
            },
        },
    };
}
