import { FernToken } from "@fern-api/auth";
import { Audiences, generatorsYml } from "@fern-api/configuration";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { InteractiveTaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { createAndStartJob } from "./createAndStartJob";
import { pollJobAndReportStatus } from "./pollJobAndReportStatus";
import { RemoteTaskHandler } from "./RemoteTaskHandler";

export async function runRemoteGenerationForGenerator({
    organization,
    workspace,
    interactiveTaskContext,
    generatorInvocation,
    version,
    audiences,
    shouldLogS3Url,
    token,
    whitelabel
}: {
    organization: string;
    workspace: FernWorkspace;
    interactiveTaskContext: InteractiveTaskContext;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    version: string | undefined;
    audiences: Audiences;
    shouldLogS3Url: boolean;
    token: FernToken;
    whitelabel: FernFiddle.WhitelabelConfig | undefined;
}): Promise<RemoteTaskHandler.Response | undefined> {
    const intermediateRepresentation = await generateIntermediateRepresentation({
        workspace,
        generationLanguage: generatorInvocation.language,
        smartCasing: generatorInvocation.smartCasing,
        disableExamples: generatorInvocation.disableExamples,
        audiences
    });

    const job = await createAndStartJob({
        workspace,
        organization,
        generatorInvocation,
        context: interactiveTaskContext,
        version,
        intermediateRepresentation,
        shouldLogS3Url,
        token,
        whitelabel
    });
    interactiveTaskContext.logger.debug(`Job ID: ${job.jobId}`);

    const taskId = job.taskIds[0];
    if (taskId == null) {
        interactiveTaskContext.failAndThrow("Did not receive a task ID.");
        return undefined;
    }
    interactiveTaskContext.logger.debug(`Task ID: ${taskId}`);

    const taskHandler = new RemoteTaskHandler({
        job,
        taskId,
        generatorInvocation,
        interactiveTaskContext
    });

    return await pollJobAndReportStatus({
        job,
        taskHandler,
        taskId,
        context: interactiveTaskContext
    });
}
