import { FernToken } from "@fern-api/auth";
import { createFdrService } from "@fern-api/core";
import { askToLogin } from "@fern-api/login";
import chalk from "chalk";

import { CliContext } from "../../cli-context/CliContext";

/**
 * Preview URLs follow the pattern: {org}-preview-{hash}.docs.buildwithfern.com
 * This regex validates that the hostname contains "-preview-" and ends with ".docs.buildwithfern.com"
 * The hash can be alphanumeric or a UUID with hyphens (e.g., 9b2b47f0-c44b-4338-b579-46872f33404a)
 */
export const PREVIEW_URL_PATTERN = /^[a-z0-9-]+-preview-[a-z0-9-]+\.docs\.buildwithfern\.com$/i;

export function isPreviewUrl(url: string): boolean {
    // Normalize the URL to extract just the hostname
    let hostname = url.toLowerCase().trim();

    // Remove protocol if present
    if (hostname.startsWith("https://")) {
        hostname = hostname.slice(8);
    } else if (hostname.startsWith("http://")) {
        hostname = hostname.slice(7);
    }

    // Remove path, query string, and fragment if present
    const slashIndex = hostname.indexOf("/");
    if (slashIndex !== -1) {
        hostname = hostname.slice(0, slashIndex);
    }

    return PREVIEW_URL_PATTERN.test(hostname);
}

export async function deleteDocsPreview({
    cliContext,
    previewUrl
}: {
    cliContext: CliContext;
    previewUrl: string;
}): Promise<void> {
    // Validate that the URL is a preview URL before proceeding
    if (!isPreviewUrl(previewUrl)) {
        cliContext.failAndThrow(
            `Invalid preview URL: ${previewUrl}\n` +
                "Only preview sites can be deleted with this command.\n" +
                "Preview URLs follow the pattern: {org}-preview-{hash}.docs.buildwithfern.com\n" +
                "Example: acme-preview-abc123.docs.buildwithfern.com"
        );
        return;
    }

    const token: FernToken | null = await cliContext.runTask(async (context) => {
        return askToLogin(context);
    });

    if (token == null) {
        cliContext.failAndThrow("Failed to authenticate. Please run 'fern login' first.");
        return;
    }

    await cliContext.runTask(async (context) => {
        context.logger.info(`Deleting preview site: ${previewUrl}`);

        const fdr = createFdrService({ token: token.value });

        const deleteResponse = await fdr.docs.v2.write.deleteDocsSite({
            url: previewUrl as Parameters<typeof fdr.docs.v2.write.deleteDocsSite>[0]["url"]
        });

        if (deleteResponse.ok) {
            context.logger.info(chalk.green(`Successfully deleted preview site: ${previewUrl}`));
        } else {
            switch (deleteResponse.error.error) {
                case "UnauthorizedError":
                    return context.failAndThrow(
                        "You do not have permissions to delete this preview site. Reach out to support@buildwithfern.com"
                    );
                case "DocsNotFoundError":
                    return context.failAndThrow(`Preview site not found: ${previewUrl}`);
                default:
                    return context.failAndThrow(`Failed to delete preview site: ${previewUrl}`, deleteResponse.error);
            }
        }
    });
}
