import { createVenusService } from "@fern-api/core";
import type { Argv } from "yargs";

import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { CliError } from "../../../../errors/CliError.js";
import { Icons } from "../../../../ui/format.js";
import { withSpinner } from "../../../../ui/withSpinner.js";
import { command } from "../../../_internal/command.js";

export declare namespace RemoveMemberCommand {
    export interface Args extends GlobalArgs {
        "user-id": string;
        org: string;
    }
}

export class RemoveMemberCommand {
    public async handle(context: Context, args: RemoveMemberCommand.Args): Promise<void> {
        const token = await context.getTokenOrPrompt();

        if (token.type === "organization") {
            context.stderr.error(
                `${Icons.error} Organization tokens cannot remove members. Unset the FERN_TOKEN environment variable and run 'fern auth login' to remove members.`
            );
            throw CliError.exit();
        }

        const venus = createVenusService({ token: token.value });

        const userId = args["user-id"];

        const response = await withSpinner({
            message: `Removing user "${userId}" from organization "${args.org}"`,
            operation: () =>
                venus.organization.removeUser({
                    userId,
                    auth0OrgId: args.org
                })
        });

        if (response.ok) {
            context.stderr.info(`${Icons.success} Removed user "${userId}" from organization "${args.org}".`);
            return;
        }

        response.error._visit({
            unauthorizedError: () => {
                context.stderr.error(
                    `${Icons.error} You do not have permission to remove members from organization "${args.org}".`
                );
                throw CliError.exit();
            },
            userIdDoesNotExistError: () => {
                context.stderr.error(`${Icons.error} User "${userId}" was not found.`);
                throw CliError.exit();
            },
            _other: () => {
                context.stderr.error(
                    `${Icons.error} Failed to remove member.\n` +
                        `\n  Please contact support@buildwithfern.com for assistance.`
                );
                throw CliError.exit();
            }
        });
    }
}

export function addRemoveMemberCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new RemoveMemberCommand();
    command(
        cli,
        "remove <user-id> <org>",
        "Remove a user from an organization",
        (context, args) => cmd.handle(context, args as RemoveMemberCommand.Args),
        (yargs) =>
            yargs
                .usage("\nUsage:\n  $0 org member remove <user-id> <org>")
                .positional("user-id", {
                    type: "string",
                    demandOption: true,
                    description: "User ID to remove"
                })
                .positional("org", {
                    type: "string",
                    demandOption: true,
                    description: "Organization ID"
                })
                .example("$0 org member remove user123 acme", "# Remove user 'user123' from the 'acme' organization")
    );
}
