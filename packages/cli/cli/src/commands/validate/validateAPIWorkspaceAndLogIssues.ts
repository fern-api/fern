import { TaskContext } from "@fern-api/task-context";
import { validateFernWorkspace } from "@fern-api/validator";
import { FernWorkspace } from "@fern-api/workspace-loader";
import validatePackageName from "validate-npm-package-name";
import { logViolations } from "./logViolations";

export async function validateAPIWorkspaceWithoutExiting({
    workspace,
    context,
    logWarnings,
    logSummary = true
}: {
    workspace: FernWorkspace;
    context: TaskContext;
    logWarnings: boolean;
    logSummary?: boolean;
}): Promise<{ hasErrors: boolean }> {
    const violations = await validateFernWorkspace(workspace, context.logger);
    const { hasErrors } = logViolations({ violations, context, logWarnings, logSummary });

    return { hasErrors };
}

export async function validateAPIWorkspaceAndLogIssues({
    workspace,
    context,
    logWarnings
}: {
    workspace: FernWorkspace;
    context: TaskContext;
    logWarnings: boolean;
}): Promise<void> {
    if (!validatePackageName(workspace.definition.rootApiFile.contents.name).validForNewPackages) {
        context.failAndThrow("API name is not valid.");
    }

    const { hasErrors } = await validateAPIWorkspaceWithoutExiting({ workspace, context, logWarnings });

    if (hasErrors) {
        context.failAndThrow();
    }
}
