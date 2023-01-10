import { GeneratorAudiences, GeneratorInvocation } from "@fern-api/generators-configuration";
import { generateIntermediateRepresentation, Language } from "@fern-api/ir-generator";
import { InteractiveTaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
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
    printZipUrl,
    token,
}: {
    organization: string;
    workspace: Workspace;
    interactiveTaskContext: InteractiveTaskContext;
    generatorInvocation: GeneratorInvocation;
    version: string | undefined;
    audiences: GeneratorAudiences;
    printZipUrl: boolean;
    token: string;
}): Promise<void> {
    const intermediateRepresentation = await generateIntermediateRepresentation({
        workspace,
        generationLanguage: getLanguageFromGeneratorName(generatorInvocation.name),
        audiences: audiences.type === "all" ? undefined : audiences.audiences,
    });

    const job = await createAndStartJob({
        workspace,
        organization,
        generatorInvocation,
        context: interactiveTaskContext,
        version,
        intermediateRepresentation,
        printZipUrl,
        token,
    });
    interactiveTaskContext.logger.debug(`Job ID: ${job.jobId}`);

    const taskId = job.taskIds[0];
    if (taskId == null) {
        interactiveTaskContext.failAndThrow("Did not receive a task ID.");
        return;
    }
    interactiveTaskContext.logger.debug(`Task ID: ${taskId}`);

    const taskHandler = new RemoteTaskHandler({
        job,
        taskId,
        generatorInvocation,
        interactiveTaskContext,
    });

    await pollJobAndReportStatus({
        job,
        taskHandler,
        taskId,
        context: interactiveTaskContext,
    });
}

function getLanguageFromGeneratorName(generatorName: string) {
    if (generatorName.includes("typescript")) {
        return Language.TYPESCRIPT;
    }
    if (generatorName.includes("java") || generatorName.includes("spring")) {
        return Language.JAVA;
    }
    if (generatorName.includes("python") || generatorName.includes("fastapi") || generatorName.includes("pydantic")) {
        return Language.PYTHON;
    }
    return undefined;
}
