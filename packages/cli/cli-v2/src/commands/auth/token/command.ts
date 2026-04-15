import { createOrganizationIfDoesNotExist } from "@fern-api/auth";
import { createVenusService } from "@fern-api/core";
import { CliError } from "@fern-api/task-context";
import type { Argv } from "yargs";
import { TaskContextAdapter } from "../../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";

export declare namespace TokenCommand {
    export interface Args extends GlobalArgs {
        org?: string;
    }
}

export class TokenCommand {
    public async handle(context: Context, args: TokenCommand.Args): Promise<void> {
        const orgId = await this.resolveOrganization(context, args);

        const token = await context.getTokenOrPrompt();
        if (token.type === "user") {
            // If we have a user token, create the organization if it doesn't already exist.
            await createOrganizationIfDoesNotExist({
                organization: orgId,
                token,
                context: new TaskContextAdapter({ context })
            });
        }

        const venus = createVenusService({ token: token.value });
        const response = await venus.registry.generateRegistryTokens({
            organizationId: orgId
        });
        if (response.ok) {
            // Output raw token (no newline for piping compatibility).
            process.stdout.write(response.body.npm.token);
            return;
        }

        response.error._visit({
            organizationNotFoundError: () => {
                process.stderr.write(`${Icons.error} Organization "${orgId}" was not found.\n`);
                throw new CliError({
                    code: CliError.Code.ConfigError
                });
            },
            unauthorizedError: () => {
                process.stderr.write(`${Icons.error} You do not have access to organization "${orgId}".\n`);
                throw new CliError({
                    code: CliError.Code.AuthError
                });
            },
            missingOrgPermissionsError: () => {
                process.stderr.write(
                    `${Icons.error} You do not have the required permissions in organization "${orgId}".\n`
                );
                throw new CliError({
                    code: CliError.Code.AuthError
                });
            },
            _other: () => {
                process.stderr.write(
                    `${Icons.error} Failed to generate token.\n` +
                        `\n  Please contact support@buildwithfern.com for assistance.\n`
                );
                throw new CliError({
                    code: CliError.Code.InternalError
                });
            }
        });
    }

    private async resolveOrganization(context: Context, args: TokenCommand.Args): Promise<string> {
        if (args.org != null) {
            return args.org;
        }
        try {
            const workspace = await context.loadWorkspaceOrThrow();
            return workspace.org;
        } catch {
            process.stderr.write(
                `${Icons.error} No organization specified.\n` +
                    `\n  Run fern init or specify an organization with --org, then run this command again.\n`
            );
            throw new CliError({ code: CliError.Code.ConfigError });
        }
    }
}

export function addTokenCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new TokenCommand();
    command(
        cli,
        "token",
        "Generate an organization access token (FERN_TOKEN)",
        (context, args) => cmd.handle(context, args as TokenCommand.Args),
        (yargs) =>
            yargs
                .option("org", {
                    type: "string",
                    description: "Organization to generate token for (defaults to organization in fern.yml)"
                })
                .example("$0 auth token", "Generate token for workspace organization")
                .example("$0 auth token --org acme", "Generate token for specific organization")
                .example("export FERN_TOKEN=$($0 auth token)", "Export token to variable")
    );
}
