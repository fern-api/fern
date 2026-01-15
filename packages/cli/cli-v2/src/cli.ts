import type { Argv } from "yargs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { addAuthCommand } from "./commands/auth";
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
        .recommendCommands();

    addAuthCommand(cli);

    return cli;
}
