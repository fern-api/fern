import { WorkspaceDefinition } from "@fern-api/workspace-configuration";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { createAndStartJob } from "./createAndStartJob";
import { pollJobAndReportStatus } from "./pollJobAndReportStatus";

export async function runRemoteGenerationForWorkspace({
    organization,
    workspaceDefinition,
    intermediateRepresentation,
}: {
    organization: string;
    workspaceDefinition: WorkspaceDefinition;
    intermediateRepresentation: IntermediateRepresentation;
}): Promise<void> {
    if (workspaceDefinition.generators.length === 0) {
        console.log("No generators specified.");
        return;
    }

    const job = await createAndStartJob({ workspaceDefinition, organization, intermediateRepresentation });
    if (job == null) {
        console.log("Failed to start job.");
        return;
    }

    await pollJobAndReportStatus({ job, workspaceDefinition });
}
