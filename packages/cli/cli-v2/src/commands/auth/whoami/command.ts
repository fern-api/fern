import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { CliError } from "../../../errors/CliError.js";
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
            context.stdout.warn(`${chalk.yellow("⚠")} You are not logged in to Fern.`);
            context.stdout.info("");
            context.stdout.info(chalk.dim("  To log in, run: fern auth login"));
            throw CliError.exit();
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
