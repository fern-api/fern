import { FernToken, getToken, isLoggedIn } from "@fern-api/auth";
import { CliError, TaskContext } from "@fern-api/task-context";
import inquirer, { ConfirmQuestion } from "inquirer";

import { login } from "./login.js";

export async function askToLogin(context: TaskContext): Promise<FernToken> {
    if (!(await isLoggedIn()) && process.stdout.isTTY) {
        await context.takeOverTerminal(async () => {
            if (!(await askForConfirmation("Login required. Continue?"))) {
                context.failAndThrow(undefined, undefined, { code: CliError.Code.AuthError });
            }
        });
        await login(context);
    }
    const token = await getToken();
    if (token == null) {
        context.failAndThrow(
            "Authentication required. Please run 'fern login' or set the FERN_TOKEN environment variable.",
            undefined,
            { code: CliError.Code.AuthError }
        );
    }

    return token;
}

async function askForConfirmation(message: string) {
    const name = "question";
    const question: ConfirmQuestion<{ [name]: boolean }> = {
        type: "confirm",
        name,
        message
    };
    const answers = await inquirer.prompt(question);
    return answers[name];
}
