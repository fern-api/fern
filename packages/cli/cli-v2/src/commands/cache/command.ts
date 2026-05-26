import type { Argv } from "yargs";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { commandGroup } from "../_internal/commandGroup.js";
import { addClearCommand } from "./clear/index.js";
import { addShowCommand } from "./show/index.js";

export function addCacheCommand(cli: Argv<GlobalArgs>): void {
    commandGroup({
        cli,
        name: "cache",
        description: "Manage the local cache",
        subcommands: [addShowCommand, addClearCommand]
    });
}
