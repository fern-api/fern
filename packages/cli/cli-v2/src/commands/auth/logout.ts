import type { Argv } from "yargs";
import { Context } from "../../context/Context";
import type { GlobalArgs } from "../../context/GlobalArgs";
import { withContext } from "../../context/withContext";

export interface LogoutArgs extends GlobalArgs {}

export function addLogoutCommand(cli: Argv<GlobalArgs>): void {
    cli.command("logout", "Log out of fern", (yargs) => yargs, withContext<LogoutArgs>(handleLogout));
}

async function handleLogout(context: Context, _args: LogoutArgs): Promise<void> {
    context.stdout.info("Logging out...");
}
