import type { Argv } from "yargs";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { commandGroup } from "../_internal/commandGroup.js";
import { addAiCommand } from "./ai/index.js";
import { addMigrateCommand } from "./migrate/index.js";

export function addConfigCommand(cli: Argv<GlobalArgs>): void {
    commandGroup({
        cli,
        name: "config",
        description: "Configure, edit, and inspect your settings",
        subcommands: [addMigrateCommand, addAiCommand]
    });
}
