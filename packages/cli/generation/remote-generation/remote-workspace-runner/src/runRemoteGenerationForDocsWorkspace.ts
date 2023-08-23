import { FernToken } from "@fern-api/auth";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import { publishDocs } from "./publishDocs";

export async function runRemoteGenerationForDocsWorkspace({
    organization,
    fernWorkspaces,
    docsWorkspace,
    context,
    token,
}: {
    organization: string;
    fernWorkspaces: FernWorkspace[];
    docsWorkspace: DocsWorkspace;
    context: TaskContext;
    token: FernToken;
}): Promise<void> {
    const interactiveTasks: Promise<boolean>[] = [];

    for (const instance of docsWorkspace.docsDefinition.config.instances) {
        interactiveTasks.push(
            context.runInteractiveTask({ name: instance.url }, async () => {
                await publishDocs({
                    docsDefinition: docsWorkspace.docsDefinition,
                    customDomains: instance.customDomain != null ? [instance.customDomain] : [],
                    domain: instance.url,
                    token,
                    organization,
                    context,
                    fernWorkspaces,
                    version: "",
                });
            })
        );
    }

    const results = await Promise.all(interactiveTasks);
    if (results.some((didSucceed) => !didSucceed)) {
        context.failAndThrow();
    }
}
