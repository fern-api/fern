import { createFdrService } from "@fern-api/core";
import { buildPreviewDomain, isPreviewUrl as isPreviewUrlUtil } from "@fern-api/docs-preview";
import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { command } from "../../../_internal/command.js";

export declare namespace DeleteCommand {
    export interface Args extends GlobalArgs {
        target?: string;
        url?: string;
        id?: string;
    }
}

export class DeleteCommand {
    public async handle(context: Context, args: DeleteCommand.Args): Promise<void> {
        const resolvedUrl = await this.resolveUrl(context, args);

        if (!isPreviewUrlUtil(resolvedUrl)) {
            throw new CliError({
                message:
                    `Invalid preview URL: ${resolvedUrl}\n` +
                    `  Preview URLs follow the pattern: {org}-preview-{hash}.docs.buildwithfern.com`,
                code: CliError.Code.ConfigError
            });
        }

        const token = await context.getTokenOrPrompt();
        const fdr = createFdrService({ token: token.value });

        context.stderr.debug(`Deleting preview site: ${resolvedUrl}`);

        const deleteResponse = await fdr.docs.v2.write.deleteDocsSite({
            url: resolvedUrl as Parameters<typeof fdr.docs.v2.write.deleteDocsSite>[0]["url"]
        });
        if (!deleteResponse.ok) {
            switch (deleteResponse.error.error) {
                case "UnauthorizedError":
                    throw CliError.unauthorized(
                        "You do not have permissions to delete this preview site. Reach out to support@buildwithfern.com"
                    );
                case "DocsNotFoundError":
                    throw CliError.notFound(`Preview site not found: ${resolvedUrl}`);
                default:
                    throw new CliError({
                        message: `Failed to delete preview site: ${resolvedUrl}`,
                        code: CliError.Code.InternalError
                    });
            }
        }

        context.stderr.info(chalk.green(`Successfully deleted preview site: ${resolvedUrl}`));
    }

    private resolveTarget(args: DeleteCommand.Args): { type: "url"; value: string } | { type: "id"; value: string } {
        if (args.url != null) {
            return { type: "url", value: args.url };
        }
        if (args.id != null) {
            return { type: "id", value: args.id };
        }
        if (args.target == null) {
            throw new CliError({ message: "Must provide a preview URL or --id.", code: CliError.Code.ConfigError });
        }
        if (isPreviewUrlUtil(args.target)) {
            return { type: "url", value: args.target };
        }
        return { type: "id", value: args.target };
    }

    private async resolveUrl(context: Context, args: DeleteCommand.Args): Promise<string> {
        const resolved = this.resolveTarget(args);

        if (resolved.type === "id") {
            const workspace = await context.loadWorkspaceOrThrow();
            const url = buildPreviewDomain({ orgId: workspace.org, previewId: resolved.value });
            context.stderr.debug(`Resolved preview ID "${resolved.value}" to URL: ${url}`);
            return url;
        }

        return resolved.value;
    }
}

export function addDeleteCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new DeleteCommand();
    command(
        cli,
        "delete [target]",
        "Delete a preview deployment",
        async (context, args) => {
            await cmd.handle(context, args as DeleteCommand.Args);
        },
        (yargs) =>
            yargs
                .positional("target", {
                    type: "string",
                    description: "A preview URL or ID (auto-detected)"
                })
                .option("url", {
                    type: "string",
                    description:
                        "The FQDN of the preview deployment to delete (e.g. acme-preview-abc123.docs.buildwithfern.com)"
                })
                .option("id", {
                    type: "string",
                    description: "The preview ID to delete. Resolves the URL from the organization in fern.config.json."
                })
                .check((argv) => {
                    const sources = [argv.target, argv.url, argv.id].filter(Boolean);
                    if (sources.length === 0) {
                        throw new Error("Must provide a preview URL or --id.");
                    }
                    if (sources.length > 1) {
                        throw new Error("Provide only one of: [target], --url, or --id.");
                    }
                    return true;
                })
    );
}
