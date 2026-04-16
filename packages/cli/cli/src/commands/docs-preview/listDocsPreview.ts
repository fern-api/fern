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

        const listResponse = await fdr.docs.v2.read.listAllDocsUrls({
            page,
            limit: limit ?? 100,
            preview: true
        });

        if (!listResponse.ok) {
            switch (listResponse.error.error) {
                case "UnauthorizedError":
                    return context.failAndThrow(
                        "Unauthorized to list preview deployments. Please run 'fern login' to refresh your credentials, or set the FERN_TOKEN environment variable.",
                        undefined,
                        { code: CliError.Code.NetworkError }
                    );
                default: {
                    const errorContent =
                        listResponse.error.content != null &&
                        typeof listResponse.error.content === "object" &&
                        "body" in listResponse.error.content
                            ? listResponse.error.content.body
                            : listResponse.error.content;
                    context.logger.debug(`Error fetching preview deployments: ${JSON.stringify(errorContent)}`);
                    return context.failAndThrow(
                        "Failed to fetch preview deployments. Please ensure you are logged in with 'fern login' or have FERN_TOKEN set, then try again.",
                        listResponse.error,
                        { code: CliError.Code.NetworkError }
                    );
                }
            }
        }

        // Preview URLs match the pattern: {org}-preview-{hash}.docs.buildwithfern.com
        // The hash can be alphanumeric or a UUID with hyphens (e.g., 9b2b47f0-c44b-4338-b579-46872f33404a)
        const previewUrlPattern = /-preview-[a-f0-9-]+\.docs\.buildwithfern\.com$/;

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
