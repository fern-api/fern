import type { Argv } from "yargs";

import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { commandGroup } from "../_internal/commandGroup.js";
import { addCreateCommand } from "./create/index.js";
import { addListCommand } from "./list/index.js";

export function addOrgCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "org", "Manage your organizations", [addCreateCommand, addListCommand]);
}
