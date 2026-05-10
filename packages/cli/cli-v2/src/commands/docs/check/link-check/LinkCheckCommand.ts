import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import type { Context } from "../../../../context/Context.js";
import { Icons } from "../../../../ui/format.js";
import { LinkCheckClient, LinkCheckError } from "./LinkCheckClient.js";
import { LinkCheckFormatter, type OutputFormat } from "./LinkCheckFormatter.js";
import { ProgressRenderer } from "./ProgressRenderer.js";

const DASHBOARD_BASE_URL = process.env.FERN_DASHBOARD_URL ?? "https://dashboard.buildwithfern.com";

export class LinkCheckCommand {
    public async handle(
        context: Context,
        options: {
            instance?: string;
            output: OutputFormat;
        }
    ): Promise<void> {
        const domain = await this.resolveDomain(context, options.instance);
        const token = await context.getTokenOrPrompt();

        context.stderr.info(`${Icons.info} Checking links on ${chalk.cyan(domain)}...`);
        context.stderr.info("");

        const client = new LinkCheckClient({
            dashboardUrl: DASHBOARD_BASE_URL,
            token: token.value
        });

        const progress = new ProgressRenderer(process.stderr);

        try {
            const result = await client.run(domain, {
                onSitemapFetched: (data) => {
                    progress.onSitemapFetched(data.pageCount);
                },
                onPageScraped: (data) => {
                    progress.onPageScraped(data.pagesScraped, data.totalPages);
                },
                onLinkChecked: (data) => {
                    progress.onLinkChecked(data.linksChecked, data.totalLinks);
                },
                onError: (message) => {
                    progress.finish();
                    context.stderr.error(`${Icons.error} ${chalk.red(message)}`);
                }
            });

            progress.finish();

            const formatter = new LinkCheckFormatter();
            const output = formatter.format(result, options.output);

            if (options.output === "json" || options.output === "csv") {
                context.stdout.info(output);
            } else {
                context.stderr.info(output);
            }

            if (result.brokenLinks.length > 0) {
                throw new CliError({ code: CliError.Code.ValidationError });
            }

            if (result.brokenLinks.length === 0 && result.blockedLinks.length === 0) {
                context.stderr.info(`${Icons.success} ${chalk.green("All links valid")}`);
            }
        } catch (error) {
            if (error instanceof LinkCheckError) {
                this.handleApiError(error);
            }
            throw error;
        }
    }

    private async resolveDomain(context: Context, instance: string | undefined): Promise<string> {
        if (instance != null) {
            return this.normalizeDomain(instance);
        }

        const workspace = await context.loadWorkspaceOrThrow();
        if (workspace.docs == null) {
            throw new CliError({
                message:
                    "No docs configuration found.\n\n" +
                    "  Either add a 'docs:' section to your fern.yml, or use --instance <url>.",
                code: CliError.Code.ConfigError
            });
        }

        const instances = workspace.docs.raw.instances;
        if (instances == null || instances.length === 0) {
            throw new CliError({
                message:
                    "No docs instances configured.\n\n" +
                    "  Add an instance to the 'docs:' section of your fern.yml, or use --instance <url>.",
                code: CliError.Code.ConfigError
            });
        }

        if (instances.length === 1 && instances[0] != null) {
            return this.normalizeDomain(instances[0].url);
        }

        // Multiple instances — require explicit selection
        const available = instances.map((i) => `  - ${i.url}`).join("\n");
        throw new CliError({
            message:
                "Multiple docs instances configured. Please specify which instance to check.\n\n" +
                `Available instances:\n${available}\n\n` +
                "  Use --instance <url> to select one.",
            code: CliError.Code.ConfigError
        });
    }

    private normalizeDomain(url: string): string {
        return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    }

    private handleApiError(error: LinkCheckError): never {
        switch (error.statusCode) {
            case 401:
                throw new CliError({
                    message: error.message,
                    code: CliError.Code.AuthError
                });
            case 403:
                throw new CliError({
                    message: error.message,
                    code: CliError.Code.AuthError
                });
            case 404:
                throw new CliError({
                    message: error.message,
                    code: CliError.Code.ConfigError
                });
            default:
                throw new CliError({
                    message: `Link check failed: ${error.message}`,
                    code: CliError.Code.InternalError
                });
        }
    }
}
