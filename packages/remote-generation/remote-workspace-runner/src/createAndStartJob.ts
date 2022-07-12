import { WorkspaceDefinition } from "@fern-api/commons";
import { CreateJobResponseBody } from "@fern-fern/fiddle-coordinator-api-client/model/remoteGen";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import axios from "axios";
import FormData from "form-data";
import { REMOTE_GENERATION_SERVICE } from "./service";

export async function createAndStartJob({
    workspaceDefinition,
    organization,
    intermediateRepresentation,
}: {
    workspaceDefinition: WorkspaceDefinition;
    organization: string;
    intermediateRepresentation: IntermediateRepresentation;
}): Promise<CreateJobResponseBody | undefined> {
    const job = await createJob({ workspaceDefinition, organization });
    try {
        await startJob({ intermediateRepresentation, job });
        return job;
    } catch (e) {
        return undefined;
    }
}

async function createJob({
    workspaceDefinition,
    organization,
}: {
    workspaceDefinition: WorkspaceDefinition;
    organization: string;
}) {
    const createResponse = await REMOTE_GENERATION_SERVICE.createJob({
        apiName: workspaceDefinition.name,
        orgName: organization,
        generators: workspaceDefinition.generators.map((generator) => ({
            id: generator.name,
            version: generator.version,
            // TODO delete this cast
            customConfig: generator.config as Record<string, string>,
        })),
    });

    if (!createResponse.ok) {
        throw new Error("Job did not succeed");
    }
    const job = createResponse.body;
    return job;
}

async function startJob({
    intermediateRepresentation,
    job,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    job: CreateJobResponseBody;
}) {
    const formData = new FormData();
    formData.append("file", JSON.stringify(intermediateRepresentation));
    await axios.post(
        `https://fiddle-coordinator-dev.buildwithfern.com/api/remote-gen/jobs/${job.jobId}/start`,
        formData,
        {
            headers: {
                "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
            },
        }
    );
}
