import { listYamlFilesForWorkspace } from "./listYamlFilesForWorkspace";
import { parseYamlFiles } from "./parseYamlFiles";
import { WorkspaceParser } from "./types/Result";
import { validateStructureOfYamlFiles } from "./validateStructureOfYamlFiles";

export async function parseWorkspaceDefinition({
    name,
    absolutePathToDefinition,
}: {
    name: string | undefined;
    absolutePathToDefinition: string;
}): Promise<WorkspaceParser.Result> {
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
