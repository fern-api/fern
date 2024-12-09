import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { validateGeneratorsWorkspace } from "@fern-api/generators-validator";
import { logViolations } from "./logViolations";

export async function validateGeneratorsWorkspaceWithoutExiting({
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
    const violations = await validateGeneratorsWorkspace(workspace, context.logger);
    const { hasErrors } = logViolations({ violations, context, logWarnings, logSummary });

    return { hasErrors };
}

export async function validateGeneratorsWorkspaceAndLogIssues({
    workspace,
    context,
    logWarnings
}: {
    workspace: FernWorkspace;
    context: TaskContext;
    logWarnings: boolean;
}): Promise<void> {
    const { hasErrors } = await validateGeneratorsWorkspaceWithoutExiting({
        workspace,
        context,
        logWarnings
    });

    if (hasErrors) {
        context.failAndThrow();
    }
}