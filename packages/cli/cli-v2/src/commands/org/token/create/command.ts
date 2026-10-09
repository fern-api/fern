import { createVenusService } from "@fern-api/core";
import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import inquirer from "inquirer";
import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { Icons } from "../../../../ui/format.js";
import { withSpinner } from "../../../../ui/withSpinner.js";
import { command } from "../../../_internal/command.js";

export declare namespace CreateTokenCommand {
    export interface Args extends GlobalArgs {
        org: string;
        description?: string;
        json: boolean;
    }
}

export class CreateTokenCommand {
    public async handle(context: Context, args: CreateTokenCommand.Args): Promise<void> {
        const token = await context.getTokenOrPrompt();

        if (token.type === "organization") {
            context.stderr.error(
                `${Icons.error} Organization tokens cannot manage API tokens. Unset the FERN_TOKEN environment variable and run 'fern auth login' to manage tokens.`
            );
            throw new CliError({ code: CliError.Code.AuthError });
        }

        const venus = createVenusService({ token: token.value, headers: context.headers });

        const orgLookup = await venus.organization.get({ orgId: args.org });
        if (!orgLookup.ok) {
            const status = orgLookup.rawResponse.status;
            if (status === 401 || status === 403) {
                context.stderr.error(`${Icons.error} You do not have access to organization "${args.org}".`);
                throw new CliError({ code: CliError.Code.AuthError });
            }
            context.stderr.error(`${Icons.error} Organization "${args.org}" was not found.`);
            throw CliError.notFound();
        }
        const auth0OrgId = orgLookup.body.auth0Id;

        let description = args.description;
        if (description == null && context.isTTY) {
            const { desc } = await inquirer.prompt<{ desc: string }>([
                {
                    type: "input",
                    name: "desc",
                    message: `Description ${chalk.dim("(optional, press Enter to skip)")}:`
                }
            ]);
            if (desc.trim().length > 0) {
                description = desc.trim();
            }
        }

        const response = await withSpinner({
            message: `Creating token for organization "${args.org}"`,
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

        const status = response.rawResponse.status;
        if (status === 401 || status === 403) {
            context.stderr.error(`${Icons.error} You do not have access to organization "${args.org}".`);
            throw new CliError({ code: CliError.Code.AuthError });
        }
        if (status === 404) {
            context.stderr.error(`${Icons.error} Organization "${args.org}" was not found.`);
            throw CliError.notFound();
        }
        context.stderr.error(
            `${Icons.error} Failed to create token.\n` + `\n  Please contact support@buildwithfern.com for assistance.`
        );
        throw CliError.internalError();
    }
}

export function addCreateTokenCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new CreateTokenCommand();
    command(
        cli,
        "create <org>",
        "Create an organization API token",
        (context, args) => cmd.handle(context, args as CreateTokenCommand.Args),
        (yargs) =>
            yargs
                .usage("\nUsage:\n  $0 org token create <org>")
                .positional("org", {
                    type: "string",
                    demandOption: true,
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
                .example("$0 org token create acme", "# Create a token for the 'acme' organization")
                .example('$0 org token create acme --description "CI token"', "# Create a token with a description")
    );
}
