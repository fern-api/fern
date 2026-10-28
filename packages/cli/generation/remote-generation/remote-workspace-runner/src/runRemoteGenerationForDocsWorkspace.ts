import { VisibilityFilter } from "@fern-api/api-workspace-commons";
import { FernToken } from "@fern-api/auth";
import { delay, replaceEnvVariables } from "@fern-api/core-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { CliError, TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";
import { stripCustomDomainProtocol, validateBasepathAlignment } from "./customDomainValidation.js";
import { getDocsDeployMode } from "./docsDeployMode.js";
import { fetchGuestDocsSite, getFdrOrigin } from "./guestDocsSite.js";
import { DocsPublishConflictError, publishDocs } from "./publishDocs.js";
import { checkCustomDomainsNotOnVercel } from "./vercelDomainCheck.js";

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
    usesSdkConfig,
    sdkNames,
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
    deployerAuthor,
    loginCommand,
    docsVisibility
}: {
    organization: string;
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    ossWorkspaces: OSSWorkspace[];
    /** Whether the project configures SDKs in sdk-config.yml; only used to explain missing SDK snippets. */
    usesSdkConfig?: boolean;
    /** The `sdkName` of each language's SDK in the sdk-config.yml, used to find its build for the SDK snippets. */
    sdkNames?: Record<string, string[]>;
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
    /**
     * CLI command to reference in auth-failure hints (e.g. 'fern login' for v1,
     * 'fern auth login' for CLI v2). Defaults to 'fern login'.
     */
    loginCommand?: string;
    /** Which `x-twilio.docsVisibility` tiers to publish; defaults to `public`. */
    docsVisibility?: VisibilityFilter;
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
        { onError: (e) => context.failAndThrow(undefined, e, { code: CliError.Code.EnvironmentError }) },
        { substituteAsEmpty: shouldSubstituteAsEmpty }
    );

    // Get instances after env var substitution has been applied to the config
    // This ensures the full instance object including custom domains goes through env var replacement
    const instances = docsWorkspace.config.instances;

    if (instances.length === 0) {
        context.failAndThrow("No instances specified in docs.yml! Cannot register docs.", undefined, {
            code: CliError.Code.ConfigError
        });
        return;
    }

    // A guest publishes to its own drop site, so the docs.yml instance only lends its config; no need to pick one.
    const publishesToGuestDropSite = token.type === "guest" && !preview;

    if (instances.length > 1 && instanceUrl == null && !publishesToGuestDropSite) {
        context.failAndThrow(
            `More than one docs instances. Please specify one (e.g. --instance ${instances[0]?.url})`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
        return;
    }

    const maybeInstance =
        instanceUrl != null ? instances.find((instance) => instance.url === instanceUrl) : instances[0];

    if (maybeInstance == null) {
        const available = instances.map((inst) => `  - ${inst.url}`).join("\n");
        context.failAndThrow(
            instanceUrl != null
                ? `No docs instance found matching '${instanceUrl}'.\n\nAvailable instances:\n${available}`
                : `No docs instance found. Failed to register.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
        return;
    }

    let customDomains = (
        typeof maybeInstance.customDomain === "string"
            ? [maybeInstance.customDomain]
            : (maybeInstance.customDomain ?? [])
    ).map(stripCustomDomainProtocol);

    // The Fern instance url and every custom domain must share the same basepath.
    let publishUrl = maybeInstance.url;
    if (publishesToGuestDropSite) {
        // A guest session publishes to the Fern Drop site FDR holds for it, not to the docs.yml URL.
        if (getDocsDeployMode() === "legacy") {
            context.failAndThrow(
                "--guest publishes through the docs ledger, which FERN_DOCS_DEPLOY_MODE=legacy disables. Unset it to publish as a guest.",
                undefined,
                { code: CliError.Code.ConfigError }
            );
            return;
        }
        const site = await fetchGuestDocsSite({ fdrOrigin: getFdrOrigin(), token });
        publishUrl = site.domain;
        context.logger.warn(
            `Ignoring instance URL "${maybeInstance.url}" from docs.yml while running as a guest; publishing to https://${publishUrl} instead.`
        );
        if (customDomains.length > 0) {
            context.logger.warn("Custom domains are not applied to a guest docs site; claim the session to use them.");
            customDomains = [];
        }
    }

    validateBasepathAlignment(publishUrl, customDomains, context);
    await checkCustomDomainsNotOnVercel({ customDomains, context });

    context.logger.info(`Starting docs publishing for ${preview ? "preview" : "production"}: ${publishUrl}`);
    context.logger.debug(
        `Organization: ${organization}, Preview: ${preview}, APIs: ${apiWorkspaces.length}, OSS: ${ossWorkspaces.length}`
    );

    let publishedUrl: string | undefined;
    await context.runInteractiveTask({ name: publishUrl }, async () => {
        const publishStart = performance.now();
        const attemptPublish = () =>
            publishDocs({
                docsWorkspace,
                customDomains,
                domain: publishUrl,
                token,
                organization,
                context,
                apiWorkspaces,
                ossWorkspaces,
                usesSdkConfig,
                sdkNames,
                preview,
                previewId,
                editThisPage: maybeInstance.editThisPage,
                disableTemplates,
                skipUpload,
                excludeApis: docsWorkspace.config.experimental?.excludeApis ?? false,
                targetAudiences: maybeInstance.audiences
                    ? Array.isArray(maybeInstance.audiences)
                        ? maybeInstance.audiences
                        : [maybeInstance.audiences]
                    : undefined,
                docsUrl: publishUrl,
                cliVersion,
                ciSource,
                deployerAuthor,
                loginCommand,
                multiSource: maybeInstance.multiSource ?? false,
                docsVisibility
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
                            "Another docs publish is currently in progress. Please try again once the other publish is complete.",
                            undefined,
                            { code: CliError.Code.NetworkError }
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
                await delay(delayMs);
            }
        }

        const publishTime = performance.now() - publishStart;
        context.logger.debug(`Docs publishing completed in ${publishTime.toFixed(0)}ms`);
    });
    return publishedUrl;
}
