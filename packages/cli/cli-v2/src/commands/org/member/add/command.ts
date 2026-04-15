import { createVenusService } from "@fern-api/core";
import { CliError } from "@fern-api/task-context";
import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { Icons } from "../../../../ui/format.js";
import { withSpinner } from "../../../../ui/withSpinner.js";
import { command } from "../../../_internal/command.js";

export declare namespace InviteMemberCommand {
    export interface Args extends GlobalArgs {
        email: string;
        org: string;
        json: boolean;
    }
}

export class InviteMemberCommand {
    public async handle(context: Context, args: InviteMemberCommand.Args): Promise<void> {
        const token = await context.getTokenOrPrompt();

        if (token.type === "organization") {
            context.stderr.error(
                `${Icons.error} Organization tokens cannot manage members. Unset the FERN_TOKEN environment variable and run 'fern auth login' to manage members.`
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

        const response = await withSpinner({
            message: `Inviting "${args.email}" to organization "${args.org}"`,
            operation: () =>
                venus.organization.inviteUser({
                    emailAddress: args.email,
                    auth0OrgId
                })
        });

        if (response.ok) {
            if (args.json) {
                context.stdout.info(JSON.stringify({ success: true, email: args.email, org: args.org }, null, 2));
            } else {
                context.stderr.info(`${Icons.success} Invited "${args.email}" to organization "${args.org}".`);
            }
            return;
        }

        response.error._visit({
            unauthorizedError: () => {
                context.stderr.error(
                    `${Icons.error} You do not have permission to invite members to organization "${args.org}".`
                );
                throw new CliError({ code: CliError.Code.AuthError });
            },
            userIdDoesNotExistError: () => {
                context.stderr.error(`${Icons.error} No user found with email "${args.email}".`);
                throw CliError.notFound();
            },
            _other: () => {
                context.stderr.error(
                    `${Icons.error} Failed to invite member.\n` +
                        `\n  Please contact support@buildwithfern.com for assistance.`
                );
                throw CliError.internalError();
            }
        });
    }
}

export function addInviteMemberCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new InviteMemberCommand();
    command(
        cli,
        "invite <email> <org>",
        "Invite a user to an organization",
        (context, args) => cmd.handle(context, args as InviteMemberCommand.Args),
        (yargs) =>
            yargs
                .usage("\nUsage:\n  $0 org member invite <email> <org>")
                .positional("email", {
                    type: "string",
                    demandOption: true,
                    description: "Email address of the user to invite"
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
                .example(
                    "$0 org member invite user@example.com acme",
                    "# Invite user@example.com to the 'acme' organization"
                )
    );
}
