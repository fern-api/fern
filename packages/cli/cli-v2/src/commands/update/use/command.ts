import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { Icons } from "../../../ui/format.js";
import { createUpdateService } from "../../../update/createUpdateService.js";
import { command } from "../../_internal/command.js";

export declare namespace UseCommand {
    export interface Args extends GlobalArgs {
        version?: string;
    }
}

export class UseCommand {
    public async handle(context: Context, args: UseCommand.Args): Promise<void> {
        if (args.version == null || args.version.length === 0) {
            throw CliError.validationError("Missing required positional argument: <version>");
        }

        const service = createUpdateService(context);
        await service.activateVersion(args.version);
        context.stdout.info(`${Icons.success} Active version set to ${chalk.cyan(args.version)}`);
    }
}

export function addUseCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new UseCommand();
    command(
        cli,
        "use <version>",
        "Switch the active CLI to an already-installed version",
        (context, args) => cmd.handle(context, args as UseCommand.Args),
        (yargs) =>
            yargs.positional("version", {
                type: "string",
                description: "Version to activate (must already be installed)"
            })
    );
}
