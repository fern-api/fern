import type { Argv } from "yargs";

import type { GlobalArgs } from "../../context/GlobalArgs";
import { commandGroup } from "../_internal/commandGroup";
import { addLoginCommand } from "./login";
import { addLogoutCommand } from "./logout";
import { addStatusCommand } from "./status";
import { addSwitchCommand } from "./switch";
import { addTokenCommand } from "./token";
import { addWhoamiCommand } from "./whoami";

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
