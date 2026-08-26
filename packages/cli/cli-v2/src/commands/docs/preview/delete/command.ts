import { createFdrService } from "@fern-api/core";
import { assertNever } from "@fern-api/core-utils";
import {
    PreviewSiteLookup,
    buildPreviewDomain,
    isPreviewUrl as isPreviewUrlUtil,
    lookupPreviewSiteUrl,
    splitPreviewUrl
} from "@fern-api/docs-preview";
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
        const resolved = this.resolveTarget(args);

        // Validate the URL before asking the user to log in
        if (resolved.type === "url" && !isPreviewUrlUtil(resolved.value)) {
            throw new CliError({
                message:
                    `Invalid preview URL: ${resolved.value}\n` +
                    `  Preview URLs follow the pattern: {org}-preview-{hash}.docs.buildwithfern.com`,
                code: CliError.Code.ConfigError
            });
        }

        const token = await context.getTokenOrPrompt();
        const fdr = createFdrService({ token: token.value, headers: context.headers });

        const resolvedUrl = await this.resolveUrl(context, resolved, fdr);

        context.stderr.debug(`Deleting preview site: ${resolvedUrl}`);

        try {
            await fdr.docs.v2.write.deleteDocsSite({
                url: resolvedUrl as Parameters<typeof fdr.docs.v2.write.deleteDocsSite>[0]["url"]
            });
        } catch (error) {
            const errorObj = error as Record<string, unknown>;
            const errorType = errorObj?.error as string | undefined;
            switch (errorType) {
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

    /**
     * Resolves the target to the URL FDR stores for the site, which includes the
     * basepath the preview was published under. A preview ID — and likewise a
     * bare hostname — only determines the hostname, so the deployment has to be
     * looked up rather than assumed to live at the root.
     */
    private async resolveUrl(
        context: Context,
        resolved: { type: "url"; value: string } | { type: "id"; value: string },
        fdr: ReturnType<typeof createFdrService>
    ): Promise<string> {
        if (resolved.type === "id") {
            const workspace = await context.loadWorkspaceOrThrow();
            const hostname = buildPreviewDomain({ orgId: workspace.org, previewId: resolved.value });
            const url = await this.lookupSiteUrl({ fdr, hostname, target: `preview ID "${resolved.value}"` });
            context.stderr.debug(`Resolved preview ID "${resolved.value}" to URL: ${url}`);
            return url;
        }

        const { hostname, path } = splitPreviewUrl(resolved.value);
        if (path !== "") {
            return `${hostname}${path}`;
        }
        return this.lookupSiteUrl({ fdr, hostname, target: hostname });
    }

    private async lookupSiteUrl({
        fdr,
        hostname,
        target
    }: {
        fdr: ReturnType<typeof createFdrService>;
        hostname: string;
        /** How to refer to what the user asked to delete, e.g. `preview ID "mr-2"`. */
        target: string;
    }): Promise<string> {
        let lookup: PreviewSiteLookup;
        try {
            lookup = await lookupPreviewSiteUrl({
                listPreviewUrls: (listArgs) => fdr.docs.v2.read.listAllDocsUrls(listArgs),
                hostname
            });
        } catch (error) {
            if ((error as Record<string, unknown>)?.error === "UnauthorizedError") {
                throw CliError.unauthorized(
                    "You do not have permissions to list preview deployments. Reach out to support@buildwithfern.com"
                );
            }
            throw new CliError({
                message: `Failed to look up the preview deployment for ${target}.`,
                code: CliError.Code.InternalError
            });
        }

        switch (lookup.type) {
            case "found":
                return lookup.url;
            case "notFound":
                throw CliError.notFound(
                    `No preview deployment found for ${target} (${hostname}).\n` +
                        "  Run 'fern docs preview list' to see the preview deployments you can delete."
                );
            case "ambiguous":
                throw new CliError({
                    message:
                        `${hostname} serves more than one preview site:\n` +
                        `${lookup.urls.map((url) => `  ${url}`).join("\n")}\n` +
                        "  Pass the full URL of the one you want to delete.",
                    code: CliError.Code.ConfigError
                });
            case "scanLimitReached":
                throw new CliError({
                    message:
                        `Could not find ${target} (${hostname}) in the first ${lookup.pagesScanned} pages of preview deployments.\n` +
                        "  Pass the full preview URL, including its basepath, instead.",
                    code: CliError.Code.ConfigError
                });
            default:
                assertNever(lookup);
        }
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
