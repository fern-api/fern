import { FernToken } from "@fern-api/auth";
import { createFdrService } from "@fern-api/core";
import { askToLogin } from "@fern-api/login";
import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import { CliContext } from "../../cli-context/CliContext.js";

interface PreviewDeployment {
    url: string;
    organizationId: string;
    updatedAt: string;
}

interface DocsUrlItem {
    domain: string;
    basePath?: string;
    organizationId: string;
    updatedAt: string;
}

/**
 * Maps FDR docs-url items to preview deployments. Preview deployments are
 * filtered entirely server-side (preview: true -> the isPreview column in FDR),
 * so there is intentionally NO client-side URL filtering: the domain suffix is
 * shared with production sites and so can't distinguish previews, and any
 * URL-shape filter here would risk silently hiding valid previews the server
 * returned (as a prior hex-only pattern did to named --id previews).
 */
export function toPreviewDeployments(urls: readonly DocsUrlItem[]): PreviewDeployment[] {
    return urls.map((item) => ({
        url: item.basePath != null ? `${item.domain}${item.basePath}` : item.domain,
        organizationId: item.organizationId,
        updatedAt: item.updatedAt
    }));
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
        cliContext.failAndThrow("Failed to authenticate. Please run 'fern login' first.", undefined, {
            code: CliError.Code.AuthError
        });
        return;
    }

    await cliContext.runTask(async (context) => {
        context.logger.info("Fetching preview deployments...");

        const fdr = createFdrService({ token: token.value });

        let listResponse;
        try {
            listResponse = await fdr.docs.v2.read.listAllDocsUrls({
                page,
                limit: limit ?? 100,
                preview: true
            });
        } catch (error) {
            const errorObj = error as Record<string, unknown>;
            const errorType = errorObj?.error as string | undefined;
            switch (errorType) {
                case "UnauthorizedError":
                    return context.failAndThrow(
                        "Unauthorized to list preview deployments. Please run 'fern login' to refresh your credentials, or set the FERN_TOKEN environment variable.",
                        undefined,
                        { code: CliError.Code.NetworkError }
                    );
                default: {
                    context.logger.debug(`Error fetching preview deployments: ${JSON.stringify(error)}`);
                    return context.failAndThrow(
                        "Failed to fetch preview deployments. Please ensure you are logged in with 'fern login' or have FERN_TOKEN set, then try again.",
                        error,
                        { code: CliError.Code.NetworkError }
                    );
                }
            }
        }

        const previewDeployments = toPreviewDeployments(listResponse.urls);

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
