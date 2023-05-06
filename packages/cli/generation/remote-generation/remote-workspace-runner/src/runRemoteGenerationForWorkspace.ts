import { FernToken } from "@fern-api/auth";
import { GeneratorGroup } from "@fern-api/generators-configuration";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { publishDocs } from "./publishDocs";
import { runRemoteGenerationForGenerator } from "./runRemoteGenerationForGenerator";

export async function runRemoteGenerationForWorkspace({
    organization,
    workspace,
    context,
    generatorGroup,
    version,
    shouldLogS3Url,
    token,
}: {
    organization: string;
    workspace: FernWorkspace;
    context: TaskContext;
    generatorGroup: GeneratorGroup;
    version: string | undefined;
    shouldLogS3Url: boolean;
    token: FernToken;
}): Promise<void> {
    if (generatorGroup.docs == null && generatorGroup.generators.length === 0) {
        context.logger.warn("No generators specified.");
        return;
    }

    const interactiveTasks: Promise<boolean>[] = [];

    if (generatorGroup.docs != null) {
        const generatorDocsConfig = generatorGroup.docs;
        interactiveTasks.push(
            context.runInteractiveTask({ name: "Publish docs" }, async (interactiveTaskContext) => {
                if (workspace.docsDefinition == null) {
                    interactiveTaskContext.failAndThrow("Docs are not configured.");
                    return;
                }
                await publishDocs({
                    docsDefinition: workspace.docsDefinition,
                    domain: generatorDocsConfig.domain,
                    token,
                    organization,
                    context,
                    workspace,
                    audiences: generatorGroup.audiences,
                });
            })
        );
    }

    interactiveTasks.push(
        ...generatorGroup.generators.map((generatorInvocation) =>
            context.runInteractiveTask({ name: generatorInvocation.name }, async (interactiveTaskContext) => {
                await runRemoteGenerationForGenerator({
                    organization,
                    workspace,
                    interactiveTaskContext,
                    generatorInvocation,
                    version,
                    audiences: generatorGroup.audiences,
                    shouldLogS3Url,
                    token,
                });
            })
        )
    );

    const results = await Promise.all(interactiveTasks);
    if (results.some((didSucceed) => !didSucceed)) {
        context.failAndThrow();
    }
}
