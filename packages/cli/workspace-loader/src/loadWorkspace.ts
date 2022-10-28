import { validateSchema } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { loadGeneratorsConfiguration } from "@fern-api/generators-configuration";
import { DEFINITION_DIRECTORY, ROOT_API_FILENAME } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { RootApiFileSchema } from "@fern-api/yaml-schema";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { listServiceFilesForWorkspace } from "./listServiceFilesForWorkspace";
import { parseYamlFiles } from "./parseYamlFiles";
import { WorkspaceLoader } from "./types/Result";
import { validateStructureOfYamlFiles } from "./validateStructureOfYamlFiles";

export async function loadWorkspace({
    absolutePathToWorkspace,
    context,
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
}): Promise<WorkspaceLoader.Result> {
    const generatorsConfiguration = await loadGeneratorsConfiguration({ absolutePathToWorkspace, context });
    const absolutePathToDefinition = join(absolutePathToWorkspace, DEFINITION_DIRECTORY);
    const serviceFiles = await listServiceFilesForWorkspace(absolutePathToDefinition);

    const parseResult = await parseYamlFiles(serviceFiles);
    if (!parseResult.didSucceed) {
        return parseResult;
    }

    const structuralValidationResult = validateStructureOfYamlFiles(parseResult.files);
    if (!structuralValidationResult.didSucceed) {
        return structuralValidationResult;
    }

    const rootApiFilepath = path.join(absolutePathToDefinition, ROOT_API_FILENAME);
    const rootApiFile = await readFile(rootApiFilepath);
    const parsedRootApiFile = yaml.load(rootApiFile.toString());
    const validatedRootApiFile = await validateSchema({
        schema: RootApiFileSchema,
        value: parsedRootApiFile,
        context,
        filepathBeingParsed: rootApiFilepath,
    });

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
