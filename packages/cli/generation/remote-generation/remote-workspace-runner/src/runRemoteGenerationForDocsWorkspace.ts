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
    instanceUrl,
}: {
    organization: string;
    fernWorkspaces: FernWorkspace[];
    docsWorkspace: DocsWorkspace;
    context: TaskContext;
    token: FernToken;
    instanceUrl: string | undefined;
}): Promise<void> {
    const instances = docsWorkspace.docsDefinition.config.instances;

    if (instances.length === 0) {
        context.failAndThrow("No instances specified in docs.yml! Cannot register docs.");
        return;
    }

    if (instances.length === 1 && instances[0] != null) {
        const instance = instances[0];
        await context.runInteractiveTask({ name: instance.url }, async () => {
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
        });
        return;
    }

    if (instances.length > 1 && instanceUrl == null) {
        context.failAndThrow(`More than one docs instances. Please specify one (e.g. --instance ${instances[0]?.url})`);
        return;
    }

    const maybeInstance = instances.find((instance) => instance.url === instanceUrl);

    if (maybeInstance == null) {
        context.failAndThrow(`No docs instance with url ${instanceUrl}. Failed to register.`);
        return;
    }

    await context.runInteractiveTask({ name: maybeInstance.url }, async () => {
        await publishDocs({
            docsDefinition: docsWorkspace.docsDefinition,
            customDomains: maybeInstance.customDomain != null ? [maybeInstance.customDomain] : [],
            domain: maybeInstance.url,
            token,
            organization,
            context,
            fernWorkspaces,
            version: "",
        });
    });
    return;
}
