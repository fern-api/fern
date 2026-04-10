import { createVenusService } from "@fern-api/core";
import type { Argv } from "yargs";

import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { CliError } from "../../../../errors/CliError.js";
import { Colors, Icons } from "../../../../ui/format.js";
import { withSpinner } from "../../../../ui/withSpinner.js";
import { command } from "../../../_internal/command.js";

export declare namespace ListTokensCommand {
    export interface Args extends GlobalArgs {
        org: string;
    }
}

export class ListTokensCommand {
    public async handle(context: Context, args: ListTokensCommand.Args): Promise<void> {
        const token = await context.getTokenOrPrompt();

        const venus = createVenusService({ token: token.value });

        const response = await withSpinner({
            message: `Fetching tokens for organization "${args.org}"`,
            operation: () => venus.apiKeys.getTokensForOrganization(args.org)
        });

        if (!response.ok) {
            response.error._visit({
                unauthorizedError: () => {
                    context.stderr.error(`${Icons.error} You do not have access to organization "${args.org}".`);
                    throw CliError.exit();
                },
                organizationNotFoundError: () => {
                    context.stderr.error(`${Icons.error} Organization "${args.org}" was not found.`);
                    throw CliError.exit();
                },
                _other: () => {
                    context.stderr.error(
                        `${Icons.error} Failed to list tokens.\n` +
                            `\n  Please contact support@buildwithfern.com for assistance.`
                    );
                    throw CliError.exit();
                }
            });
            return;
        }

        const tokens = response.body;

        if (tokens.length === 0) {
            context.stderr.info(`${Icons.info} No tokens found for organization "${args.org}".`);
            context.stderr.info("");
            context.stderr.info("  To create one, run: fern org token create <org>");
            return;
        }

        for (const meta of tokens) {
            const status =
                meta.status.type === "active"
                    ? Colors.green("active")
                    : meta.status.type === "revoked"
                      ? Colors.red("revoked")
                      : Colors.dim("expired");
            const description = meta.description != null ? `  ${Colors.dim(meta.description)}` : "";
            const created = meta.createdTime.toLocaleDateString();
            context.stdout.info(`${meta.tokenId}  ${status}  ${Colors.dim(created)}${description}`);
        }
    }
}

export function addListTokensCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new ListTokensCommand();
    command(
        cli,
        "list <org>",
        "List tokens for an organization",
        (context, args) => cmd.handle(context, args as ListTokensCommand.Args),
        (yargs) =>
            yargs
                .usage("\nUsage:\n  $0 org token list <org>")
                .positional("org", {
                    type: "string",
                    demandOption: true,
                    description: "Organization ID"
                })
                .example("$0 org token list acme", "# List all tokens for the 'acme' organization")
    );
}
