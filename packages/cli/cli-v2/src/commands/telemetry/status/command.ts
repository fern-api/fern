import chalk from "chalk";
import type { Argv } from "yargs";
import { FernRcSchemaLoader, FernRcTelemetryManager } from "../../../config/fern-rc/index.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { command } from "../../_internal/command.js";

namespace StatusArgs {
    export interface Args extends GlobalArgs {
        json: boolean;
    }
}

export class StatusCommand {
    public async handle(context: Context, args: StatusArgs.Args): Promise<void> {
        const isEnvDisabled = this.isEnvDisabled();
        const enabled = await this.isTelemetryEnabled({ overriddenByEnv: isEnvDisabled });

        if (args.json) {
            process.stdout.write(JSON.stringify({ enabled }) + "\n");
            return;
        }

        if (isEnvDisabled) {
            context.stderr.info(
                `Telemetry ${chalk.yellow("disabled")} ${chalk.dim("(FERN_TELEMETRY_DISABLED is set).")}`
            );
            return;
        }

        if (enabled) {
            context.stderr.info(`Telemetry ${chalk.green("enabled")}.`);
            context.stderr.info("");
            context.stderr.info(chalk.dim("  Run 'fern telemetry disable' to opt out."));
            return;
        }

        context.stderr.info(`Telemetry ${chalk.red("disabled")}.`);
        context.stderr.info("");
        context.stderr.info(chalk.dim("  Run 'fern telemetry enable' to opt in."));
    }

    private async isTelemetryEnabled({ overriddenByEnv }: { overriddenByEnv: boolean }): Promise<boolean> {
        if (overriddenByEnv) {
            return false;
        }
        const telemetry = new FernRcTelemetryManager({ loader: new FernRcSchemaLoader() });
        return await telemetry.isEnabled();
    }

    private isEnvDisabled(): boolean {
        const envDisabled = process.env["FERN_TELEMETRY_DISABLED"];
        return envDisabled != null && envDisabled.length > 0;
    }
}

export function addStatusCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new StatusCommand();
    command<StatusArgs.Args>(
        cli,
        "status",
        "Show telemetry status",
        (context, args) => cmd.handle(context, args),
        (yargs) => yargs.option("json", { type: "boolean", default: false, description: "Output status as JSON" })
    );
}
