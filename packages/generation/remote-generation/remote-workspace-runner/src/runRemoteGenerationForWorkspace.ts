import { Workspace } from "@fern-api/workspace-loader";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { createAndStartJob } from "./createAndStartJob";
import { pollJobAndReportStatus } from "./pollJobAndReportStatus";

export async function runRemoteGenerationForWorkspace({
    organization,
    workspace,
    intermediateRepresentation,
}: {
    organization: string;
    workspace: Workspace;
    intermediateRepresentation: IntermediateRepresentation;
}): Promise<void> {
    if (workspace.generatorsConfiguration.generators.length === 0) {
        throw new Error("No generators specified.");
    }
    const job = await createAndStartJob({ workspace, organization, intermediateRepresentation });
    await pollJobAndReportStatus({ job, workspace });
}
