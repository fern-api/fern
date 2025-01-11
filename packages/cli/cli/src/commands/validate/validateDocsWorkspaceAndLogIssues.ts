import { APIWorkspaceLoader, validateDocsWorkspace } from "@fern-api/docs-validator";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";

import { logViolations } from "./logViolations";

export async function validateDocsWorkspaceWithoutExiting({
    workspace,
    fernWorkspaces,
    context,
    logWarnings,
    errorOnBrokenLinks,
    logSummary = true
}: {
    workspace: DocsWorkspace;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    logWarnings: boolean;
    errorOnBrokenLinks?: boolean;
    logSummary?: boolean;
}): Promise<{ hasErrors: boolean }> {
    const violations = await validateDocsWorkspace(workspace, context, fernWorkspaces);
    let { hasErrors } = logViolations({ violations, context, logWarnings, logSummary });

    if (errorOnBrokenLinks) {
        hasErrors = hasErrors || violations.some((violation) => violation.name === "valid-markdown-links");
    }

    return { hasErrors };
}

export async function validateDocsWorkspaceAndLogIssues({
    workspace,
    fernWorkspaces,
    context,
    logWarnings,
    errorOnBrokenLinks
}: {
    workspace: DocsWorkspace;
    fernWorkspaces: FernWorkspace[];
    context: TaskContext;
    logWarnings: boolean;
    errorOnBrokenLinks?: boolean;
}): Promise<void> {
    const { hasErrors } = await validateDocsWorkspaceWithoutExiting({
        workspace,
        context,
        logWarnings,
        fernWorkspaces,
        errorOnBrokenLinks
    });

    if (hasErrors) {
        context.failAndThrow();
    }
}
