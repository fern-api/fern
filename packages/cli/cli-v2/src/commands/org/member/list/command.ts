import { createVenusService } from "@fern-api/core";
import type { Argv } from "yargs";

import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { CliError } from "../../../../errors/CliError.js";
import { Colors, Icons } from "../../../../ui/format.js";
import { withSpinner } from "../../../../ui/withSpinner.js";
import { command } from "../../../_internal/command.js";

export declare namespace ListMembersCommand {
    export interface Args extends GlobalArgs {
        org: string;
        json: boolean;
    }
}

export class ListMembersCommand {
    public async handle(context: Context, args: ListMembersCommand.Args): Promise<void> {
        const token = await context.getTokenOrPrompt();

        if (token.type === "organization") {
            context.stderr.error(
                `${Icons.error} Organization tokens cannot list members. Unset the FERN_TOKEN environment variable and run 'fern auth login' to list members.`
            );
            throw CliError.exit();
        }

        const venus = createVenusService({ token: token.value });

        const response = await withSpinner({
            message: `Fetching members of organization "${args.org}"`,
            operation: () => venus.organization.get(args.org)
        });

        if (!response.ok) {
            response.error._visit({
                unauthorizedError: () => {
                    context.stderr.error(`${Icons.error} You do not have access to organization "${args.org}".`);
                    throw CliError.exit();
                },
                _other: () => {
                    context.stderr.error(
                        `${Icons.error} Failed to list members.\n` +
                            `\n  Please contact support@buildwithfern.com for assistance.`
                    );
                    throw CliError.exit();
                }
            });
            return;
        }

        const members = response.body.users;

        if (args.json) {
            context.stdout.info(
                JSON.stringify(
                    members.map((m) => ({
                        userId: m.userId,
                        displayName: m.displayName,
                        email: m.emailAddress ?? null
                    })),
                    null,
                    2
                )
            );
            return;
        }

        if (members.length === 0) {
            context.stderr.info(`${Icons.info} No members found in organization "${args.org}".`);
            context.stderr.info("");
            context.stderr.info("  To invite someone, run: fern org member invite <email> <org>");
            return;
        }

        for (const member of members) {
            const email = member.emailAddress != null ? `  ${Colors.dim(`<${member.emailAddress}>`)}` : "";
            context.stdout.info(`${Colors.dim(member.userId)}  ${member.displayName}${email}`);
        }
    }
}

export function addListMembersCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new ListMembersCommand();
    command(
        cli,
        "list <org>",
        "List members of an organization",
        (context, args) => cmd.handle(context, args as ListMembersCommand.Args),
        (yargs) =>
            yargs
                .usage("\nUsage:\n  $0 org member list <org>")
                .positional("org", {
                    type: "string",
                    demandOption: true,
                    description: "Organization name (e.g. acme)"
                })
                .option("json", {
                    type: "boolean",
                    default: false,
                    description: "Output as JSON"
                })
                .example("$0 org member list acme", "# List all members of the 'acme' organization")
    );
}
