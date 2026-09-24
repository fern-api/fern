import { FernToken } from "@fern-api/auth";
import { getFernDirectory, loadProjectConfig } from "@fern-api/configuration-loader";
import { createFdrService } from "@fern-api/core";
import { buildPreviewDomain, isPreviewUrl } from "@fern-api/docs-preview";
import { askToLogin } from "@fern-api/login";
import { CliError } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { CliContext } from "../../cli-context/CliContext.js";

/**
 * A preview is published at the same basepath as the docs.yml instance it was
 * built from (e.g. `acme.docs.buildwithfern.com/reference` -> preview at
 * `acme-preview-<id>.docs.buildwithfern.com/reference`), so deleting by id has
 * to target `<preview hostname><instance basepath>` for each instance.
 */
export function resolvePreviewUrlsForInstances({
    previewHostname,
    instanceUrls
}: {
    previewHostname: string;
    instanceUrls: string[];
}): string[] {
    const basePaths = new Set<string>();
    for (const instanceUrl of instanceUrls) {
        basePaths.add(parseBasePath(instanceUrl));
    }
    if (basePaths.size === 0) {
        basePaths.add("");
    }
    return [...basePaths].map((basePath) => `${previewHostname}${basePath}`);
}

function parseBasePath(instanceUrl: string): string {
    const withScheme = /^https?:\/\//i.test(instanceUrl) ? instanceUrl : `https://${instanceUrl}`;
    let pathname: string;
    try {
        pathname = new URL(withScheme).pathname;
    } catch {
        return "";
    }
    const trimmed = pathname.replace(/\/+$/, "");
    return trimmed === "" || trimmed === "/" ? "" : trimmed;
}

async function resolvePreviewUrlsFromId({
    cliContext,
    previewId
}: {
    cliContext: CliContext;
    previewId: string;
}): Promise<string[]> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return cliContext.failAndThrow(
            "No fern directory found. The --id flag requires a Fern project to resolve the organization.\n" +
                "Run this command from within a Fern project directory, or use the URL argument instead.",
            undefined,
            { code: CliError.Code.ValidationError }
        );
    }

    const { projectConfig, docsWorkspace } = await cliContext.runTask(async (context) => ({
        projectConfig: await loadProjectConfig({ directory: fernDirectory, context }),
        docsWorkspace: await loadDocsWorkspace({ fernDirectory, context })
    }));

    const previewHostname = buildPreviewDomain({ orgId: projectConfig.organization, previewId });
    const instanceUrls = docsWorkspace?.config.instances.map((instance) => instance.url) ?? [];
    return resolvePreviewUrlsForInstances({ previewHostname, instanceUrls });
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

    let resolvedUrls: string[];

    if (resolved.type === "id") {
        resolvedUrls = await resolvePreviewUrlsFromId({ cliContext, previewId: resolved.value });
        cliContext.logger.debug(`Resolved preview ID "${resolved.value}" to URL(s): ${resolvedUrls.join(", ")}`);
    } else {
        resolvedUrls = [resolved.value];
    }

    // Validate that the URL is a preview URL before proceeding
    for (const resolvedUrl of resolvedUrls) {
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

    await cliContext.runTask(async (context) => {
        const fdr = createFdrService({ token: token.value });

        // With several docs.yml instances, only the ones that were actually
        // previewed exist, so a not-found on one url is only fatal if none succeeded.
        const notFound: string[] = [];
        let deletedCount = 0;

        const logAttempt = (message: string) =>
            resolvedUrls.length > 1 ? context.logger.debug(message) : context.logger.info(message);

        for (const resolvedUrl of resolvedUrls) {
            logAttempt(`Deleting preview site: ${resolvedUrl}`);
            try {
                await fdr.docs.v2.write.deleteDocsSite({
                    url: resolvedUrl as Parameters<typeof fdr.docs.v2.write.deleteDocsSite>[0]["url"]
                });
                deletedCount++;
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
                        notFound.push(resolvedUrl);
                        break;
                    default:
                        return context.failAndThrow(`Failed to delete preview site: ${resolvedUrl}`, error, {
                            code: CliError.Code.NetworkError
                        });
                }
            }
        }

        if (deletedCount === 0 && notFound.length > 0) {
            return context.failAndThrow(`Preview site not found: ${notFound.join(", ")}`, undefined, {
                code: CliError.Code.ConfigError
            });
        }
        for (const url of notFound) {
            context.logger.debug(`No preview site registered at ${url}; skipped.`);
        }
    });
}
