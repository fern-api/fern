import { getOrCreateFernRunId } from "@fern-api/cli-telemetry";
import type { Argv } from "yargs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { addApiCommand } from "./commands/api/index.js";
import { addAuthCommand } from "./commands/auth/index.js";
import { addCacheCommand } from "./commands/cache/index.js";
import { addCheckCommand } from "./commands/check/index.js";
import { addConfigCommand } from "./commands/config/index.js";
import { addDocsCommand } from "./commands/docs/index.js";
import { addInitCommand } from "./commands/init/index.js";
import { addOrgCommand } from "./commands/org/index.js";
import { addReplayCommand } from "./commands/replay/index.js";
import { addSdkCommand } from "./commands/sdk/index.js";
import { addTelemetryCommand } from "./commands/telemetry/index.js";
import { GlobalArgs } from "./context/GlobalArgs.js";
import { Version } from "./version.js";

export async function runCliV2(argv?: string[]): Promise<void> {
    getOrCreateFernRunId();
    const cli = createCliV2(argv);
    await cli.parse();
}

function createCliV2(argv?: string[]): Argv<GlobalArgs> {
    const terminalWidth = process.stdout.columns ?? 80;
    const cli: Argv<GlobalArgs> = yargs(argv ?? hideBin(process.argv))
        .scriptName("fern")
        .usage("Instant Docs and SDKs for your API.")
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

    addApiCommand(cli);
    addAuthCommand(cli);
    addCacheCommand(cli);
    addCheckCommand(cli);
    addConfigCommand(cli);
    addDocsCommand(cli);
    addInitCommand(cli);
    addOrgCommand(cli);
    addReplayCommand(cli);
    addSdkCommand(cli);
    addTelemetryCommand(cli);

    return cli;
}
