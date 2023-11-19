import { FernToken } from "@fern-api/auth";
import { createFiddleService, getFiddleOrigin } from "@fern-api/core";
import { stringifyLargeObject } from "@fern-api/fs-utils";
import { GeneratorInvocation } from "@fern-api/generators-configuration";
import { migrateIntermediateRepresentationForGenerator } from "@fern-api/ir-migrations";
import { TaskContext } from "@fern-api/task-context";
import { APIWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { Fetcher } from "@fern-fern/fiddle-sdk/core";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import axios, { AxiosError } from "axios";
import FormData from "form-data";
import urlJoin from "url-join";
import { substituteEnvVariables } from "./substituteEnvVariables";

export async function createAndStartJob({
    workspace,
    organization,
    intermediateRepresentation,
    generatorInvocation,
    version,
    context,
    shouldLogS3Url,
    token,
}: {
    workspace: APIWorkspace;
    organization: string;
    intermediateRepresentation: IntermediateRepresentation;
    generatorInvocation: GeneratorInvocation;
    version: string | undefined;
    context: TaskContext;
    shouldLogS3Url: boolean;
    token: FernToken;
}): Promise<FernFiddle.remoteGen.CreateJobResponse> {
    const job = await createJob({
        workspace,
        organization,
        generatorInvocation,
        version,
        context,
        shouldLogS3Url,
        token,
    });
    await startJob({ intermediateRepresentation, job, context, generatorInvocation });
    return job;
}

async function createJob({
    workspace,
    organization,
    generatorInvocation,
    version,
    context,
    shouldLogS3Url,
    token,
}: {
    workspace: APIWorkspace;
    organization: string;
    generatorInvocation: GeneratorInvocation;
    version: string | undefined;
    context: TaskContext;
    shouldLogS3Url: boolean;
    token: FernToken;
}): Promise<FernFiddle.remoteGen.CreateJobResponse> {
    const generatorConfig: FernFiddle.GeneratorConfigV2 = {
        id: generatorInvocation.name,
        version: generatorInvocation.version,
        outputMode: generatorInvocation.outputMode,
        customConfig: generatorInvocation.config,
    };
    const generatorConfigsWithEnvVarSubstitutions = substituteEnvVariables(generatorConfig, context);

    const remoteGenerationService = createFiddleService({ token: token.value });

    const createResponse = await remoteGenerationService.remoteGen.createJobV3({
        apiName: workspace.name,
        version,
        organizationName: organization,
        generators: [generatorConfigsWithEnvVarSubstitutions],
        uploadToS3: shouldLogS3Url || generatorConfigsWithEnvVarSubstitutions.outputMode.type === "downloadFiles",
    });

    if (!createResponse.ok) {
        return convertCreateJobError(createResponse.error as unknown as Fetcher.Error)._visit({
            illegalApiNameError: () => {
                return context.failAndThrow("API name is invalid: " + workspace.name);
            },
            cannotPublishToNpmScope: ({ validScope, invalidScope }) => {
                return context.failAndThrow(
                    `You do not have permission to publish to ${invalidScope} (expected ${validScope})`
                );
            },
            cannotPublishToMavenGroup: ({ validGroup, invalidGroup }) => {
                return context.failAndThrow(
                    `You do not have permission to publish to ${invalidGroup} (expected ${validGroup})`
                );
            },
            cannotPublishPypiPackage: ({ validPrefix, invalidPackageName }) => {
                return context.failAndThrow(
                    `You do not have permission to publish to ${invalidPackageName} (expected ${validPrefix})`
                );
            },
            generatorsDoNotExistError: (value) => {
                return context.failAndThrow(
                    "Generators do not exist: " +
                        value.nonExistentGenerators
                            .map((generator) => `${generator.id}@${generator.version}`)
                            .join(", ")
                );
            },
            insufficientPermissions: () => {
                return context.failAndThrow("Insufficient permissions.");
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
    generatorInvocation,
    job,
    context,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    generatorInvocation: GeneratorInvocation;
    job: FernFiddle.remoteGen.CreateJobResponse;
    context: TaskContext;
}): Promise<void> {
    const migratedIntermediateRepresentation = await migrateIntermediateRepresentationForGenerator({
        intermediateRepresentation,
        context,
        targetGenerator: {
            name: generatorInvocation.name,
            version: generatorInvocation.version,
        },
    });

    const formData = new FormData();

    const irAsString = await stringifyLargeObject(migratedIntermediateRepresentation, {
        onWrite: (irFilepath) => {
            context.logger.debug("Wrote IR to disk: " + irFilepath);
        },
    });
    formData.append("file", irAsString);

    const url = urlJoin(getFiddleOrigin(), `/api/remote-gen/jobs/${job.jobId}/start`);
    try {
        await axios.post(url, formData, {
            headers: formData.getHeaders(),
            // HACK: the IR should be more compact and scale linearly with API size
            maxBodyLength: Infinity,
        });
    } catch (error) {
        const errorBody = error instanceof AxiosError ? error.response?.data : error;
        context.logger.debug(`POST ${url} failed with ${JSON.stringify(error)}`);
        context.failAndThrow("Failed to start job", errorBody);
    }
}

// Fiddle is on the old version of error serialization. Until we upgrade the
// java generator to support the new implementation, we manually migrate
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertCreateJobError(error: any): FernFiddle.remoteGen.createJobV3.Error {
    if (error?.reason === "status-code") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body = error.body as any;
        switch (body?._error) {
            case "IllegalApiNameError":
                return FernFiddle.remoteGen.createJobV3.Error.illegalApiNameError();
            case "GeneratorsDoNotExistError":
                return FernFiddle.remoteGen.createJobV3.Error.generatorsDoNotExistError(body.body);
            case "CannotPublishToNpmScope":
                return FernFiddle.remoteGen.createJobV3.Error.cannotPublishToNpmScope(body.body);
            case "CannotPublishToMavenScope":
                return FernFiddle.remoteGen.createJobV3.Error.cannotPublishToMavenGroup(body.body);
            case "InsufficientPermissions":
                return FernFiddle.remoteGen.createJobV3.Error.insufficientPermissions(body.body);
        }
    }
    return error;
}
