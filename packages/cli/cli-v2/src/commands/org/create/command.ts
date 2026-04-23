import { createOrganizationIfDoesNotExist, getOrganizationNameValidationError } from "@fern-api/auth";
import { OrgCreateInputSchema } from "@fern-api/config";
import { CliError } from "@fern-api/task-context";

import type { Argv } from "yargs";
import { TaskContextAdapter } from "../../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { Icons } from "../../../ui/format.js";
import { withSpinner } from "../../../ui/withSpinner.js";
import { command } from "../../_internal/command.js";
import { readAndParseJsonInput } from "../../_internal/resolveJsonInput.js";
import { validateJsonInput } from "../../_internal/validateJsonInput.js";

export declare namespace CreateCommand {
    export interface Args extends GlobalArgs {
        name?: string;
        input?: string;
    }
}

export class CreateCommand {
    public async handle(context: Context, args: CreateCommand.Args): Promise<void> {
        const name = await this.resolveName(context, args);

        const token = await context.getTokenOrPrompt();

        if (token.type === "organization") {
            context.stderr.error(
                `${Icons.error} Organization tokens cannot create organizations. Unset the FERN_TOKEN environment variable and run 'fern auth login' to create an organization.`
            );
            throw new CliError({ code: CliError.Code.AuthError });
        }

        const validationError = getOrganizationNameValidationError(name);
        if (validationError != null) {
            throw CliError.validationError(validationError);
        }

        const created = await withSpinner({
            message: `Creating organization "${name}"`,
            operation: () =>
                createOrganizationIfDoesNotExist({
                    organization: name,
                    token,
                    context: new TaskContextAdapter({ context })
                })
        });

        if (created) {
            context.stderr.info(`${Icons.success} Created organization "${name}"`);
            return;
        }

        context.stderr.info(`${Icons.info} Organization "${name}" already exists`);
    }

    private async resolveName(context: Context, args: CreateCommand.Args): Promise<string> {
        if (args.input != null) {
            if (args.name != null) {
                throw new CliError({
                    message:
                        "--input cannot be combined with the <name> positional argument. The JSON payload must fully describe the input.",
                    code: CliError.Code.ConfigError
                });
            }
            const raw = await readAndParseJsonInput({ value: args.input, cwd: context.cwd });
            const payload = validateJsonInput({
                value: raw,
                schema: OrgCreateInputSchema,
                schemaName: "org-create-input"
            });
            return payload.name;
        }
        if (args.name == null) {
            throw new CliError({
                message: "Missing required argument: name. Pass it positionally or via --input.",
                code: CliError.Code.ConfigError
            });
        }
        return args.name;
    }
}

export function addCreateCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new CreateCommand();
    command(
        cli,
        "create [name]",
        "Create a new organization",
        (context, args) => cmd.handle(context, args as CreateCommand.Args),
        (yargs) =>
            yargs
                .usage("\nUsage:\n  $0 org create [name]")
                .positional("name", {
                    type: "string",
                    description: "Organization name"
                })
                .option("input", {
                    type: "string",
                    description:
                        "JSON payload describing the org to create (inline JSON, @path/to.json, or - for stdin). Run 'fern schema org-create-input' to see the schema."
                })
                .example("$0 org create acme", "# Create the 'acme' organization")
                .example(
                    '$0 org create --input \'{"name":"acme"}\'',
                    "# Non-interactive: pass the full payload as JSON"
                )
    );
}
