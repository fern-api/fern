import type { Argv } from "yargs";

import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { commandGroup } from "../_internal/commandGroup.js";
import { addCheckCommand } from "./check/index.js";
import { addCompileCommand } from "./compile/index.js";
import { addMergeCommand } from "./merge/index.js";
import { addSplitCommand } from "./split/index.js";

export function addApiCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "api", "Configure, compile, edit, and inspect your API specs", [
        addCheckCommand,
        addCompileCommand,
        addMergeCommand,
        addSplitCommand
    ]);
}
