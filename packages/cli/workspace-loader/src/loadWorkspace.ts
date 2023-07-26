import { loadDependenciesConfiguration } from "@fern-api/dependencies-configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loadGeneratorsConfiguration } from "@fern-api/generators-configuration";
import { DEFINITION_DIRECTORY, DOCS_DIRECTORY, OPENAPI_DIRECTORY } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { listFiles } from "./listFiles";
import { loadAndValidateOpenAPIDefinition } from "./loadAndValidateOpenAPIWorkspace";
import { loadDocsDefinition } from "./loadDocsDefinition";
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

    const absolutePathToDocsDefinition = join(absolutePathToWorkspace, RelativeFilePath.of(DOCS_DIRECTORY));
    const docsDefinition = await loadDocsDefinition({ absolutePathToDocsDefinition, context });

    const absolutePathToOpenAPIDefinition = join(absolutePathToWorkspace, RelativeFilePath.of(OPENAPI_DIRECTORY));
    const openApiDirectoryExists = await doesPathExist(absolutePathToOpenAPIDefinition);

    if (openApiDirectoryExists) {
        const openApiDefinition = await loadAndValidateOpenAPIDefinition(context, absolutePathToOpenAPIDefinition);
        return {
            didSucceed: true,
            workspace: {
                type: "openapi",
                name: "api",
                absoluteFilepath: absolutePathToWorkspace,
                generatorsConfiguration,
                docsDefinition,
                definition: openApiDefinition,
            },
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
            absoluteFilepath: absolutePathToWorkspace,
            generatorsConfiguration,
            dependenciesConfiguration,
            docsDefinition,
            definition: {
                absoluteFilepath: absolutePathToDefinition,
                rootApiFile: structuralValidationResult.rootApiFile,
                namedDefinitionFiles: structuralValidationResult.namedDefinitionFiles,
                packageMarkers: processPackageMarkersResult.packageMarkers,
                importedDefinitions: processPackageMarkersResult.importedDefinitions,
            },
        },
    };
}
