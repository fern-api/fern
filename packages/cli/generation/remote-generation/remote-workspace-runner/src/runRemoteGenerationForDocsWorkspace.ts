import { FernToken } from "@fern-api/auth";
import { replaceEnvVariables } from "@fern-api/core-utils";
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

    // Substitute templated environment variables:
    // If the run is a preview, we'll substitute ALL environment variables as empty strings
    //
    // Otherwise, we'll attempt to read and replace the templated environment variable. Will
    // bubble up an error if the env var isn't found.
    //
    // Although this logic is separate from generating a remote, placing it here helps us
    // avoid making cascading changes to other workflows.
    // docsWorkspace = substituteEnvVariables(docsWorkspace, context, { substituteAsEmpty: preview });
    docsWorkspace.config = replaceEnvVariables(
        docsWorkspace.config,
        // Wrap in a closure for correct binding of `this` downstream
        { onError: (e) => context.failAndThrow(e) },
        { substituteAsEmpty: preview }
    );

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

    if (maybeInstance.customDomain != null) {
        if (typeof maybeInstance.customDomain === "string") {
            customDomains.push(maybeInstance.customDomain);
        } else if (Array.isArray(maybeInstance.customDomain)) {
            customDomains.push(...maybeInstance.customDomain);
        }
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
            preview,
            editThisPage: maybeInstance.editThisPage,
            isPrivate: maybeInstance.private
        });
    });
    return;
}
