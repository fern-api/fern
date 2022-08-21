import { InteractiveTaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { createAndStartJob } from "./createAndStartJob";
import { pollJobAndReportStatus } from "./pollJobAndReportStatus";

export async function runRemoteGenerationForWorkspace({
    organization,
    workspace,
    intermediateRepresentation,
    context,
}: {
    organization: string;
    workspace: Workspace;
    intermediateRepresentation: IntermediateRepresentation;
    context: InteractiveTaskContext;
}): Promise<void> {
    if (workspace.generatorsConfiguration.generators.length === 0) {
        context.logger.warn("No generators specified.");
        return;
    }
    const job = await createAndStartJob({ workspace, organization, intermediateRepresentation });
    await Promise.all(
        job.taskIds.map(async (taskId, index) => {
            const generator = workspace.generatorsConfiguration.generators[index];
            if (generator == null) {
                context.logger.error("Task IDs list is longer than generators list.");
                context.fail();
            } else {
                await context.addInteractiveTask({
                    name: generator.name,
                    run: async (taskContext) => {
                        await pollJobAndReportStatus({ job, taskId, workspace, context: taskContext });
                    },
                });
            }
        })
    );
}
