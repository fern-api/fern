import type { Argv } from "yargs";
import type { Context } from "../../context/Context";
import type { GlobalArgs } from "../../context/GlobalArgs";
import { command } from "../_internal/command";

export function addLogoutCommand(cli: Argv<GlobalArgs>): void {
    command(cli, "logout", "Log out of fern", handleLogout);
}

async function handleLogout(context: Context, _args: GlobalArgs): Promise<void> {
    context.stdout.info("Logging out...");
}
