import type { Argv } from "yargs";
import type { Context } from "../../context/Context";
import type { GlobalArgs } from "../../context/GlobalArgs";
import { command } from "../_internal/command";

export function addLoginCommand(cli: Argv<GlobalArgs>): void {
    command(cli, "login", "Log in to fern", handleLogin);
}

async function handleLogin(context: Context, _args: GlobalArgs): Promise<void> {
    context.stdout.info("Logging in...");
}
