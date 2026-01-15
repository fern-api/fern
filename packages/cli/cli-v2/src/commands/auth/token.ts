import type { Argv } from "yargs";
import { Context } from "../../context/Context";
import type { GlobalArgs } from "../../context/GlobalArgs";
import { withContext } from "../../context/withContext";

export interface TokenArgs extends GlobalArgs {}

export function addTokenCommand(cli: Argv<GlobalArgs>): void {
    cli.command(
        "token",
        "Print the user's authentication token",
        (yargs) => yargs,
        withContext<TokenArgs>(handleToken)
    );
}

async function handleToken(context: Context, _args: TokenArgs): Promise<void> {
    context.stdout.info("unimplemented");
}
