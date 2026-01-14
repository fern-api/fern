import { Command } from "commander";
import { Context } from "../../context/Context";
import { withContext } from "../../context/withContext";

interface TokenArgs {}

export const tokenCommand = new Command("token")
    .description("Print the user's authentication token")
    .action(withContext<TokenArgs>(handleToken));

async function handleToken(context: Context, _args: TokenArgs): Promise<void> {
    context.stdout.info("unimplemented");
}
