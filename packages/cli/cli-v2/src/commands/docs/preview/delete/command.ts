import { createFdrService } from "@fern-api/core";
import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { command } from "../../../_internal/command.js";

/**
 * Preview URLs follow the pattern: {org}-preview-{hash}.docs.buildwithfern.com
 */
const PREVIEW_URL_PATTERN = /^[a-z0-9-]+-preview-[a-z0-9-]+\.docs\.buildwithfern\.com$/i;

const DOMAIN_SUFFIX = "docs.buildwithfern.com";
const SUBDOMAIN_LIMIT = 62;

/**
 * Sanitizes a preview ID to be valid in a DNS subdomain label.
 * This MUST match the server-side sanitizePreviewId in FDR.
 */
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

/**
 * Replicates the server-side truncateDomainName logic so the CLI can predict
 * the preview URL for a given previewId.
 */
function buildPreviewDomain({ orgId, previewId }: { orgId: string; previewId: string }): string {
    const sanitizedId = sanitizePreviewId(previewId);
    const fullDomain = `${orgId}-preview-${sanitizedId}.${DOMAIN_SUFFIX}`;
    if (fullDomain.length <= SUBDOMAIN_LIMIT) {
        return fullDomain;
    }

    const prefix = `${orgId}-preview-`;
    const availableSpace = SUBDOMAIN_LIMIT - prefix.length;

    const minIdLength = 8;
    if (availableSpace < minIdLength) {
        throw new Error(`Organization name "${orgId}" is too long to generate a valid preview URL`);
    }

    const truncatedId = sanitizedId.slice(0, availableSpace).replace(/-+$/, "");
    return `${prefix}${truncatedId}.${DOMAIN_SUFFIX}`;
}

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

        if (!this.isPreviewUrl(resolvedUrl)) {
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
        if (this.isPreviewUrl(args.target)) {
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

    private isPreviewUrl(url: string): boolean {
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
