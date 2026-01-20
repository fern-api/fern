import type { Argv } from "yargs";
import type { Context } from "../../context/Context";
import type { GlobalArgs } from "../../context/GlobalArgs";
import { command } from "../_internal/command";

export function addTokenCommand(cli: Argv<GlobalArgs>): void {
    command(cli, "token", "Print the user's authentication token", handleToken);
}

async function handleToken(context: Context, _args: GlobalArgs): Promise<void> {
    context.stdout.info("unimplemented");
}
