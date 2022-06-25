import { WorkspaceDefinition } from "@fern-api/commons";
import { Compiler } from "@fern-api/compiler";
import { RemoteGenerationService } from "@fern-fern/fiddle-coordinator-api-client/lib/cjs/services/remoteGen";

const REMOTE_GENERATION_SERVICE = new RemoteGenerationService({
    origin: "https://fiddle-coordinator-dev.buildwithfern.com/api",
});

export async function runRemoteGenerationForWorkspace({
    workspaceDefinition,
    compileResult,
}: {
    workspaceDefinition: WorkspaceDefinition;
    compileResult: Compiler.SuccessfulResult;
}): Promise<void> {
    if (workspaceDefinition.generators.length === 0) {
        return;
    }

    const response = await REMOTE_GENERATION_SERVICE.createJob({
        apiName: workspaceDefinition.name,
        orgName: "fern-fern",
        generators: workspaceDefinition.generators.map((generator) => ({
            id: generator.name,
            version: generator.version,
            // TODO delete this case
            customConfig: generator.config as Record<string, string>,
        })),
    });

    if (!response.ok) {
        throw new Error("Job did not succeed");
    }
    const job = response.body;

    const formData = new FormData();
    formData.append("file", JSON.stringify(compileResult.intermediateRepresentation));
    await fetch(`https://fiddle-coordinator-dev.buildwithfern.com/api/remote-gen/jobs/${job.jobId}/start`, {
        body: formData,
    });
}
