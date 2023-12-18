import { validateDocsWorkspace } from "@fern-api/docs-validator";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { logViolations } from "./logViolations";

export async function validateDocsWorkspaceAndLogIssues({
    workspace,
    context,
    logWarnings
}: {
    workspace: DocsWorkspace;
    context: TaskContext;
    logWarnings: boolean;
}): Promise<void> {
    const violations = await validateDocsWorkspace(workspace, context.logger);
    const { hasErrors } = logViolations({ violations, context, logWarnings });

    if (hasErrors) {
        context.failAndThrow();
    }
}
