import { createOrganizationIfDoesNotExist, getOrganizationNameValidationError } from "@fern-api/auth";
import { CliError } from "@fern-api/task-context";

import type { Argv } from "yargs";
import { TaskContextAdapter } from "../../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { Icons } from "../../../ui/format.js";
import { withSpinner } from "../../../ui/withSpinner.js";
import { command } from "../../_internal/command.js";

export declare namespace CreateCommand {
    export interface Args extends GlobalArgs {
        name: string;
    }
}

export class CreateCommand {
    public async handle(context: Context, args: CreateCommand.Args): Promise<void> {
        const token = await context.getTokenOrPrompt();

        if (token.type === "organization") {
            context.stderr.error(
                `${Icons.error} Organization tokens cannot create organizations. Unset the FERN_TOKEN environment variable and run 'fern auth login' to create an organization.`
            );
            throw new CliError({ code: CliError.Code.AuthError });
        }

        const validationError = getOrganizationNameValidationError(args.name);
        if (validationError != null) {
            throw CliError.validationError(validationError);
        }

        const created = await withSpinner({
            message: `Creating organization "${args.name}"`,
            operation: () =>
                createOrganizationIfDoesNotExist({
                    organization: args.name,
                    token,
                    context: new TaskContextAdapter({ context })
                })
        });

        if (created) {
            context.stderr.info(`${Icons.success} Created organization "${args.name}"`);
            return;
        }

        context.stderr.info(`${Icons.info} Organization "${args.name}" already exists`);
    }
}

export function addCreateCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new CreateCommand();
    command(
        cli,
        "create <name>",
        "Create a new organization",
        (context, args) => cmd.handle(context, args as CreateCommand.Args),
        (yargs) =>
            yargs
                .usage("\nUsage:\n  $0 org create <name>")
                .positional("name", {
                    type: "string",
                    demandOption: true,
                    description: "Organization name"
                })
                .example("$0 org create acme", "# Create the 'acme' organization")
    );
}
