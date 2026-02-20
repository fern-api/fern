import type { Argv } from "yargs";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { commandGroup } from "../_internal/commandGroup.js";
import { addDevCommand } from "./dev/index.js";

export function addDocsCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "docs <command>", "Manage documentation", [addDevCommand]);
}
