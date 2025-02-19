import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { validateOSSWorkspace } from "@fern-api/oss-validator";
import { TaskContext } from "@fern-api/task-context";

import { logViolations } from "./logViolations";

export async function validateOSSWorkspaceWithoutExiting({
    workspace,
    context,
    logWarnings,
    logSummary = true
}: {
    workspace: OSSWorkspace;
    context: TaskContext;
    logWarnings: boolean;
    logSummary?: boolean;
}): Promise<{ hasErrors: boolean }> {
    const startTime = performance.now();
    const violations = await validateOSSWorkspace(workspace, context);
    const elapsedMillis = performance.now() - startTime;
    const { hasErrors } = logViolations({ violations, context, logWarnings, logSummary, elapsedMillis });

    return { hasErrors };
}

export async function validateOSSWorkspaceAndLogIssues({
    workspace,
    context,
    logWarnings
}: {
    workspace: OSSWorkspace;
    context: TaskContext;
    logWarnings: boolean;
}): Promise<void> {
    const { hasErrors } = await validateOSSWorkspaceWithoutExiting({
        workspace,
        context,
        logWarnings
    });

    if (hasErrors) {
        context.failAndThrow();
    }
}
