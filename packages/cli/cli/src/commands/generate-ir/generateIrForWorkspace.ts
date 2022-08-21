import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { TaskContext, TaskResult } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { validateWorkspaceAndLogIssues } from "../validate/validateWorkspaceAndLogIssues";

export async function generateIrForWorkspace({
    workspace,
    context,
}: {
    workspace: Workspace;
    context: TaskContext;
}): Promise<IntermediateRepresentation | undefined> {
    await validateWorkspaceAndLogIssues(workspace, context);
    if (context.getResult() === TaskResult.Failure) {
        return undefined;
    }
    return generateIntermediateRepresentation(workspace);
}
