import type { Argv } from "yargs";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { commandGroup } from "../../_internal/commandGroup.js";
import { addLinkCheckCommand } from "./check/index.js";

export function addLinkCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "link", "Manage and validate links on live docs sites.", [addLinkCheckCommand]);
}
