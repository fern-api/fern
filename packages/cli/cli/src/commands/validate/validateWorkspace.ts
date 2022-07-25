import { validateFernDefinition } from "@fern-api/validator";
import { loadWorkspaceDefinition } from "@fern-api/workspace-configuration";
import { parseWorkspaceDefinition, Workspace } from "@fern-api/workspace-parser";
import { logIssueInYaml } from "../../logger/logIssueInYaml";
import { handleFailedWorkspaceParserResult } from "../generate-ir/handleWorkspaceParserFailures";

export async function parseAndValidateWorkspace({
    absolutePathToWorkspaceDefinition,
}: {
    absolutePathToWorkspaceDefinition: string;
}): Promise<void> {
    const workspaceDefinition = await loadWorkspaceDefinition(absolutePathToWorkspaceDefinition);
    const parseResult = await parseWorkspaceDefinition({
        name: workspaceDefinition.name,
        absolutePathToDefinition: workspaceDefinition.absolutePathToDefinition,
    });
    if (!parseResult.didSucceed) {
        handleFailedWorkspaceParserResult(parseResult);
        throw new Error("Failed to parse workspace");
    }
    await validateWorkspace(parseResult.workspace);
}

export async function validateWorkspace(workspace: Workspace): Promise<void> {
    const violations = await validateFernDefinition(workspace);
    for (const violation of violations) {
        logIssueInYaml({
            severity: violation.severity,
            relativeFilePath: violation.relativeFilePath,
            breadcrumbs: violation.nodePath,
            title: violation.message,
        });
    }
    if (violations.length > 0) {
        throw new Error("Encounted validation issues.");
    }
}
