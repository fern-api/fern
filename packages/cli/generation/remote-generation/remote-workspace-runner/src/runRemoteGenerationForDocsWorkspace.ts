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
    preview
}: {
    organization: string;
    fernWorkspaces: FernWorkspace[];
    docsWorkspace: DocsWorkspace;
    context: TaskContext;
    token: FernToken;
    instanceUrl: string | undefined;
    preview: boolean;
}): Promise<void> {
    const instances = docsWorkspace.config.instances;

    if (instances.length === 0) {
        context.failAndThrow("No instances specified in docs.yml! Cannot register docs.");
        return;
    }

    if (instances.length > 1 && instanceUrl == null) {
        context.failAndThrow(`More than one docs instances. Please specify one (e.g. --instance ${instances[0]?.url})`);
        return;
    }

    const maybeInstance = instances.find((instance) => instance.url === instanceUrl) ?? instances[0];

    if (maybeInstance == null) {
        context.failAndThrow(`No docs instance with url ${instanceUrl}. Failed to register.`);
        return;
    }

    // TODO: validate custom domains
    const customDomains: string[] = [];

    if (maybeInstance.customDomain != null && maybeInstance.customDomains != null) {
        context.logger.warn("Both custom-domain and custom-domains are specified in docs.yml. Please use only one.");
    }

    if (maybeInstance.customDomain != null) {
        customDomains.push(maybeInstance.customDomain);
    }

    if (maybeInstance.customDomains != null) {
        customDomains.push(...maybeInstance.customDomains);
    }

    await context.runInteractiveTask({ name: maybeInstance.url }, async () => {
        await publishDocs({
            docsWorkspace,
            customDomains,
            domain: maybeInstance.url,
            token,
            organization,
            context,
            fernWorkspaces,
            version: "",
            preview,
            audiences: maybeInstance.audiences,
            editThisPage: maybeInstance.editThisPage,
            isPrivate: maybeInstance.private
        });
    });
    return;
}
