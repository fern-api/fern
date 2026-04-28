import { OrgMemberInviteInputSchema } from "@fern-api/config";
import { createVenusService } from "@fern-api/core";
import { CliError } from "@fern-api/task-context";
import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { Icons } from "../../../../ui/format.js";
import { withSpinner } from "../../../../ui/withSpinner.js";
import { command } from "../../../_internal/command.js";
import { readAndParseJsonInput } from "../../../_internal/resolveJsonInput.js";
import { validateJsonInput } from "../../../_internal/validateJsonInput.js";

export declare namespace InviteMemberCommand {
    export interface Args extends GlobalArgs {
        email?: string;
        org?: string;
        json: boolean;
        params?: string;
    }
}

export class InviteMemberCommand {
    public async handle(context: Context, args: InviteMemberCommand.Args): Promise<void> {
        const { email, org } = await this.resolveInput(context, args);
        const token = await context.getTokenOrPrompt();

        if (token.type === "organization") {
            context.stderr.error(
                `${Icons.error} Organization tokens cannot manage members. Unset the FERN_TOKEN environment variable and run 'fern auth login' to manage members.`
            );
            throw new CliError({ code: CliError.Code.AuthError });
        }

        const venus = createVenusService({ token: token.value });

        const orgLookup = await venus.organization.get(org);
        if (!orgLookup.ok) {
            orgLookup.error._visit({
                unauthorizedError: () => {
                    context.stderr.error(`${Icons.error} You do not have access to organization "${org}".`);
                    throw new CliError({ code: CliError.Code.AuthError });
                },
                _other: () => {
                    context.stderr.error(`${Icons.error} Organization "${org}" was not found.`);
                    throw CliError.notFound();
                }
            });
            return;
        }
        const auth0OrgId = orgLookup.body.auth0Id;

        const response = await withSpinner({
            message: `Inviting "${email}" to organization "${org}"`,
            operation: () =>
                venus.organization.inviteUser({
                    emailAddress: email,
                    auth0OrgId
                })
        });

        if (response.ok) {
            if (args.json) {
                context.stdout.info(JSON.stringify({ success: true, email, org }, null, 2));
            } else {
                context.stderr.info(`${Icons.success} Invited "${email}" to organization "${org}".`);
            }
            return;
        }

        response.error._visit({
            unauthorizedError: () => {
                context.stderr.error(
                    `${Icons.error} You do not have permission to invite members to organization "${org}".`
                );
                throw new CliError({ code: CliError.Code.AuthError });
            },
            userIdDoesNotExistError: () => {
                context.stderr.error(`${Icons.error} No user found with email "${email}".`);
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

    private async resolveInput(
        context: Context,
        args: InviteMemberCommand.Args
    ): Promise<{ email: string; org: string }> {
        if (args.params != null) {
            if (args.email != null || args.org != null) {
                throw new CliError({
                    message:
                        "--params cannot be combined with <email> or <org> positional arguments. The JSON payload must fully describe the input.",
                    code: CliError.Code.ConfigError
                });
            }
            const raw = await readAndParseJsonInput({ value: args.params, cwd: context.cwd });
            return validateJsonInput({
                value: raw,
                schema: OrgMemberInviteInputSchema,
                schemaName: "org-member-invite-input"
            });
        }
        if (args.email == null || args.org == null) {
            throw new CliError({
                message: "Missing required arguments <email> and <org>. Pass them positionally or via --params.",
                code: CliError.Code.ConfigError
            });
        }
        return { email: args.email, org: args.org };
    }
}

export function addInviteMemberCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new InviteMemberCommand();
    command(
        cli,
        "invite [email] [org]",
        "Invite a user to an organization",
        (context, args) => cmd.handle(context, args as InviteMemberCommand.Args),
        (yargs) =>
            yargs
                .usage("\nUsage:\n  $0 org member invite [email] [org]")
                .positional("email", {
                    type: "string",
                    description: "Email address of the user to invite"
                })
                .positional("org", {
                    type: "string",
                    description: "Organization name (e.g. acme)"
                })
                .option("json", {
                    type: "boolean",
                    default: false,
                    description: "Output as JSON"
                })
                .option("params", {
                    type: "string",
                    description:
                        "JSON payload describing the invite (inline JSON or @path/to.json (curl-style)). Run 'fern schema org-member-invite-input' to see the schema."
                })
                .example(
                    "$0 org member invite user@example.com acme",
                    "# Invite user@example.com to the 'acme' organization"
                )
                .example(
                    '$0 org member invite --params \'{"email":"user@example.com","org":"acme"}\'',
                    "# Non-interactive: pass the full payload as JSON"
                )
    );
}
