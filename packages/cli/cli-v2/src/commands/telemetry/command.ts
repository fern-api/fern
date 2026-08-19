import type { Argv } from "yargs";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { commandGroup } from "../_internal/commandGroup.js";
import { addDisableCommand } from "./disable/index.js";
import { addEnableCommand } from "./enable/index.js";
import { addStatusCommand } from "./status/index.js";

export function addTelemetryCommand(cli: Argv<GlobalArgs>): void {
    commandGroup({
        cli,
        name: "telemetry",
        description: "Manage telemetry settings",
        subcommands: [addStatusCommand, addEnableCommand, addDisableCommand]
    });
}
