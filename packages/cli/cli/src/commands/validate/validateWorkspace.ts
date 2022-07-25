import { validateFernDefinition } from "@fern-api/validator";
import { loadWorkspaceConfiguration } from "@fern-api/workspace-configuration";
import { loadWorkspace, Workspace } from "@fern-api/workspace-loader";
import { logIssueInYaml } from "../../logger/logIssueInYaml";
import { handleFailedWorkspaceParserResult } from "../generate-ir/handleWorkspaceParserFailures";

export async function parseAndValidateWorkspace({
    absolutePathToWorkspaceConfiguration,
}: {
    absolutePathToWorkspaceConfiguration: string;
}): Promise<void> {
    const workspaceConfiguration = await loadWorkspaceConfiguration(absolutePathToWorkspaceConfiguration);
    const parseResult = await loadWorkspace({
        name: workspaceConfiguration.name,
        absolutePathToDefinition: workspaceConfiguration.absolutePathToConfiguration,
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
