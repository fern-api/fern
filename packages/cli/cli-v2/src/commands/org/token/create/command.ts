import { OrgTokenCreateInputSchema } from "@fern-api/config";
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

export declare namespace CreateTokenCommand {
    export interface Args extends GlobalArgs {
        org?: string;
        description?: string;
        json: boolean;
        params?: string;
    }
}

export class CreateTokenCommand {
    public async handle(context: Context, args: CreateTokenCommand.Args): Promise<void> {
        const { org, description } = await this.resolveInput(context, args);
        const token = await context.getTokenOrPrompt();

        if (token.type === "organization") {
            context.stderr.error(
                `${Icons.error} Organization tokens cannot manage API tokens. Unset the FERN_TOKEN environment variable and run 'fern auth login' to manage tokens.`
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
            message: `Creating token for organization "${org}"`,
            operation: () =>
                venus.apiKeys.create({
                    organizationId: auth0OrgId,
                    description
                })
        });

        if (response.ok) {
            if (args.json) {
                context.stdout.info(
                    JSON.stringify({ tokenId: response.body.tokenId, token: response.body.token }, null, 2)
                );
            } else {
                context.stderr.info(`${Icons.success} Token created successfully`);
                context.stderr.info("");
                context.stderr.info(`  Token ID: ${response.body.tokenId}`);
                context.stderr.info("  Save this token now. You won't be able to see it again.");
                context.stderr.info("");
                context.stdout.info(response.body.token);
            }
            return;
        }

        response.error._visit({
            unauthorizedError: () => {
                context.stderr.error(`${Icons.error} You do not have access to organization "${org}".`);
                throw new CliError({ code: CliError.Code.AuthError });
            },
            organizationNotFoundError: () => {
                context.stderr.error(`${Icons.error} Organization "${org}" was not found.`);
                throw CliError.notFound();
            },
            _other: () => {
                context.stderr.error(
                    `${Icons.error} Failed to create token.\n` +
                        `\n  Please contact support@buildwithfern.com for assistance.`
                );
                throw CliError.internalError();
            }
        });
    }

    private async resolveInput(
        context: Context,
        args: CreateTokenCommand.Args
    ): Promise<{ org: string; description: string | undefined }> {
        if (args.params != null) {
            if (args.org != null || args.description != null) {
                throw new CliError({
                    message:
                        "--params cannot be combined with <org> or --description. The JSON payload must fully describe the input.",
                    code: CliError.Code.ConfigError
                });
            }
            const raw = await readAndParseJsonInput({ value: args.params, cwd: context.cwd });
            const payload = validateJsonInput({
                value: raw,
                schema: OrgTokenCreateInputSchema,
                schemaName: "org-token-create-input"
            });
            return { org: payload.org, description: payload.description };
        }
        if (args.org == null) {
            throw new CliError({
                message: "Missing required argument <org>. Pass it positionally or via --params.",
                code: CliError.Code.ConfigError
            });
        }
        return { org: args.org, description: args.description };
    }
}

export function addCreateTokenCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new CreateTokenCommand();
    command(
        cli,
        "create [org]",
        "Create an organization API token",
        (context, args) => cmd.handle(context, args as CreateTokenCommand.Args),
        (yargs) =>
            yargs
                .usage("\nUsage:\n  $0 org token create [org]")
                .positional("org", {
                    type: "string",
                    description: "Organization name (e.g. acme)"
                })
                .option("description", {
                    type: "string",
                    description: "Description for the token"
                })
                .option("json", {
                    type: "boolean",
                    default: false,
                    description: "Output as JSON"
                })
                .option("params", {
                    type: "string",
                    description:
                        "JSON payload describing the token to create (inline JSON or @path/to.json (curl-style)). Run 'fern schema org-token-create-input' to see the schema."
                })
                .example("$0 org token create acme", "# Create a token for the 'acme' organization")
                .example('$0 org token create acme --description "CI token"', "# Create a token with a description")
                .example(
                    '$0 org token create --params \'{"org":"acme","description":"CI token"}\'',
                    "# Non-interactive: pass the full payload as JSON"
                )
    );
}
