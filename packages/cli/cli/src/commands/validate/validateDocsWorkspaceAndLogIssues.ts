import { APIWorkspaceLoader, validateDocsWorkspace } from "@fern-api/docs-validator";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";

import { logViolations } from "./logViolations";

export async function validateDocsWorkspaceWithoutExiting({
    workspace,
    fernWorkspaces,
    context,
    logWarnings,
    logSummary = true
}: {
    workspace: DocsWorkspace;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    logWarnings: boolean;
    logSummary?: boolean;
}): Promise<{ hasErrors: boolean }> {
    const violations = await validateDocsWorkspace(workspace, context, fernWorkspaces);
    const { hasErrors } = logViolations({ violations, context, logWarnings, logSummary });

    return { hasErrors };
}

export async function validateDocsWorkspaceAndLogIssues({
    workspace,
    fernWorkspaces,
    context,
    logWarnings
}: {
    workspace: DocsWorkspace;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    logWarnings: boolean;
}): Promise<void> {
    const { hasErrors } = await validateDocsWorkspaceWithoutExiting({
        workspace,
        context,
        logWarnings,
        fernWorkspaces
    });

    if (hasErrors) {
        context.failAndThrow();
    }
}
