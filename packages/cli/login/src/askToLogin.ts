import inquirer, { ConfirmQuestion } from "inquirer";

import { FernToken, getToken, isLoggedIn } from "@fern-api/auth";
import { TaskContext } from "@fern-api/task-context";

import { login } from "./login";

export async function askToLogin(context: TaskContext): Promise<FernToken> {
    if (!(await isLoggedIn()) && process.stdout.isTTY) {
        await context.takeOverTerminal(async () => {
            if (!(await askForConfirmation("Login required. Continue?"))) {
                context.failAndThrow();
            }
        });
        await login(context);
    }
    const token = await getToken();
    if (token == null) {
        context.failAndThrow("Login required.");
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
