import { createVenusService } from "@fern-api/core";
import type { Argv } from "yargs";

import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { CliError } from "../../../../errors/CliError.js";
import { Icons } from "../../../../ui/format.js";
import { withSpinner } from "../../../../ui/withSpinner.js";
import { command } from "../../../_internal/command.js";

export declare namespace AddMemberCommand {
    export interface Args extends GlobalArgs {
        email: string;
        org: string;
    }
}

export class AddMemberCommand {
    public async handle(context: Context, args: AddMemberCommand.Args): Promise<void> {
        const token = await context.getTokenOrPrompt();

        if (token.type === "organization") {
            context.stderr.error(
                `${Icons.error} Organization tokens cannot manage members. Unset the FERN_TOKEN environment variable and run 'fern auth login' to manage members.`
            );
            throw CliError.exit();
        }

        const venus = createVenusService({ token: token.value });

        const response = await withSpinner({
            message: `Inviting "${args.email}" to organization "${args.org}"`,
            operation: () =>
                venus.organization.inviteUser({
                    emailAddress: args.email,
                    auth0OrgId: args.org
                })
        });

        if (response.ok) {
            context.stderr.info(`${Icons.success} Invited "${args.email}" to organization "${args.org}".`);
            return;
        }

        response.error._visit({
            unauthorizedError: () => {
                context.stderr.error(
                    `${Icons.error} You do not have permission to invite members to organization "${args.org}".`
                );
                throw CliError.exit();
            },
            userIdDoesNotExistError: () => {
                context.stderr.error(`${Icons.error} No user found with email "${args.email}".`);
                throw CliError.exit();
            },
            _other: () => {
                context.stderr.error(
                    `${Icons.error} Failed to invite member.\n` +
                        `\n  Please contact support@buildwithfern.com for assistance.`
                );
                throw CliError.exit();
            }
        });
    }
}

export function addAddMemberCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new AddMemberCommand();
    command(
        cli,
        "add <email> <org>",
        "Invite a user to an organization",
        (context, args) => cmd.handle(context, args as AddMemberCommand.Args),
        (yargs) =>
            yargs
                .usage("\nUsage:\n  $0 org member add <email> <org>")
                .positional("email", {
                    type: "string",
                    demandOption: true,
                    description: "Email address of the user to invite"
                })
                .positional("org", {
                    type: "string",
                    demandOption: true,
                    description: "Organization ID"
                })
                .example(
                    "$0 org member add user@example.com acme",
                    "# Invite user@example.com to the 'acme' organization"
                )
    );
}
