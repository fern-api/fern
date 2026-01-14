import { Command } from "commander";
import { Context } from "../../context/Context";
import { withContext } from "../../context/withContext";

interface LoginArgs {
    // Add any login-specific arguments here.
}

export const loginCommand = new Command("login")
    .description("Log in to fern")
    .action(withContext<LoginArgs>(handleLogin));

async function handleLogin(context: Context, _args: LoginArgs): Promise<void> {
    context.stdout.info("Logging in...");
}
