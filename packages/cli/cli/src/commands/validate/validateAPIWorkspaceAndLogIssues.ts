import { TaskContext } from "@fern-api/task-context";
import { validateFernWorkspace } from "@fern-api/validator";
import { FernWorkspace } from "@fern-api/workspace-loader";
import validatePackageName from "validate-npm-package-name";
import { logViolations } from "./logViolations";

export async function validateAPIWorkspaceAndLogIssues({
    workspace,
    context,
    logWarnings
}: {
    workspace: FernWorkspace;
    context: TaskContext;
    logWarnings: boolean;
}): Promise<void> {
    if (!validatePackageName(workspace.name).validForNewPackages) {
        context.failAndThrow("Workspace name is not valid.");
    }

    const violations = await validateFernWorkspace(workspace, context.logger);
    const hasErrors = logViolations({ violations, context, logWarnings });

    if (hasErrors) {
        context.failAndThrow();
    }
}
