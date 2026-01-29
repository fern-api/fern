import type { Argv } from "yargs";
import type { GlobalArgs } from "../../context/GlobalArgs";
import { commandGroup } from "../_internal/commandGroup";
import { addLoginCommand } from "./login";
import { addLogoutCommand } from "./logout";
import { addTokenCommand } from "./token";

export function addAuthCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "auth <command>", "Authenticate fern", [addLoginCommand, addLogoutCommand, addTokenCommand]);
}
