import type { Argv } from "yargs";
import type { GlobalArgs } from "../context/GlobalArgs";
import { commandGroup } from "./_internal/commandGroup";
import { addLoginCommand } from "./auth/login";
import { addLogoutCommand } from "./auth/logout";
import { addTokenCommand } from "./auth/token";

export function addAuthCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "auth <command>", "Authenticate fern", [addLoginCommand, addLogoutCommand, addTokenCommand]);
}
