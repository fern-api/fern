import { FernToken } from "@fern-api/auth";
import { createFdrService } from "@fern-api/core";
import { askToLogin } from "@fern-api/login";
import chalk from "chalk";

import { CliContext } from "../../cli-context/CliContext";

/**
 * Preview URLs follow the pattern: {org}-preview-{hash}.docs.buildwithfern.com
 * This regex validates that the hostname contains "-preview-" and ends with ".docs.buildwithfern.com"
 */
const PREVIEW_URL_PATTERN = /^[a-z0-9-]+-preview-[a-z0-9]+\.docs\.buildwithfern\.com$/i;

function isPreviewDomain(domain: string): boolean {
    return PREVIEW_URL_PATTERN.test(domain.toLowerCase().trim());
}

interface PreviewDeployment {
    url: string;
    organizationId: string;
    updatedAt: string;
}

export async function listDocsPreview({
    cliContext,
    limit,
    page
}: {
    cliContext: CliContext;
    limit?: number;
    page?: number;
}): Promise<void> {
    const token: FernToken | null = await cliContext.runTask(async (context) => {
        return askToLogin(context);
    });

    if (token == null) {
        cliContext.failAndThrow("Failed to authenticate. Please run 'fern login' first.");
        return;
    }

    await cliContext.runTask(async (context) => {
        context.logger.info("Fetching preview deployments...");

        const fdr = createFdrService({ token: token.value });

        // Fetch all docs URLs and filter for preview URLs client-side
        // We need to fetch more than the requested limit since we're filtering
        const fetchLimit = limit != null ? Math.max(limit * 10, 100) : 100;

        const listResponse = await fdr.docs.v2.read.listAllDocsUrls({
            page,
            limit: fetchLimit
        });

        if (!listResponse.ok) {
            return context.failAndThrow("Failed to fetch docs URLs", listResponse.error);
        }

        // Filter for preview URLs only
        const previewDeployments: PreviewDeployment[] = listResponse.body.urls
            .filter((item) => isPreviewDomain(item.domain))
            .map((item) => ({
                url: item.basePath != null ? `${item.domain}${item.basePath}` : item.domain,
                organizationId: item.organizationId,
                updatedAt: item.updatedAt
            }));

        // Apply the user's limit if specified
        const limitedDeployments = limit != null ? previewDeployments.slice(0, limit) : previewDeployments;

        if (limitedDeployments.length === 0) {
            context.logger.info("No preview deployments found.");
            return;
        }

        context.logger.info(chalk.bold(`\nFound ${limitedDeployments.length} preview deployment(s):\n`));

        for (const deployment of limitedDeployments) {
            const updatedDate = new Date(deployment.updatedAt).toLocaleString();
            context.logger.info(`  ${chalk.cyan(deployment.url)}`);
            context.logger.info(`    Organization: ${deployment.organizationId}`);
            context.logger.info(`    Updated: ${updatedDate}\n`);
        }

        if (limit != null && previewDeployments.length > limit) {
            context.logger.info(
                chalk.dim(
                    `Showing ${limit} of ${previewDeployments.length} preview deployments. Use --limit to see more.`
                )
            );
        }
    });
}
