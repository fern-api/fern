import { validateSchema } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { loadGeneratorsConfiguration } from "@fern-api/generators-configuration";
import { DEFINITION_DIRECTORY, ROOT_API_FILENAME } from "@fern-api/project-configuration";
import { RootApiFileSchema } from "@fern-api/yaml-schema";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { listServiceFilesForWorkspace } from "./listServiceFilesForWorkspace";
import { parseYamlFiles } from "./parseYamlFiles";
import { WorkspaceLoader } from "./types/Result";
import { validateStructureOfYamlFiles } from "./validateStructureOfYamlFiles";

export async function loadWorkspace({
    pathToFernDirectory,
    pathToWorkspace,
}: {
    pathToFernDirectory: AbsoluteFilePath;
    pathToWorkspace: AbsoluteFilePath;
}): Promise<WorkspaceLoader.Result> {
    const generatorsConfiguration = await loadGeneratorsConfiguration({ pathToWorkspace, pathToFernDirectory });
    const pathToDefinition = join(pathToWorkspace, RelativeFilePath.of(DEFINITION_DIRECTORY));
    const serviceFiles = await listServiceFilesForWorkspace(pathToDefinition);

    const parseResult = await parseYamlFiles(serviceFiles);
    if (!parseResult.didSucceed) {
        return parseResult;
    }

    const structuralValidationResult = validateStructureOfYamlFiles(parseResult.files);
    if (!structuralValidationResult.didSucceed) {
        return structuralValidationResult;
    }

    const rootApiFile = await readFile(path.join(pathToDefinition, ROOT_API_FILENAME));
    const parsedRootApiFile = yaml.load(rootApiFile.toString());
    const validatedRootApiFile = await validateSchema(RootApiFileSchema, parsedRootApiFile);

    return {
        didSucceed: true,
        workspace: {
            name: validatedRootApiFile.name,
            pathToWorkspace,
            pathToDefinition,
            generatorsConfiguration,
            rootApiFile: validatedRootApiFile,
            serviceFiles: structuralValidationResult.validatedFiles,
        },
    };
}
