import { FernToken } from "@fern-api/auth";
import { Audiences, fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { InteractiveTaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { createAndStartJob } from "./createAndStartJob";
import { pollJobAndReportStatus } from "./pollJobAndReportStatus";
import { RemoteTaskHandler } from "./RemoteTaskHandler";

export async function runRemoteGenerationForGenerator({
    projectConfig,
    organization,
    workspace,
    interactiveTaskContext,
    generatorInvocation,
    version,
    audiences,
    shouldLogS3Url,
    token,
    whitelabel,
    irVersionOverride,
    absolutePathToPreview
}: {
    projectConfig: fernConfigJson.ProjectConfig;
    organization: string;
    workspace: FernWorkspace;
    interactiveTaskContext: InteractiveTaskContext;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    version: string | undefined;
    audiences: Audiences;
    shouldLogS3Url: boolean;
    token: FernToken;
    whitelabel: FernFiddle.WhitelabelConfig | undefined;
    irVersionOverride: string | undefined;
    absolutePathToPreview: AbsoluteFilePath | undefined;
}): Promise<RemoteTaskHandler.Response | undefined> {
    const intermediateRepresentation = await generateIntermediateRepresentation({
        workspace,
        generationLanguage: generatorInvocation.language,
        keywords: generatorInvocation.keywords,
        smartCasing: generatorInvocation.smartCasing,
        casingVersion: generatorInvocation.casingVersion,
        disableExamples: generatorInvocation.disableExamples,
        audiences
    });

    const job = await createAndStartJob({
        projectConfig,
        workspace,
        organization,
        generatorInvocation,
        context: interactiveTaskContext,
        version,
        intermediateRepresentation,
        shouldLogS3Url,
        token,
        whitelabel,
        irVersionOverride,
        absolutePathToPreview
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
        interactiveTaskContext,
        absolutePathToPreview
    });

    return await pollJobAndReportStatus({
        job,
        taskHandler,
        taskId,
        context: interactiveTaskContext
    });
}
