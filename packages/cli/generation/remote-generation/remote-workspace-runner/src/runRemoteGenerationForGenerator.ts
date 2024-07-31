import { FernToken } from "@fern-api/auth";
import { Audiences, fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { createFdrService } from "@fern-api/core";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { convertIrToFdrApi } from "@fern-api/register";
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
    absolutePathToPreview,
    readme
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
    readme: generatorsYml.ReadmeSchema | undefined;
}): Promise<RemoteTaskHandler.Response | undefined> {
    const ir = await generateIntermediateRepresentation({
        workspace,
        generationLanguage: generatorInvocation.language,
        keywords: generatorInvocation.keywords,
        smartCasing: generatorInvocation.smartCasing,
        disableExamples: generatorInvocation.disableExamples,
        audiences,
        readme
    });

    const fdr = createFdrService({ token: token.value });
    const apiDefinition = convertIrToFdrApi({ ir, snippetsConfig: {} });
    const response = await fdr.api.v1.register.registerApiDefinition({
        orgId: organization,
        apiId: ir.apiName.originalName,
        definition: apiDefinition
    });
    let fdrApiDefinitionId;
    if (response.ok) {
        fdrApiDefinitionId = response.body.apiDefinitionId;
    }

    const job = await createAndStartJob({
        projectConfig,
        workspace,
        organization,
        generatorInvocation,
        context: interactiveTaskContext,
        version,
        intermediateRepresentation: {
            ...ir,
            fdrApiDefinitionId
        },
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
