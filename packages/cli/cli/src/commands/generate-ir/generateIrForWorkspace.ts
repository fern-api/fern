import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { TaskContext, TaskResult, TASK_FAILURE } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { validateWorkspaceAndLogIssues } from "../validate/validateWorkspaceAndLogIssues";

export async function generateIrForWorkspace({
    workspace,
    context,
}: {
    workspace: Workspace;
    context: TaskContext;
}): Promise<IntermediateRepresentation | TASK_FAILURE> {
    await validateWorkspaceAndLogIssues(workspace, context);
    if (context.getResult() === TaskResult.Failure) {
        return TASK_FAILURE;
    }
    return generateIntermediateRepresentation(workspace);
}
