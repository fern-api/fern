import { validateWorkspace } from "@fern-api/validator";
import { Workspace } from "@fern-api/workspace-loader";
import { logIssueInYaml } from "../../logger/logIssueInYaml";

export async function validateWorkspaceAndLogIssues(workspace: Workspace): Promise<void> {
    const violations = await validateWorkspace(workspace);
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
