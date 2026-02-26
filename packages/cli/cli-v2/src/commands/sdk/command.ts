import type { Argv } from "yargs";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { commandGroup } from "../_internal/commandGroup.js";
import { addAddCommand } from "./add/index.js";
import { addGenerateCommand } from "./generate/index.js";

export function addSdkCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "sdk", "Configure and generate SDKs", [addAddCommand, addGenerateCommand]);
}
