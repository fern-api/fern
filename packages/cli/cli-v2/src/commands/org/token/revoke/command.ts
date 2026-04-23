import { OrgTokenRevokeInputSchema } from "@fern-api/config";
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

export declare namespace RevokeTokenCommand {
    export interface Args extends GlobalArgs {
        tokenId?: string;
        json: boolean;
        input?: string;
    }
}

export class RevokeTokenCommand {
    public async handle(context: Context, args: RevokeTokenCommand.Args): Promise<void> {
        const tokenId = await this.resolveTokenId(context, args);
        const token = await context.getTokenOrPrompt();

        if (token.type === "organization") {
            context.stderr.error(
                `${Icons.error} Organization tokens cannot revoke API tokens. Unset the FERN_TOKEN environment variable and run 'fern auth login' to revoke tokens.`
            );
            throw new CliError({ code: CliError.Code.AuthError });
        }

        const venus = createVenusService({ token: token.value });

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
                throw new CliError({ code: CliError.Code.AuthError });
            },
            tokenNotFoundError: () => {
                context.stderr.error(`${Icons.error} Token "${tokenId}" was not found.`);
                throw CliError.notFound();
            },
            _other: () => {
                context.stderr.error(
                    `${Icons.error} Failed to revoke token.\n` +
                        `\n  Please contact support@buildwithfern.com for assistance.`
                );
                throw CliError.internalError();
            }
        });
    }

    private async resolveTokenId(context: Context, args: RevokeTokenCommand.Args): Promise<string> {
        if (args.input != null) {
            if (args.tokenId != null) {
                throw new CliError({
                    message:
                        "--input cannot be combined with the <token-id> positional argument. The JSON payload must fully describe the input.",
                    code: CliError.Code.ConfigError
                });
            }
            const raw = await readAndParseJsonInput({ value: args.input, cwd: context.cwd });
            const payload = validateJsonInput({
                value: raw,
                schema: OrgTokenRevokeInputSchema,
                schemaName: "org-token-revoke-input"
            });
            return payload.tokenId;
        }
        if (args.tokenId == null) {
            throw new CliError({
                message: "Missing required argument <token-id>. Pass it positionally or via --input.",
                code: CliError.Code.ConfigError
            });
        }
        return args.tokenId;
    }
}

export function addRevokeTokenCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new RevokeTokenCommand();
    command(
        cli,
        "revoke [token-id]",
        "Revoke an organization API token",
        (context, args) => cmd.handle(context, args as RevokeTokenCommand.Args),
        (yargs) =>
            yargs
                .usage("\nUsage:\n  $0 org token revoke [token-id]")
                .positional("token-id", {
                    type: "string",
                    description: "Token ID to revoke"
                })
                .option("json", {
                    type: "boolean",
                    default: false,
                    description: "Output as JSON"
                })
                .option("input", {
                    type: "string",
                    description:
                        "JSON payload describing the revocation (inline JSON, @path/to.json, or - for stdin). Run 'fern schema org-token-revoke-input' to see the schema."
                })
                .example("$0 org token revoke abc123", "# Revoke the token with ID 'abc123'")
                .example(
                    '$0 org token revoke --input \'{"tokenId":"abc123"}\'',
                    "# Non-interactive: pass the full payload as JSON"
                )
    );
}
