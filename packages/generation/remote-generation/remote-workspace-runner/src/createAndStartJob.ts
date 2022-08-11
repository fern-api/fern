import { Workspace } from "@fern-api/workspace-loader";
import { CreateJobErrorBody, CreateJobResponse } from "@fern-fern/fiddle-coordinator-api-client/model";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import axios from "axios";
import FormData from "form-data";
import urlJoin from "url-join";
import { FIDDLE_API_URL, REMOTE_GENERATION_SERVICE } from "./service";

export async function createAndStartJob({
    workspace,
    organization,
    intermediateRepresentation,
}: {
    workspace: Workspace;
    organization: string;
    intermediateRepresentation: IntermediateRepresentation;
}): Promise<CreateJobResponse> {
    const job = await createJob({ workspace, organization });
    await startJob({ intermediateRepresentation, job });
    return job;
}

async function createJob({ workspace, organization }: { workspace: Workspace; organization: string }) {
    const createResponse = await REMOTE_GENERATION_SERVICE.createJob({
        apiName: workspace.name,
        organizationName: organization,
        generators: workspace.generatorsConfiguration.generators.map((generator) => ({
            id: generator.name,
            version: generator.version,
            willDownloadFiles: generator.generate?.absolutePathToLocalOutput != null,
            customConfig: generator.config,
        })),
    });

    if (!createResponse.ok) {
        CreateJobErrorBody._visit(createResponse.error, {
            IllegalApiNameError: () => {
                throw new Error("API name is invalid: " + workspace.name);
            },
            GeneratorsDoNotExistError: (errors) => {
                throw new Error(
                    "Generators do not exist: " + errors.map((error) => `${error.id}@${error.version}`).join(", ")
                );
            },
            _unknown: () => {
                throw new Error("Unknown Error: " + JSON.stringify(createResponse.error));
            },
        });
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
    job: CreateJobResponse;
}) {
    const formData = new FormData();
    formData.append("file", JSON.stringify(intermediateRepresentation));
    const url = urlJoin(FIDDLE_API_URL, `/remote-gen/jobs/${job.jobId}/start`);
    await axios.post(url, formData, {
        headers: {
            "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
        },
    });
}
