import { FernToken } from "@fern-api/auth";
import { replaceEnvVariables } from "@fern-api/core-utils";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";

import { OSSWorkspace } from "../../../../workspace/lazy-fern-workspace/src";
import { publishDocs } from "./publishDocs";

export async function runRemoteGenerationForDocsWorkspace({
    organization,
    apiWorkspaces,
    ossWorkspaces,
    docsWorkspace,
    context,
    token,
    instanceUrl,
    preview,
    disableTemplates,
    skipUpload,
    apiConcurrency
}: {
    organization: string;
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    ossWorkspaces: OSSWorkspace[];
    docsWorkspace: DocsWorkspace;
    context: TaskContext;
    token: FernToken;
    instanceUrl: string | undefined;
    preview: boolean;
    disableTemplates: boolean | undefined;
    skipUpload: boolean | undefined;
    apiConcurrency: number | undefined;
}): Promise<void> {
    // Substitute templated environment variables:
    // If substitute-env-vars is enabled, we'll attempt to read and replace the templated
    // environment variable even in preview mode. Will bubble up an error if the env var isn't found.
    //
    // If substitute-env-vars is not enabled but the run is a preview, we'll substitute
    // ALL environment variables as empty strings.
    //
    // Although this logic is separate from generating a remote, placing it here helps us
    // avoid making cascading changes to other workflows.
    // docsWorkspace = substituteEnvVariables(docsWorkspace, context, { substituteAsEmpty: preview });
    const shouldSubstituteAsEmpty = preview && !docsWorkspace.config.settings?.substituteEnvVars;
    docsWorkspace.config = replaceEnvVariables(
        docsWorkspace.config,
        // Wrap in a closure for correct binding of `this` downstream
        { onError: (e) => context.failAndThrow(e) },
        { substituteAsEmpty: shouldSubstituteAsEmpty }
    );

    // Get instances after env var substitution has been applied to the config
    // This ensures the full instance object including custom domains goes through env var replacement
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

    if (maybeInstance.customDomain != null) {
        if (typeof maybeInstance.customDomain === "string") {
            customDomains.push(maybeInstance.customDomain);
        } else if (Array.isArray(maybeInstance.customDomain)) {
            customDomains.push(...maybeInstance.customDomain);
        }
    }

    context.logger.info(`Starting docs publishing for ${preview ? "preview" : "production"}: ${maybeInstance.url}`);
    context.logger.debug(
        `Organization: ${organization}, Preview: ${preview}, APIs: ${apiWorkspaces.length}, OSS: ${ossWorkspaces.length}`
    );

    await context.runInteractiveTask({ name: maybeInstance.url }, async () => {
        const publishStart = performance.now();
        await publishDocs({
            docsWorkspace,
            customDomains,
            domain: maybeInstance.url,
            token,
            organization,
            context,
            apiWorkspaces,
            ossWorkspaces,
            preview,
            editThisPage: maybeInstance.editThisPage,
            isPrivate: maybeInstance.private,
            disableTemplates,
            skipUpload,
            withAiExamples: docsWorkspace.config.experimental?.aiExamples ?? true,
            targetAudiences: maybeInstance.audiences
                ? Array.isArray(maybeInstance.audiences)
                    ? maybeInstance.audiences
                    : [maybeInstance.audiences]
                : undefined,
            apiConcurrency
        });
        const publishTime = performance.now() - publishStart;
        context.logger.debug(`Docs publishing completed in ${publishTime.toFixed(0)}ms`);
    });
    return;
}
