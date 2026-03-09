import type { Argv } from "yargs";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { commandGroup } from "../_internal/commandGroup.js";
import { addMergeCommand } from "./merge/index.js";
import { addSplitCommand } from "./split/index.js";

export function addApiCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "api", "Manage API specs and overrides", [addMergeCommand, addSplitCommand]);
}
