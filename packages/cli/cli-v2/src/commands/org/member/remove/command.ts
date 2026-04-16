import { createVenusService } from "@fern-api/core";
import { CliError } from "@fern-api/task-context";
import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { Icons } from "../../../../ui/format.js";
import { withSpinner } from "../../../../ui/withSpinner.js";
import { command } from "../../../_internal/command.js";

export declare namespace RemoveMemberCommand {
    export interface Args extends GlobalArgs {
        userId: string;
        org: string;
        json: boolean;
    }
}

export class RemoveMemberCommand {
    public async handle(context: Context, args: RemoveMemberCommand.Args): Promise<void> {
        const token = await context.getTokenOrPrompt();

        if (token.type === "organization") {
            context.stderr.error(
                `${Icons.error} Organization tokens cannot remove members. Unset the FERN_TOKEN environment variable and run 'fern auth login' to remove members.`
            );
            throw new CliError({ code: CliError.Code.AuthError });
        }

        const venus = createVenusService({ token: token.value });

        const orgLookup = await venus.organization.get(args.org);
        if (!orgLookup.ok) {
            orgLookup.error._visit({
                unauthorizedError: () => {
                    context.stderr.error(`${Icons.error} You do not have access to organization "${args.org}".`);
                    throw new CliError({ code: CliError.Code.AuthError });
                },
                _other: () => {
                    context.stderr.error(`${Icons.error} Organization "${args.org}" was not found.`);
                    throw CliError.notFound();
                }
            });
            return;
        }
        const auth0OrgId = orgLookup.body.auth0Id;
        const userId = args.userId;

        const response = await withSpinner({
            message: `Removing user "${userId}" from organization "${args.org}"`,
            operation: () =>
                venus.organization.removeUser({
                    userId,
                    auth0OrgId
                })
        });

        if (response.ok) {
            if (args.json) {
                context.stdout.info(JSON.stringify({ success: true, userId, org: args.org }, null, 2));
            } else {
                context.stderr.info(`${Icons.success} Removed user "${userId}" from organization "${args.org}".`);
            }
            return;
        }

        response.error._visit({
            unauthorizedError: () => {
                context.stderr.error(
                    `${Icons.error} You do not have permission to remove members from organization "${args.org}".`
                );
                throw new CliError({ code: CliError.Code.AuthError });
            },
            userIdDoesNotExistError: () => {
                context.stderr.error(`${Icons.error} User "${userId}" was not found.`);
                throw CliError.notFound();
            },
            _other: () => {
                context.stderr.error(
                    `${Icons.error} Failed to remove member.\n` +
                        `\n  Please contact support@buildwithfern.com for assistance.`
                );
                throw CliError.internalError();
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
                    description: "Organization name (e.g. acme)"
                })
                .option("json", {
                    type: "boolean",
                    default: false,
                    description: "Output as JSON"
                })
                .example("$0 org member remove user123 acme", "# Remove user 'user123' from the 'acme' organization")
    );
}
