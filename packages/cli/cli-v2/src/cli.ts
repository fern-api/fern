import type { Argv } from "yargs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { addAuthCommand } from "./commands/auth";
import { addCheckCommand } from "./commands/check";
import { addSdkCommand } from "./commands/sdk";
import { GlobalArgs } from "./context/GlobalArgs";

export async function runCliV2(argv?: string[]): Promise<void> {
    const cli = createCliV2(argv);
    await cli.parse();
}

function createCliV2(argv?: string[]): Argv<GlobalArgs> {
    const cli: Argv<GlobalArgs> = yargs(argv ?? hideBin(process.argv))
        .scriptName("fern")
        .version("0.0.1")
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
    addCheckCommand(cli);
    addSdkCommand(cli);

    return cli;
}
