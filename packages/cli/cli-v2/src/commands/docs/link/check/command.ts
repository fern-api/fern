import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { Icons } from "../../../../ui/format.js";
import { command } from "../../../_internal/command.js";
import { LinkCheckClient, LinkCheckError } from "./LinkCheckClient.js";
import { LinkCheckFormatter, type OutputFormat } from "./LinkCheckFormatter.js";
import { ProgressRenderer } from "./ProgressRenderer.js";
import { SourceResolver } from "./SourceResolver.js";

const DASHBOARD_BASE_URL = process.env.FERN_DASHBOARD_URL ?? "https://dashboard.buildwithfern.com";

export declare namespace LinkCheckCommand {
    export interface Args extends GlobalArgs {
        /** Docs URL to check links on */
        url?: string;
        /** Output format for link check results */
        output: OutputFormat;
    }
}

export class LinkCheckCommand {
    public async handle(context: Context, args: LinkCheckCommand.Args): Promise<void> {
        const domain = await this.resolveDomain(context, args.url);
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
                    progress.onSitemapFetched(data.totalPages);
                },
                onPageScraped: (data) => {
                    progress.onPageScraped(data.pageIndex, data.totalPages);
                },
                onLinkChecked: (data) => {
                    progress.onLinkChecked(data.linksChecked, data.totalLinks);
                },
                onError: (message) => {
                    context.stderr.error(`${Icons.error} ${chalk.red(message)}`);
                }
            });

            const docsAbsolutePath = await this.getDocsConfigPath(context);
            const resolver = new SourceResolver();
            const resolved = await resolver.resolve(result, docsAbsolutePath);

            const formatter = new LinkCheckFormatter();
            const output = formatter.format(resolved, args.output);

            if (args.output === "json" || args.output === "csv") {
                context.stdout.info(output);
            } else {
                context.stderr.info(output);
            }

            if (resolved.brokenLinks.length > 0) {
                throw new CliError({ code: CliError.Code.ValidationError });
            } else if (resolved.blockedLinks.length === 0) {
                context.stderr.info(`${Icons.success} ${chalk.green("All links valid")}`);
            }
        } catch (error) {
            if (error instanceof LinkCheckError) {
                this.handleApiError(error);
            }
            throw error;
        } finally {
            progress.finish();
        }
    }

    private async getDocsConfigPath(context: Context): Promise<string | undefined> {
        try {
            const workspaceResult = await context.loadWorkspace();
            if (workspaceResult == null || !workspaceResult.success) {
                return undefined;
            }
            const docsConfig = workspaceResult.workspace.docs;
            if (docsConfig?.absoluteFilePath != null) {
                return docsConfig.absoluteFilePath;
            }
            return undefined;
        } catch {
            return undefined;
        }
    }

    private async resolveDomain(context: Context, url: string | undefined): Promise<string> {
        if (url != null) {
            return this.normalizeDomain(url);
        }

        const workspace = await context.loadWorkspaceOrThrow();
        if (workspace.docs == null) {
            throw new CliError({
                message:
                    "No docs configuration found.\n\n" +
                    "  Either add a 'docs:' section to your fern.yml, or use --url <url>.",
                code: CliError.Code.ConfigError
            });
        }

        const instances = workspace.docs.raw.instances;
        if (instances == null || instances.length === 0) {
            throw new CliError({
                message:
                    "No docs instances configured.\n\n" +
                    "  Add an instance to the 'docs:' section of your fern.yml, or use --url <url>.",
                code: CliError.Code.ConfigError
            });
        }

        if (instances.length === 1 && instances[0] != null) {
            return this.normalizeDomain(instances[0].url);
        }

        const available = instances.map((i) => `  - ${i.url}`).join("\n");
        throw new CliError({
            message:
                "Multiple docs instances configured. Please specify which one to check.\n\n" +
                `Available instances:\n${available}\n\n` +
                "  Use --url <url> to select one.",
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

export function addLinkCheckCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new LinkCheckCommand();
    command(
        cli,
        "check",
        "Check for broken links on a live docs site",
        (context, args) => cmd.handle(context, args as LinkCheckCommand.Args),
        (yargs) =>
            yargs
                .option("url", {
                    type: "string",
                    description: "Docs site URL to check (e.g. buildwithfern.com/learn)"
                })
                .option("output", {
                    type: "string",
                    description: "Output format: text, json, or csv",
                    choices: ["text", "json", "csv"] as const,
                    default: "text" as const
                })
    );
}
