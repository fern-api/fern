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
        throw new Error("No generators specified.");
    }
    const job = await createAndStartJob({ workspaceConfiguration, organization, intermediateRepresentation });
    await pollJobAndReportStatus({ job, workspaceConfiguration });
}
