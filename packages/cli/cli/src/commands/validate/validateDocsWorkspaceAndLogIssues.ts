import { validateDocsWorkspace } from "@fern-api/docs-validator";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { logViolations } from "./logViolations";

export async function validateDocsWorkspaceWithoutExiting({
    workspace,
    context,
    logWarnings,
    logSummary = true
}: {
    workspace: DocsWorkspace;
    context: TaskContext;
    logWarnings: boolean;
    logSummary?: boolean;
}): Promise<{ hasErrors: boolean }> {
    const violations = await validateDocsWorkspace(workspace, context);
    const { hasErrors } = logViolations({ violations, context, logWarnings, logSummary });

    return { hasErrors };
}

export async function validateDocsWorkspaceAndLogIssues({
    workspace,
    context,
    logWarnings
}: {
    workspace: DocsWorkspace;
    context: TaskContext;
    logWarnings: boolean;
}): Promise<void> {
    const { hasErrors } = await validateDocsWorkspaceWithoutExiting({ workspace, context, logWarnings });

    if (hasErrors) {
        context.failAndThrow();
    }
}
