import { createVenusService } from "@fern-api/core";
import type { Argv } from "yargs";

import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { CliError } from "../../../../errors/CliError.js";
import { Icons } from "../../../../ui/format.js";
import { withSpinner } from "../../../../ui/withSpinner.js";
import { command } from "../../../_internal/command.js";

export declare namespace RevokeTokenCommand {
    export interface Args extends GlobalArgs {
        tokenId: string;
        json: boolean;
    }
}

export class RevokeTokenCommand {
    public async handle(context: Context, args: RevokeTokenCommand.Args): Promise<void> {
        const token = await context.getTokenOrPrompt();

        if (token.type === "organization") {
            context.stderr.error(
                `${Icons.error} Organization tokens cannot revoke API tokens. Unset the FERN_TOKEN environment variable and run 'fern auth login' to revoke tokens.`
            );
            throw CliError.exit();
        }

        const venus = createVenusService({ token: token.value });

        const tokenId = args.tokenId;

        const response = await withSpinner({
            message: `Revoking token "${tokenId}"`,
            operation: () => venus.apiKeys.revokeTokenById(tokenId)
        });

        if (response.ok) {
            if (args.json) {
                context.stdout.info(JSON.stringify({ success: true, tokenId }, null, 2));
            } else {
                context.stderr.info(`${Icons.success} Token "${tokenId}" has been revoked.`);
            }
            return;
        }

        response.error._visit({
            unauthorizedError: () => {
                context.stderr.error(`${Icons.error} You are not authorized to revoke this token.`);
                throw CliError.exit();
            },
            tokenNotFoundError: () => {
                context.stderr.error(`${Icons.error} Token "${tokenId}" was not found.`);
                throw CliError.exit();
            },
            _other: () => {
                context.stderr.error(
                    `${Icons.error} Failed to revoke token.\n` +
                        `\n  Please contact support@buildwithfern.com for assistance.`
                );
                throw CliError.exit();
            }
        });
    }
}

export function addRevokeTokenCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new RevokeTokenCommand();
    command(
        cli,
        "revoke <token-id>",
        "Revoke an organization API token",
        (context, args) => cmd.handle(context, args as RevokeTokenCommand.Args),
        (yargs) =>
            yargs
                .usage("\nUsage:\n  $0 org token revoke <token-id>")
                .positional("token-id", {
                    type: "string",
                    demandOption: true,
                    description: "Token ID to revoke"
                })
                .option("json", {
                    type: "boolean",
                    default: false,
                    description: "Output as JSON"
                })
                .example("$0 org token revoke abc123", "# Revoke the token with ID 'abc123'")
    );
}
