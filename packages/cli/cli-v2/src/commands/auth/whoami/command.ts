import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { command } from "../../_internal/command.js";

export declare namespace WhoamiCommand {
    export interface Args extends GlobalArgs {
        json: boolean;
    }
}

export class WhoamiCommand {
    public async handle(context: Context, args: WhoamiCommand.Args): Promise<void> {
        const activeAccount = await context.tokenService.getActiveAccountInfo();
        if (activeAccount == null) {
            if (args.json) {
                // JSON consumers expect the error envelope on stdout; mirror
                // the human render to stderr via the error boundary.
                context.stdout.info(JSON.stringify({ user: null, loggedIn: false }, null, 2));
            }
            throw new CliError({
                code: CliError.Code.AuthError,
                message: "You are not logged in to Fern.",
                hint: "Run `fern auth login`, or set the FERN_TOKEN environment variable."
            });
        }

        if (args.json) {
            context.stdout.info(JSON.stringify({ email: activeAccount.user }, null, 2));
            return;
        }

        context.stdout.info(chalk.bold(activeAccount.user));
    }
}

export function addWhoamiCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new WhoamiCommand();
    command(
        cli,
        "whoami",
        "Print the current user",
        (context, args) => cmd.handle(context, args as WhoamiCommand.Args),
        (yargs) =>
            yargs.option("json", {
                type: "boolean",
                default: false,
                description: "Output as JSON"
            })
    );
}
