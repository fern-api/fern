import { Command } from "commander";
import { loginCommand } from "./auth/login";
import { logoutCommand } from "./auth/logout";
import { tokenCommand } from "./auth/token";

export function createAuthCommand(): Command {
    const authCommand = new Command("auth").description("Authenticate fern");
    authCommand.addCommand(loginCommand);
    authCommand.addCommand(logoutCommand);
    authCommand.addCommand(tokenCommand);
    return authCommand;
}
