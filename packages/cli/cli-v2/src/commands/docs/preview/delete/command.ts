import { createFdrService } from "@fern-api/core";
import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { CliError } from "../../../../errors/CliError.js";
import { command } from "../../../_internal/command.js";

/**
 * Preview URLs follow the pattern: {org}-preview-{hash}.docs.buildwithfern.com
 */
const PREVIEW_URL_PATTERN = /^[a-z0-9-]+-preview-[a-z0-9-]+\.docs\.buildwithfern\.com$/i;

export declare namespace DeleteCommand {
    export interface Args extends GlobalArgs {
        url: string;
    }
}

export class DeleteCommand {
    public async handle(context: Context, args: DeleteCommand.Args): Promise<void> {
        if (!this.isPreviewUrl(args.url)) {
            throw new CliError({
                message:
                    `Invalid preview URL: ${args.url}\n` +
                    `  Preview URLs follow the pattern: {org}-preview-{hash}.docs.buildwithfern.com`
            });
        }

        const token = await context.getTokenOrPrompt();
        const fdr = createFdrService({ token: token.value });

        context.stderr.debug(`Deleting preview site: ${args.url}`);

        const deleteResponse = await fdr.docs.v2.write.deleteDocsSite({
            url: args.url as Parameters<typeof fdr.docs.v2.write.deleteDocsSite>[0]["url"]
        });
        if (!deleteResponse.ok) {
            switch (deleteResponse.error.error) {
                case "UnauthorizedError":
                    throw CliError.unauthorized(
                        "You do not have permissions to delete this preview site. Reach out to support@buildwithfern.com"
                    );
                case "DocsNotFoundError":
                    throw CliError.notFound(`Preview site not found: ${args.url}`);
                default:
                    throw new CliError({
                        message: `Failed to delete preview site: ${args.url}`
                    });
            }
        }

        context.stderr.info(chalk.green(`Successfully deleted preview site: ${args.url}`));
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
        "delete <url>",
        "Delete a preview deployment",
        async (context, args) => {
            await cmd.handle(context, args as DeleteCommand.Args);
        },
        (yargs) =>
            yargs.positional("url", {
                type: "string",
                description:
                    "The FQDN of the preview deployment to delete (e.g. acme-preview-abc123.docs.buildwithfern.com)",
                demandOption: true
            })
    );
}
