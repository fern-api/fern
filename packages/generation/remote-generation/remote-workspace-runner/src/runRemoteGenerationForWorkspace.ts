import { WorkspaceConfiguration } from "@fern-api/workspace-configuration";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { createAndStartJob } from "./createAndStartJob";
import { pollJobAndReportStatus } from "./pollJobAndReportStatus";

export async function runRemoteGenerationForWorkspace({
    organization,
    workspaceConfiguration,
    intermediateRepresentation,
}: {
    organization: string;
    workspaceConfiguration: WorkspaceConfiguration;
    intermediateRepresentation: IntermediateRepresentation;
}): Promise<void> {
    if (workspaceConfiguration.generators.length === 0) {
        console.log("No generators specified.");
        return;
    }

    const job = await createAndStartJob({ workspaceConfiguration, organization, intermediateRepresentation });
    if (job == null) {
        console.log("Failed to start job.");
        return;
    }

    await pollJobAndReportStatus({ job, workspaceConfiguration });
}
