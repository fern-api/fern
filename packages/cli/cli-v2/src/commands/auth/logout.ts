import { Command } from "commander";
import { Context } from "../../context/Context";
import { withContext } from "../../context/withContext";

interface LogoutArgs {}

export const logoutCommand = new Command("logout")
    .description("Log out of fern")
    .action(withContext<LogoutArgs>(handleLogout));

async function handleLogout(context: Context, _args: LogoutArgs): Promise<void> {
    context.stdout.info("Logging out...");
}
