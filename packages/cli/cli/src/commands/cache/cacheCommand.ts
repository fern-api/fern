import { Argv } from "yargs";
import { ClearCacheCommand } from "./clear";
import { StatusCacheCommand } from "./status";

export function addCacheCommands(yargs: Argv): Argv {
    return yargs.command(ClearCacheCommand).command(StatusCacheCommand).demandCommand().showHelpOnFail(true);
}

export const CacheCommand = {
    command: "cache <command>",
    describe: "Manage Fern generation cache",
    builder: addCacheCommands,
    handler: () => {
        // Handler is not called for parent commands, but required by TypeScript
    }
} as const;
