import { FernToken } from "@fern-api/auth";
import { getFernDirectory, loadProjectConfig } from "@fern-api/configuration-loader";
import { createFdrService } from "@fern-api/core";
import { buildPreviewDomain, isPreviewUrl } from "@fern-api/docs-preview";
import { askToLogin } from "@fern-api/login";
import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import { CliContext } from "../../cli-context/CliContext.js";
import { DocsUrlItem, toPreviewUrl } from "./listDocsPreview.js";

/** FDR caps `limit` on the docs-url listing at 1000. */
const PREVIEW_PAGE_SIZE = 1000;
/** Guards against paging forever if the listing never shrinks below a full page. */
const MAX_PREVIEW_PAGES = 20;

type ListPreviewUrls = (args: { page: number; limit: number; preview: true }) => Promise<{
    urls: readonly DocsUrlItem[];
}>;

/**
 * Finds the preview deployments served from `hostname`. There can be more than
 * one: a preview host can serve several sites, each under its own basepath.
 */
export async function findPreviewsForHostname({
    listPreviewUrls,
    hostname
}: {
    listPreviewUrls: ListPreviewUrls;
    hostname: string;
}): Promise<DocsUrlItem[]> {
    const normalizedHostname = hostname.toLowerCase();
    const matches: DocsUrlItem[] = [];
    for (let page = 1; page <= MAX_PREVIEW_PAGES; page++) {
        const { urls } = await listPreviewUrls({ page, limit: PREVIEW_PAGE_SIZE, preview: true });
        matches.push(...urls.filter((item) => item.domain.toLowerCase() === normalizedHostname));
        if (urls.length < PREVIEW_PAGE_SIZE) {
            break;
        }
    }
    return matches;
}

/**
 * Resolves a preview ID to the URL FDR stores for it. The ID only determines the
 * hostname, but a preview published under a basepath is keyed on hostname +
 * basepath, so the deployment is looked up rather than assumed to be at the root.
 */
async function resolvePreviewUrlFromId({
    cliContext,
    previewId,
    token
}: {
    cliContext: CliContext;
    previewId: string;
    token: FernToken;
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

    const hostname = buildPreviewDomain({ orgId: projectConfig.organization, previewId });
    const fdr = createFdrService({ token: token.value });

    let matches: DocsUrlItem[];
    try {
        matches = await findPreviewsForHostname({
            listPreviewUrls: (args) => fdr.docs.v2.read.listAllDocsUrls(args),
            hostname
        });
    } catch (error) {
        return cliContext.failAndThrow(
            `Failed to look up the preview deployment for ID "${previewId}".\n` +
                `Pass the full preview URL instead, e.g. fern docs preview delete ${hostname}`,
            error,
            { code: CliError.Code.NetworkError }
        );
    }

    const [match, ...ambiguous] = matches;

    if (match == null) {
        return cliContext.failAndThrow(
            `No preview deployment found for ID "${previewId}" (${hostname}).\n` +
                "Run 'fern docs preview list' to see the preview deployments you can delete.",
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }

    if (ambiguous.length > 0) {
        const urls = matches.map((item) => `  ${toPreviewUrl(item)}`).join("\n");
        return cliContext.failAndThrow(
            `Preview ID "${previewId}" matches more than one deployment:\n${urls}\n` +
                "Pass the full preview URL of the one you want to delete.",
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }

    return toPreviewUrl(match);
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
        resolvedUrl = await resolvePreviewUrlFromId({ cliContext, previewId: resolved.value, token });
        cliContext.logger.debug(`Resolved preview ID "${resolved.value}" to URL: ${resolvedUrl}`);
    } else {
        resolvedUrl = resolved.value;
    }

    // Validate that the URL is a preview URL before proceeding
    if (!isPreviewUrl(resolvedUrl)) {
        cliContext.failAndThrow(
            `Invalid preview URL: ${resolvedUrl}\n` +
                "Only preview sites can be deleted with this command.\n" +
                "Preview URLs follow the pattern: {org}-preview-{hash}.docs.buildwithfern.com\n" +
                "Example: acme-preview-abc123.docs.buildwithfern.com",
            undefined,
            { code: CliError.Code.ConfigError }
        );
        return;
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
