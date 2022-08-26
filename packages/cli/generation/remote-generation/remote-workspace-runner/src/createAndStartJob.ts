import { Workspace } from "@fern-api/workspace-loader";
import { Fiddle } from "@fern-fern/fiddle-client-v2";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import axios from "axios";
import FormData from "form-data";
import urlJoin from "url-join";
import { FIDDLE_ORIGIN, REMOTE_GENERATION_SERVICE } from "./service";

export async function createAndStartJob({
    workspace,
    organization,
    intermediateRepresentation,
}: {
    workspace: Workspace;
    organization: string;
    intermediateRepresentation: IntermediateRepresentation;
}): Promise<Fiddle.remoteGen.CreateJobResponse> {
    const job = await createJob({ workspace, organization });
    await startJob({ intermediateRepresentation, job });
    return job;
}

async function createJob({ workspace, organization }: { workspace: Workspace; organization: string }) {
    const createResponse = await REMOTE_GENERATION_SERVICE.remoteGen.createJob({
        apiName: workspace.name,
        organizationName: organization,
        generators: workspace.generatorsConfiguration.draft.map((generator) => ({
            id: generator.name,
            version: generator.version,
            willDownloadFiles: generator.absolutePathToLocalOutput != null,
            customConfig: generator.config,
            outputs: {
                npm: undefined,
                maven: undefined,
            },
        })),
        version: undefined,
    });

    if (!createResponse.ok) {
        return createResponse.error._visit({
            illegalApiNameError: () => {
                throw new Error("API name is invalid: " + workspace.name);
            },
            generatorsDoNotExistError: (value) => {
                throw new Error(
                    "Generators do not exist: " +
                        value.nonExistentGenerators
                            .map((generator) => `${generator.id}@${generator.version}`)
                            .join(", ")
                );
            },
            _network: () => {
                throw new Error("Network Error: " + JSON.stringify(createResponse.error));
            },
            _unknown: () => {
                throw new Error("Unknown Error: " + JSON.stringify(createResponse.error));
            },
        });
    }

    const job = createResponse.body;
    return job;
}

async function startJob({
    intermediateRepresentation,
    job,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    job: Fiddle.remoteGen.CreateJobResponse;
}) {
    const formData = new FormData();
    formData.append("file", JSON.stringify(intermediateRepresentation));
    const url = urlJoin(FIDDLE_ORIGIN, `/api/remote-gen/jobs/${job.jobId}/start`);
    await axios.post(url, formData, {
        headers: {
            "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
        },
    });
}
