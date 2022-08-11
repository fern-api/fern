import { loadGeneratorsConfiguration } from "@fern-api/generators-configuration";
import { loadWorkspaceConfiguration, WORKSPACE_CONFIGURATION_FILENAME } from "@fern-api/workspace-configuration";
import path from "path";
import { listYamlFilesForWorkspace } from "./listYamlFilesForWorkspace";
import { listYamlFilesForWorkspaceV2 } from "./listYamlFilesForWorkspaceV2";
import { parseYamlFiles } from "./parseYamlFiles";
import { WorkspaceLoader } from "./types/Result";
import { validateStructureOfYamlFiles } from "./validateStructureOfYamlFiles";

const DEFINITION_DIRECTORY = "definition";

export async function loadWorkspace({
    absolutePathToWorkspace,
    version,
}: {
    absolutePathToWorkspace: string;
    version: 1 | 2;
}): Promise<WorkspaceLoader.Result> {
    if (version === 1) {
        const absolutePathToWorkspaceConfiguration = path.join(
            absolutePathToWorkspace,
            WORKSPACE_CONFIGURATION_FILENAME
        );
        const workspaceConfiguration = await loadWorkspaceConfiguration(absolutePathToWorkspaceConfiguration);

        const files = await listYamlFilesForWorkspace(
            path.resolve(absolutePathToWorkspace, workspaceConfiguration.absolutePathToDefinition)
        );

        const parseResult = await parseYamlFiles(files);
        if (!parseResult.didSucceed) {
            return parseResult;
        }

        const structuralValidationResult = validateStructureOfYamlFiles(parseResult.files);
        if (!structuralValidationResult.didSucceed) {
            return structuralValidationResult;
        }

        return {
            didSucceed: true,
            workspace: {
                name: workspaceConfiguration.name,
                absolutePathToWorkspace,
                absolutePathToDefinition: workspaceConfiguration.absolutePathToDefinition,
                generatorsConfiguration: {
                    absolutePathToConfiguration: absolutePathToWorkspaceConfiguration,
                    generators: workspaceConfiguration.generators,
                },
                rootApiFile: {},
                serviceFiles: structuralValidationResult.validatedFiles,
            },
        };
    }

    const generatorsConfiguration = await loadGeneratorsConfiguration({ absolutePathToWorkspace });
    const absolutePathToDefinition = path.resolve(absolutePathToWorkspace, DEFINITION_DIRECTORY);
    const files = await listYamlFilesForWorkspaceV2(absolutePathToDefinition);

    const parseResult = await parseYamlFiles(files.serviceFiles);
    if (!parseResult.didSucceed) {
        return parseResult;
    }

    const structuralValidationResult = validateStructureOfYamlFiles(parseResult.files);
    if (!structuralValidationResult.didSucceed) {
        return structuralValidationResult;
    }

    return {
        didSucceed: true,
        workspace: {
            name: "workspace",
            absolutePathToWorkspace,
            absolutePathToDefinition,
            generatorsConfiguration,
            rootApiFile: {},
            serviceFiles: structuralValidationResult.validatedFiles,
        },
    };
}
