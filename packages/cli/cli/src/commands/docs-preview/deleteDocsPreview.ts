import { FernToken } from "@fern-api/auth";
import { getFernDirectory, loadProjectConfig } from "@fern-api/configuration-loader";
import { createFdrService } from "@fern-api/core";
import { assertNever } from "@fern-api/core-utils";
import {
    PreviewSiteLookup,
    buildPreviewDomain,
    isPreviewUrl,
    lookupPreviewSiteUrl,
    splitPreviewUrl
} from "@fern-api/docs-preview";
import { askToLogin } from "@fern-api/login";
import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import { CliContext } from "../../cli-context/CliContext.js";

/** The hostname a preview ID maps to, per the org of the local Fern project. */
async function resolveHostnameFromId({
    cliContext,
    previewId
}: {
    cliContext: CliContext;
    previewId: string;
}): Promise<string> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return cliContext.failAndThrow(
            "No fern directory found. The --id flag requires a Fern project to resolve the organization.\n" +
                "Run this command from within a Fern project directory, or use the URL argument instead.",
            undefined,
            { code: CliError.Code.ValidationError }
        );
    }

    const projectConfig = await cliContext.runTask((context) =>
        loadProjectConfig({ directory: fernDirectory, context })
    );

    return buildPreviewDomain({ orgId: projectConfig.organization, previewId });
}

/**
 * Resolves the URL FDR stores for the preview served from `hostname` — including
 * the basepath it was published under, which a hostname alone does not identify.
 */
async function resolveSiteUrlForHostname({
    cliContext,
    hostname,
    target,
    token
}: {
    cliContext: CliContext;
    hostname: string;
    /** How to refer to what the user asked to delete, e.g. `preview ID "mr-2"`. */
    target: string;
    token: FernToken;
}): Promise<string> {
    const fdr = createFdrService({ token: token.value });

    let lookup: PreviewSiteLookup;
    try {
        lookup = await lookupPreviewSiteUrl({
            listPreviewUrls: (args) => fdr.docs.v2.read.listAllDocsUrls(args),
            hostname
        });
    } catch (error) {
        const errorType = (error as Record<string, unknown>)?.error;
        if (errorType === "UnauthorizedError") {
            return cliContext.failAndThrow(
                "Unauthorized to list preview deployments. Please run 'fern login' to refresh your credentials, or set the FERN_TOKEN environment variable.",
                undefined,
                { code: CliError.Code.NetworkError }
            );
        }
        return cliContext.failAndThrow(`Failed to look up the preview deployment for ${target}.`, error, {
            code: CliError.Code.NetworkError
        });
    }

    switch (lookup.type) {
        case "found":
            return lookup.url;
        case "notFound":
            return cliContext.failAndThrow(
                `No preview deployment found for ${target} (${hostname}).\n` +
                    "Run 'fern docs preview list' to see the preview deployments you can delete.",
                undefined,
                { code: CliError.Code.ConfigError }
            );
        case "ambiguous":
            return cliContext.failAndThrow(
                `${hostname} serves more than one preview site:\n` +
                    `${lookup.urls.map((url) => `  ${url}`).join("\n")}\n` +
                    "Pass the full URL of the one you want to delete.",
                undefined,
                { code: CliError.Code.ConfigError }
            );
        case "scanLimitReached":
            return cliContext.failAndThrow(
                `Could not find ${target} (${hostname}) in the first ${lookup.pagesScanned} pages of preview deployments.\n` +
                    "Pass the full preview URL, including its basepath, instead.",
                undefined,
                { code: CliError.Code.ConfigError }
            );
        default:
            assertNever(lookup);
    }
}

function resolveTarget({
    target,
    url,
    id
}: {
    target?: string;
    url?: string;
    id?: string;
}): { type: "url"; value: string } | { type: "id"; value: string } {
    if (url != null) {
        return { type: "url", value: url };
    }
    if (id != null) {
        return { type: "id", value: id };
    }
    if (target == null) {
        throw new CliError({
            message: "Must provide a preview URL or --id.",
            code: CliError.Code.ConfigError
        });
    }
    if (isPreviewUrl(target)) {
        return { type: "url", value: target };
    }
    return { type: "id", value: target };
}

export async function deleteDocsPreview({
    cliContext,
    target,
    previewUrl,
    previewId
}: {
    cliContext: CliContext;
    target: string | undefined;
    previewUrl: string | undefined;
    previewId: string | undefined;
}): Promise<void> {
    const resolved = resolveTarget({ target, url: previewUrl, id: previewId });

    // Validate that the URL is a preview URL before asking the user to log in
    if (resolved.type === "url" && !isPreviewUrl(resolved.value)) {
        cliContext.failAndThrow(
            `Invalid preview URL: ${resolved.value}\n` +
                "Only preview sites can be deleted with this command.\n" +
                "Preview URLs follow the pattern: {org}-preview-{hash}.docs.buildwithfern.com\n" +
                "Example: acme-preview-abc123.docs.buildwithfern.com",
            undefined,
            { code: CliError.Code.ConfigError }
        );
        return;
    }

    const token: FernToken | null = await cliContext.runTask(async (context) => {
        return askToLogin(context);
    });

    if (token == null) {
        cliContext.failAndThrow("Failed to authenticate. Please run 'fern login' first.", undefined, {
            code: CliError.Code.AuthError
        });
        return;
    }

    let resolvedUrl: string;

    if (resolved.type === "id") {
        const hostname = await resolveHostnameFromId({ cliContext, previewId: resolved.value });
        resolvedUrl = await resolveSiteUrlForHostname({
            cliContext,
            hostname,
            target: `preview ID "${resolved.value}"`,
            token
        });
        cliContext.logger.debug(`Resolved preview ID "${resolved.value}" to URL: ${resolvedUrl}`);
    } else {
        const { hostname, path } = splitPreviewUrl(resolved.value);
        // A bare hostname doesn't identify a preview published under a basepath —
        // FDR keys the site on hostname + basepath — so look the site up unless
        // the user already told us which basepath they mean.
        resolvedUrl =
            path === ""
                ? await resolveSiteUrlForHostname({ cliContext, hostname, target: hostname, token })
                : `${hostname}${path}`;
    }

    await cliContext.runTask(async (context) => {
        context.logger.info(`Deleting preview site: ${resolvedUrl}`);

        const fdr = createFdrService({ token: token.value });

        try {
            await fdr.docs.v2.write.deleteDocsSite({
                url: resolvedUrl as Parameters<typeof fdr.docs.v2.write.deleteDocsSite>[0]["url"]
            });
            context.logger.info(chalk.green(`Successfully deleted preview site: ${resolvedUrl}`));
        } catch (error) {
            const errorObj = error as Record<string, unknown>;
            const errorType = errorObj?.error as string | undefined;
            switch (errorType) {
                case "UnauthorizedError":
                    return context.failAndThrow(
                        "You do not have permissions to delete this preview site. Reach out to support@buildwithfern.com",
                        undefined,
                        { code: CliError.Code.NetworkError }
                    );
                case "DocsNotFoundError":
                    return context.failAndThrow(`Preview site not found: ${resolvedUrl}`, undefined, {
                        code: CliError.Code.ConfigError
                    });
                default:
                    return context.failAndThrow(`Failed to delete preview site: ${resolvedUrl}`, error, {
                        code: CliError.Code.NetworkError
                    });
            }
        }
    });
}
