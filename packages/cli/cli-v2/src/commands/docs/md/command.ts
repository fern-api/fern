import type { Argv } from "yargs";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { commandGroup } from "../../_internal/commandGroup.js";
import { addCheckCommand } from "./check/index.js";
import { addGenerateCommand } from "./generate/index.js";

/**
 * Hidden command group for MDX-only utilities.
 *
 * Marked hidden (description: false) because the underlying features are
 * still in beta and not yet ready for general use. Subcommands:
 *  - `fern docs md generate`: generate MDX from library source code
 *  - `fern docs md check`:    validate MDX syntax only
 */
export function addMdCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "md", false, [addGenerateCommand, addCheckCommand]);
}
