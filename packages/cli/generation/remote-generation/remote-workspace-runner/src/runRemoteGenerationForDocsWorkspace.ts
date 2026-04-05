import { FernToken } from "@fern-api/auth";
import { replaceEnvVariables } from "@fern-api/core-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";
import { DocsPublishConflictError, publishDocs } from "./publishDocs.js";

const PUBLISH_CONFLICT_RETRY_DELAYS_MS = [
    1 * 60 * 1000, // 1 minute
    5 * 60 * 1000, // 5 minutes
    5 * 60 * 1000 // 5 minutes
];

export interface CISource {
    type: "github" | "gitlab" | "bitbucket";
    repo?: string;
    runId?: string;
    runUrl?: string;
    commitSha?: string;
    branch?: string;
    actor?: string;
}

export async function runRemoteGenerationForDocsWorkspace({
    organization,
    apiWorkspaces,
    ossWorkspaces,
    docsWorkspace,
    context,
    token,
    instanceUrl,
    preview,
    previewId,
    disableTemplates,
    skipUpload,
    cliVersion,
    ciSource,
    deployerAuthor
}: {
    organization: string;
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    ossWorkspaces: OSSWorkspace[];
    docsWorkspace: DocsWorkspace;
    context: TaskContext;
    token: FernToken;
    instanceUrl: string | undefined;
    preview: boolean;
    previewId: string | undefined;
    disableTemplates: boolean | undefined;
    skipUpload: boolean | undefined;
    cliVersion?: string;
    ciSource?: CISource;
    deployerAuthor?: { username?: string; email?: string };
}): Promise<string | undefined> {
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

    let publishedUrl: string | undefined;
    await context.runInteractiveTask({ name: maybeInstance.url }, async () => {
        const publishStart = performance.now();
        const attemptPublish = () =>
            publishDocs({
                docsWorkspace,
                customDomains,
                domain: maybeInstance.url,
                token,
                organization,
                context,
                apiWorkspaces,
                ossWorkspaces,
                preview,
                previewId,
                editThisPage: maybeInstance.editThisPage,
                isPrivate: maybeInstance.private,
                disableTemplates,
                skipUpload,
                withAiExamples:
                    docsWorkspace.config.aiExamples?.enabled ?? docsWorkspace.config.experimental?.aiExamples ?? true,
                excludeApis: docsWorkspace.config.experimental?.excludeApis ?? false,
                targetAudiences: maybeInstance.audiences
                    ? Array.isArray(maybeInstance.audiences)
                        ? maybeInstance.audiences
                        : [maybeInstance.audiences]
                    : undefined,
                docsUrl: maybeInstance.url,
                cliVersion,
                ciSource,
                deployerAuthor
            });

        for (let attempt = 0; ; attempt++) {
            try {
                publishedUrl = await attemptPublish();
                break;
            } catch (error) {
                if (
                    !(error instanceof DocsPublishConflictError) ||
                    attempt >= PUBLISH_CONFLICT_RETRY_DELAYS_MS.length
                ) {
                    if (error instanceof DocsPublishConflictError) {
                        return context.failAndThrow(
                            "Another docs publish is currently in progress. Please try again once the other publish is complete."
                        );
                    }
                    throw error;
                }
                const delayMs =
                    PUBLISH_CONFLICT_RETRY_DELAYS_MS[attempt] ??
                    PUBLISH_CONFLICT_RETRY_DELAYS_MS[PUBLISH_CONFLICT_RETRY_DELAYS_MS.length - 1] ??
                    60000;
                const delayMinutes = delayMs / 60000;
                context.logger.warn(
                    `Another docs publish is in progress. Retrying in ${delayMinutes} minute${delayMinutes === 1 ? "" : "s"} (attempt ${attempt + 1}/${PUBLISH_CONFLICT_RETRY_DELAYS_MS.length})...`
                );
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }

        const publishTime = performance.now() - publishStart;
        context.logger.debug(`Docs publishing completed in ${publishTime.toFixed(0)}ms`);
    });
    return publishedUrl;
}
