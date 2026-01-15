import type { Argv } from "yargs";
import { Context } from "../../context/Context";
import type { GlobalArgs } from "../../context/GlobalArgs";
import { withContext } from "../../context/withContext";

export interface LoginArgs extends GlobalArgs {}

export function addLoginCommand(cli: Argv<GlobalArgs>): void {
    cli.command("login", "Log in to fern", (yargs) => yargs, withContext<LoginArgs>(handleLogin));
}

async function handleLogin(context: Context, _args: LoginArgs): Promise<void> {
    context.stdout.info("Logging in...");
}
