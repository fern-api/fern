import type { Argv } from "yargs";
import type { GlobalArgs } from "../../context/GlobalArgs";
import { commandGroup } from "../_internal/commandGroup";
import { addMigrateCommand } from "./migrate";

export function addConfigCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "config <command>", "Configure, edit, and inspect your settings", [addMigrateCommand]);
}
