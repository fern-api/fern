import { OrgMemberRemoveInputSchema } from "@fern-api/config";
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

export declare namespace RemoveMemberCommand {
    export interface Args extends GlobalArgs {
        userId?: string;
        org?: string;
        json: boolean;
        input?: string;
    }
}

export class RemoveMemberCommand {
    public async handle(context: Context, args: RemoveMemberCommand.Args): Promise<void> {
        const { userId, org } = await this.resolveInput(context, args);
        const token = await context.getTokenOrPrompt();

        if (token.type === "organization") {
            context.stderr.error(
                `${Icons.error} Organization tokens cannot remove members. Unset the FERN_TOKEN environment variable and run 'fern auth login' to remove members.`
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
            message: `Removing user "${userId}" from organization "${org}"`,
            operation: () =>
                venus.organization.removeUser({
                    userId,
                    auth0OrgId
                })
        });

        if (response.ok) {
            if (args.json) {
                context.stdout.info(JSON.stringify({ success: true, userId, org }, null, 2));
            } else {
                context.stderr.info(`${Icons.success} Removed user "${userId}" from organization "${org}".`);
            }
            return;
        }

        response.error._visit({
            unauthorizedError: () => {
                context.stderr.error(
                    `${Icons.error} You do not have permission to remove members from organization "${org}".`
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

    private async resolveInput(
        context: Context,
        args: RemoveMemberCommand.Args
    ): Promise<{ userId: string; org: string }> {
        if (args.input != null) {
            if (args.userId != null || args.org != null) {
                throw new CliError({
                    message:
                        "--input cannot be combined with <user-id> or <org> positional arguments. The JSON payload must fully describe the input.",
                    code: CliError.Code.ConfigError
                });
            }
            const raw = await readAndParseJsonInput({ value: args.input, cwd: context.cwd });
            return validateJsonInput({
                value: raw,
                schema: OrgMemberRemoveInputSchema,
                schemaName: "org-member-remove-input"
            });
        }
        if (args.userId == null || args.org == null) {
            throw new CliError({
                message: "Missing required arguments <user-id> and <org>. Pass them positionally or via --input.",
                code: CliError.Code.ConfigError
            });
        }
        return { userId: args.userId, org: args.org };
    }
}

export function addRemoveMemberCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new RemoveMemberCommand();
    command(
        cli,
        "remove [user-id] [org]",
        "Remove a user from an organization",
        (context, args) => cmd.handle(context, args as RemoveMemberCommand.Args),
        (yargs) =>
            yargs
                .usage("\nUsage:\n  $0 org member remove [user-id] [org]")
                .positional("user-id", {
                    type: "string",
                    description: "User ID to remove"
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
                .option("input", {
                    type: "string",
                    description:
                        "JSON payload describing the removal (inline JSON, @path/to.json, or - for stdin). Run 'fern schema org-member-remove-input' to see the schema."
                })
                .example("$0 org member remove user123 acme", "# Remove user 'user123' from the 'acme' organization")
                .example(
                    '$0 org member remove --input \'{"userId":"user123","org":"acme"}\'',
                    "# Non-interactive: pass the full payload as JSON"
                )
    );
}
