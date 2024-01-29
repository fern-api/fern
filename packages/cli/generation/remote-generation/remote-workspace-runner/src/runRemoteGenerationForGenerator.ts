import { FernToken } from "@fern-api/auth";
import { Audiences } from "@fern-api/config-management-commons";
import { GeneratorInvocation } from "@fern-api/generators-configuration";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { InteractiveTaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
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
    token
}: {
    organization: string;
    workspace: FernWorkspace;
    interactiveTaskContext: InteractiveTaskContext;
    generatorInvocation: GeneratorInvocation;
    version: string | undefined;
    audiences: Audiences;
    shouldLogS3Url: boolean;
    token: FernToken;
}): Promise<RemoteTaskHandler.Response | undefined> {
    const intermediateRepresentation = await generateIntermediateRepresentation({
        workspace,
        generationLanguage: generatorInvocation.language,
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
        token
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
