import type { Argv } from "yargs";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { commandGroup } from "../_internal/commandGroup.js";
import { addGenerateCommand } from "./generate/index.js";

export function addSdkCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "sdk <command>", "Configure and generate SDKs", [addGenerateCommand]);
}
