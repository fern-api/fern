import { FernToken } from "@fern-api/auth";
import { createFdrService } from "@fern-api/core";
import { askToLogin } from "@fern-api/login";
import chalk from "chalk";

import { CliContext } from "../../cli-context/CliContext";

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
        // Note: Once FDR SDK is updated with preview filter support, this can be simplified
        const listResponse = await fdr.docs.v2.read.listAllDocsUrls({
            page,
            limit: limit ?? 100
        });

        if (!listResponse.ok) {
            return context.failAndThrow("Failed to fetch docs URLs", listResponse.error);
        }

        // Preview URLs match the pattern: {org}-preview-{hash}.docs.buildwithfern.com
        const previewUrlPattern = /-preview-[a-f0-9]+\.docs\.buildwithfern\.com$/;

        const previewDeployments: PreviewDeployment[] = listResponse.body.urls
            .filter((item) => previewUrlPattern.test(item.domain))
            .map((item) => ({
                url: item.basePath != null ? `${item.domain}${item.basePath}` : item.domain,
                organizationId: item.organizationId,
                updatedAt: item.updatedAt
            }));

        if (previewDeployments.length === 0) {
            context.logger.info("No preview deployments found.");
            return;
        }

        context.logger.info(chalk.bold(`\nFound ${previewDeployments.length} preview deployment(s):\n`));

        for (const deployment of previewDeployments) {
            const updatedDate = new Date(deployment.updatedAt).toLocaleString();
            context.logger.info(`  ${chalk.cyan(deployment.url)}`);
            context.logger.info(`    Organization: ${deployment.organizationId}`);
            context.logger.info(`    Updated: ${updatedDate}\n`);
        }
    });
}
