import type { Argv } from "yargs";

import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { commandGroup } from "../_internal/commandGroup.js";
import { addLoginCommand } from "./login/index.js";
import { addLogoutCommand } from "./logout/index.js";
import { addStatusCommand } from "./status/index.js";
import { addSwitchCommand } from "./switch/index.js";
import { addTokenCommand } from "./token/index.js";
import { addWhoamiCommand } from "./whoami/index.js";

export function addAuthCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "auth <command>", "Authenticate fern", [
        addLoginCommand,
        addLogoutCommand,
        addSwitchCommand,
        addStatusCommand,
        addTokenCommand,
        addWhoamiCommand
    ]);
}
