import chalk from "chalk";
import type { Argv } from "yargs";
import { FernRcSchemaLoader, FernRcTelemetryManager } from "../../../config/fern-rc/index.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { command } from "../../_internal/command.js";

export class DisableCommand {
    public async handle(context: Context, _args: GlobalArgs): Promise<void> {
        const manager = new FernRcTelemetryManager({ loader: new FernRcSchemaLoader() });
        await manager.setEnabled(false);

        context.stderr.info(`${chalk.green("✓")} Telemetry disabled.`);
        context.stderr.info("");
        context.stderr.info(chalk.dim("  Run 'fern telemetry enable' to opt back in."));
    }
}

export function addDisableCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new DisableCommand();
    command(cli, "disable", "Disable telemetry", (context, args) => cmd.handle(context, args));
}
