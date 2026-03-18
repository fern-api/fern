import chalk from "chalk";
import type { Argv } from "yargs";
import { FernRcSchemaLoader, FernRcTelemetryManager } from "../../../config/fern-rc/index.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { command } from "../../_internal/command.js";

export class EnableCommand {
    public async handle(context: Context, _args: GlobalArgs): Promise<void> {
        const manager = new FernRcTelemetryManager({ loader: new FernRcSchemaLoader() });
        await manager.setEnabled(true);

        context.stderr.info(`${chalk.green("✓")} Telemetry enabled.`);

        const envDisabled = process.env["FERN_TELEMETRY_DISABLED"];
        if (envDisabled != null && envDisabled.length > 0) {
            context.stderr.info("");
            context.stderr.info(chalk.yellow(`  Note: FERN_TELEMETRY_DISABLED is still set and takes precedence.`));
            context.stderr.info(chalk.dim(`  Unset it to allow this setting to take effect.`));
        }
    }
}

export function addEnableCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new EnableCommand();
    command(cli, "enable", "Enable telemetry", (context, args) => cmd.handle(context, args));
}
