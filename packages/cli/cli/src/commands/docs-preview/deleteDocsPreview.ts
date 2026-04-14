import { FernToken } from "@fern-api/auth";
import { getFernDirectory, loadProjectConfig } from "@fern-api/configuration-loader";
import { createFdrService } from "@fern-api/core";
import { askToLogin } from "@fern-api/login";
import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import { CliContext } from "../../cli-context/CliContext.js";

/**
 * Preview URLs follow the pattern: {org}-preview-{id}.docs.buildwithfern.com
 */
export const PREVIEW_URL_PATTERN = /^[a-z0-9-]+-preview-[a-z0-9-]+\.docs\.buildwithfern\.com$/i;

const DOMAIN_SUFFIX = "docs.buildwithfern.com";
const PREVIEW_FQDN_LIMIT = 62;

export function isPreviewUrl(url: string): boolean {
    let hostname = url.toLowerCase().trim();
    if (hostname.startsWith("https://")) {
        hostname = hostname.slice(8);
    } else if (hostname.startsWith("http://")) {
        hostname = hostname.slice(7);
    }
    const slashIndex = hostname.indexOf("/");
    if (slashIndex !== -1) {
        hostname = hostname.slice(0, slashIndex);
    }
    return PREVIEW_URL_PATTERN.test(hostname);
}

function sanitizePreviewId(id: string): string {
    const sanitized = id
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-+|-+$/g, "");
    if (sanitized.length === 0) {
        return "default";
    }
    return sanitized;
}

function buildPreviewDomain({ orgId, previewId }: { orgId: string; previewId: string }): string {
    const sanitizedId = sanitizePreviewId(previewId);
    const fullDomain = `${orgId}-preview-${sanitizedId}.${DOMAIN_SUFFIX}`;
    if (fullDomain.length <= PREVIEW_FQDN_LIMIT) {
        return fullDomain;
    }
    const prefix = `${orgId}-preview-`;
    const availableSpace = PREVIEW_FQDN_LIMIT - prefix.length;
    const minIdLength = 8;
    if (availableSpace < minIdLength) {
        throw new Error(`Organization name "${orgId}" is too long to generate a valid preview URL`);
    }
    const truncatedId = sanitizedId.slice(0, availableSpace).replace(/-+$/, "");
    return `${prefix}${truncatedId}.${DOMAIN_SUFFIX}`;
}

async function resolvePreviewUrlFromId({
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
                "Run this command from within a Fern project directory, or use the URL argument instead."
        );
    }

    const projectConfig = await cliContext.runTask((context) =>
        loadProjectConfig({ directory: fernDirectory, context })
    );

    return buildPreviewDomain({ orgId: projectConfig.organization, previewId });
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
        throw new Error("Must provide a preview URL or --id.");
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

    let resolvedUrl: string;

    if (resolved.type === "id") {
        resolvedUrl = await resolvePreviewUrlFromId({ cliContext, previewId: resolved.value });
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
        context.logger.info(`Deleting preview site: ${resolvedUrl}`);

        const fdr = createFdrService({ token: token.value });

        const deleteResponse = await fdr.docs.v2.write.deleteDocsSite({
            url: resolvedUrl as Parameters<typeof fdr.docs.v2.write.deleteDocsSite>[0]["url"]
        });

        if (deleteResponse.ok) {
            context.logger.info(chalk.green(`Successfully deleted preview site: ${resolvedUrl}`));
        } else {
            switch (deleteResponse.error.error) {
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
                    return context.failAndThrow(`Failed to delete preview site: ${resolvedUrl}`, deleteResponse.error, {
                        code: CliError.Code.NetworkError
                    });
            }
        }
    });
}
