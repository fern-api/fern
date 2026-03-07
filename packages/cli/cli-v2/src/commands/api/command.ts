import type { Argv } from "yargs";

import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { commandGroup } from "../_internal/commandGroup.js";
import { addCompileCommand } from "./compile/index.js";

export function addApiCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "api", "Configure, compile, edit, and inspect your API specs", [addCompileCommand]);
}
