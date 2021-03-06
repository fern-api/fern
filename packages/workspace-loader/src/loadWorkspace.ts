import { listYamlFilesForWorkspace } from "./listYamlFilesForWorkspace";
import { parseYamlFiles } from "./parseYamlFiles";
import { WorkspaceLoader } from "./types/Result";
import { validateStructureOfYamlFiles } from "./validateStructureOfYamlFiles";

export async function loadWorkspace({
    name,
    absolutePathToDefinition,
}: {
    name: string | undefined;
    absolutePathToDefinition: string;
}): Promise<WorkspaceLoader.Result> {
    const files = await listYamlFilesForWorkspace(absolutePathToDefinition);

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
            name,
            absolutePath: absolutePathToDefinition,
            files: structuralValidationResult.validatedFiles,
        },
    };
}
