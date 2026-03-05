import type { Argv } from "yargs";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { commandGroup } from "../../_internal/commandGroup.js";
import { addCompareCommand } from "./compare/index.js";
import { addMergeCommand } from "./merge/index.js";
import { addSplitCommand } from "./split/index.js";

export function addOverridesCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "overrides", "Manage API overrides", [addCompareCommand, addMergeCommand, addSplitCommand]);
}
