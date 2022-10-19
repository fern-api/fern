import { GeneratorInvocation } from "@fern-api/generators-configuration";
import { TaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-client";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import axios, { AxiosError } from "axios";
import FormData from "form-data";
import urlJoin from "url-join";
import { FIDDLE_ORIGIN, REMOTE_GENERATION_SERVICE } from "./service";
import { substituteEnvVariables } from "./substituteEnvVariables";

export async function createAndStartJob({
    workspace,
    organization,
    intermediateRepresentation,
    generatorInvocation,
    version,
    context,
}: {
    workspace: Workspace;
    organization: string;
    intermediateRepresentation: IntermediateRepresentation;
    generatorInvocation: GeneratorInvocation;
    version: string | undefined;
    context: TaskContext;
}): Promise<FernFiddle.remoteGen.CreateJobResponse> {
    const job = await createJob({ workspace, organization, generatorInvocation, version, context });
    await startJob({ intermediateRepresentation, job, context });
    return job;
}

async function createJob({
    workspace,
    organization,
    generatorInvocation,
    version,
    context,
}: {
    workspace: Workspace;
    organization: string;
    generatorInvocation: GeneratorInvocation;
    version: string | undefined;
    context: TaskContext;
}): Promise<FernFiddle.remoteGen.CreateJobResponse> {
    const generatorConfig: FernFiddle.GeneratorConfigV2 = {
        id: generatorInvocation.name,
        version: generatorInvocation.version,
        outputMode: generatorInvocation.outputMode,
        customConfig: generatorInvocation.config,
    };
    const generatorConfigsWithEnvVarSubstitutions = substituteEnvVariables(generatorConfig, context);
    const createResponse = await REMOTE_GENERATION_SERVICE.remoteGen.createJobV2({
        apiName: workspace.name,
        version,
        organizationName: organization,
        generators: [generatorConfigsWithEnvVarSubstitutions],
    });

    if (!createResponse.ok) {
        return createResponse.error._visit({
            illegalApiNameError: () => {
                return context.failAndThrow("API name is invalid: " + workspace.name);
            },
            generatorsDoNotExistError: (value) => {
                return context.failAndThrow(
                    "Generators do not exist: " +
                        value.nonExistentGenerators
                            .map((generator) => `${generator.id}@${generator.version}`)
                            .join(", ")
                );
            },
            _other: (content) => {
                return context.failAndThrow("Failed to create job", content);
            },
        });
    }

    return createResponse.body;
}

async function startJob({
    intermediateRepresentation,
    job,
    context,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    job: FernFiddle.remoteGen.CreateJobResponse;
    context: TaskContext;
}): Promise<void> {
    const formData = new FormData();
    formData.append("file", JSON.stringify(intermediateRepresentation));
    const url = urlJoin(FIDDLE_ORIGIN, `/api/remote-gen/jobs/${job.jobId}/start`);
    try {
        await axios.post(url, formData, {
            headers: {
                "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
            },
        });
    } catch (error) {
        const errorBody = error instanceof AxiosError ? error.response?.data : error;
        context.failAndThrow("Failed to start job", errorBody);
    }
}
