import { validateSchema } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { loadGeneratorsConfiguration } from "@fern-api/generators-configuration";
import { loadWorkspaceConfiguration, WORKSPACE_CONFIGURATION_FILENAME } from "@fern-api/workspace-configuration";
import { RootApiFileSchema } from "@fern-api/yaml-schema";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { ROOT_API_FILENAME } from "./constants";
import { listServiceFilesForWorkspace } from "./listServiceFilesForWorkspace";
import { listYamlFilesForWorkspace } from "./listYamlFilesForWorkspace";
import { parseYamlFiles } from "./parseYamlFiles";
import { WorkspaceLoader } from "./types/Result";
import { validateStructureOfYamlFiles } from "./validateStructureOfYamlFiles";

const DEFINITION_DIRECTORY = "definition";

export async function loadWorkspace({
    absolutePathToWorkspace,
    version,
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    version: 1 | 2;
}): Promise<WorkspaceLoader.Result> {
    if (version === 1) {
        const absolutePathToWorkspaceConfiguration = join(
            absolutePathToWorkspace,
            RelativeFilePath.of(WORKSPACE_CONFIGURATION_FILENAME)
        );
        const workspaceConfiguration = await loadWorkspaceConfiguration(absolutePathToWorkspaceConfiguration);

        const files = await listYamlFilesForWorkspace(workspaceConfiguration.absolutePathToDefinition);

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
                rootApiFile: {
                    name: workspaceConfiguration.name,
                },
                serviceFiles: structuralValidationResult.validatedFiles,
            },
        };
    }

    const generatorsConfiguration = await loadGeneratorsConfiguration({ absolutePathToWorkspace });
    const absolutePathToDefinition = join(absolutePathToWorkspace, RelativeFilePath.of(DEFINITION_DIRECTORY));
    const serviceFiles = await listServiceFilesForWorkspace(absolutePathToDefinition);

    const parseResult = await parseYamlFiles(serviceFiles);
    if (!parseResult.didSucceed) {
        return parseResult;
    }

    const structuralValidationResult = validateStructureOfYamlFiles(parseResult.files);
    if (!structuralValidationResult.didSucceed) {
        return structuralValidationResult;
    }

    const rootApiFile = await readFile(path.join(absolutePathToDefinition, ROOT_API_FILENAME));
    const parsedRootApiFile = yaml.load(rootApiFile.toString());
    const validatedRootApiFile = await validateSchema(RootApiFileSchema, parsedRootApiFile);

    return {
        didSucceed: true,
        workspace: {
            name: validatedRootApiFile.name,
            absolutePathToWorkspace,
            absolutePathToDefinition,
            generatorsConfiguration,
            rootApiFile: validatedRootApiFile,
            serviceFiles: structuralValidationResult.validatedFiles,
        },
    };
}
