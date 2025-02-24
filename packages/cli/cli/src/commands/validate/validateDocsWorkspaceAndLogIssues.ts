import { validateDocsWorkspace } from "@fern-api/docs-validator";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";

import { logViolations } from "./logViolations";

export async function validateDocsWorkspaceWithoutExiting({
    workspace,
    fernWorkspaces,
    ossWorkspaces,
    context,
    logWarnings,
    errorOnBrokenLinks,
    logSummary = true
}: {
    workspace: DocsWorkspace;
    fernWorkspaces: FernWorkspace[];
    ossWorkspaces: OSSWorkspace[];
    context: TaskContext;
    logWarnings: boolean;
    errorOnBrokenLinks?: boolean;
    logSummary?: boolean;
}): Promise<{ hasErrors: boolean }> {
    const startTime = performance.now();
    const violations = await validateDocsWorkspace(workspace, context, fernWorkspaces, ossWorkspaces);
    const elapsedMillis = performance.now() - startTime;
    let { hasErrors } = logViolations({ violations, context, logWarnings, logSummary, elapsedMillis });

    if (errorOnBrokenLinks) {
        hasErrors = hasErrors || violations.some((violation) => violation.name === "valid-markdown-links");
    }

    return { hasErrors };
}

export async function validateDocsWorkspaceAndLogIssues({
    workspace,
    fernWorkspaces,
    ossWorkspaces,
    context,
    logWarnings,
    errorOnBrokenLinks
}: {
    workspace: DocsWorkspace;
    fernWorkspaces: FernWorkspace[];
    ossWorkspaces: OSSWorkspace[];
    context: TaskContext;
    logWarnings: boolean;
    errorOnBrokenLinks?: boolean;
}): Promise<void> {
    const { hasErrors } = await validateDocsWorkspaceWithoutExiting({
        workspace,
        context,
        logWarnings,
        fernWorkspaces,
        ossWorkspaces,
        errorOnBrokenLinks
    });

    if (hasErrors) {
        context.failAndThrow();
    }
}
