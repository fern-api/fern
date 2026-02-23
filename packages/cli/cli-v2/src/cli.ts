import chalk from "chalk";
import type { Argv } from "yargs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { addAuthCommand } from "./commands/auth/index.js";
import { addCacheCommand } from "./commands/cache/index.js";
import { addCheckCommand } from "./commands/check/index.js";
import { addConfigCommand } from "./commands/config/index.js";
import { addDocsCommand } from "./commands/docs/index.js";
import { addInitCommand } from "./commands/init/index.js";
import { addSdkCommand } from "./commands/sdk/index.js";
import { addTelemetryCommand } from "./commands/telemetry/index.js";
import { GlobalArgs } from "./context/GlobalArgs.js";
import { Icons } from "./ui/format.js";
import { Version } from "./version.js";

const TIMEOUT_MINUTES = 10;
const TIMEOUT_MS = TIMEOUT_MINUTES * 60 * 1000;

export async function runCliV2(argv?: string[]): Promise<void> {
    const timeout = setTimeout(() => {
        process.stderr.write(`${Icons.error} ${chalk.red(`Timed out after ${TIMEOUT_MINUTES} minutes.\n`)}`);
        process.exit(1);
    }, TIMEOUT_MS);
    timeout.unref();

    const cli = createCliV2(argv);
    await cli.parse();
}

function createCliV2(argv?: string[]): Argv<GlobalArgs> {
    const terminalWidth = process.stdout.columns ?? 80;
    const cli: Argv<GlobalArgs> = yargs(argv ?? hideBin(process.argv))
        .scriptName("fern")
        .version(Version)
        .wrap(Math.min(120, terminalWidth))
        .option("log-level", {
            type: "string",
            description: "Set log level",
            choices: ["debug", "info", "warn", "error"] as const,
            default: "info"
        })
        .strict()
        .demandCommand()
        .recommendCommands()
        .fail((msg, err, y) => {
            if (err != null) {
                process.stderr.write(`${err.message}\n`);
                process.exit(1);
            }
            if (msg != null) {
                process.stderr.write(`Error: ${msg}\n\n`);
            }
            y.showHelp();
            process.exit(1);
        });

    addAuthCommand(cli);
    addCacheCommand(cli);
    addCheckCommand(cli);
    addConfigCommand(cli);
    addDocsCommand(cli);
    addInitCommand(cli);
    addSdkCommand(cli);
    addTelemetryCommand(cli);

    return cli;
}
