import { TaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { CreateJobResponse } from "@fern-fern/fiddle-coordinator-api-client/model/remoteGen";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { AxiosError } from "axios";
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
    context: TaskContext;
}): Promise<void> {
    if (workspace.generatorsConfiguration.draft.length === 0) {
        context.logger.warn("No generators specified.");
        return;
    }

    let job: CreateJobResponse;
    try {
        job = await createAndStartJob({ workspace, organization, intermediateRepresentation });
    } catch (e) {
        let str = "Failed to create job";
        if (e instanceof AxiosError && e.response?.data != null) {
            str += ` ${JSON.stringify(e.response.data)}`;
        }
        context.fail(str);
        return;
    }

    await pollJobAndReportStatus({
        job,
        workspace,
        context,
    });
}
