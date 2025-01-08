import { APIWorkspaceLoader, validateDocsWorkspace } from "@fern-api/docs-validator";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";

import { logViolations } from "./logViolations";

export async function validateDocsWorkspaceWithoutExiting({
    workspace,
    loadAPIWorkspace,
    context,
    logWarnings,
    logSummary = true
}: {
    workspace: DocsWorkspace;
    loadAPIWorkspace: APIWorkspaceLoader;
    context: TaskContext;
    logWarnings: boolean;
    logSummary?: boolean;
}): Promise<{ hasErrors: boolean }> {
    const violations = await validateDocsWorkspace(workspace, context, loadAPIWorkspace);
    const { hasErrors } = logViolations({ violations, context, logWarnings, logSummary });

    return { hasErrors };
}

export async function validateDocsWorkspaceAndLogIssues({
    workspace,
    loadAPIWorkspace,
    context,
    logWarnings
}: {
    workspace: DocsWorkspace;
    loadAPIWorkspace: APIWorkspaceLoader;
    context: TaskContext;
    logWarnings: boolean;
}): Promise<void> {
    const { hasErrors } = await validateDocsWorkspaceWithoutExiting({
        workspace,
        context,
        logWarnings,
        loadAPIWorkspace
    });

    if (hasErrors) {
        context.failAndThrow();
    }
}
