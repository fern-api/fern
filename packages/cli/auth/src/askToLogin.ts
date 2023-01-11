import { FernToken, getToken, isLoggedIn, login } from "@fern-api/auth";
import { TaskContext } from "@fern-api/task-context";
import inquirer, { ConfirmQuestion } from "inquirer";

export async function askToLogin(context: TaskContext): Promise<FernToken> {
    if (!(await isLoggedIn()) && process.stdout.isTTY) {
        await context.takeOverTerminal(async () => {
            if (await askForConfirmation("Login required. Continue?")) {
                await login();
            } else {
                context.failAndThrow();
            }
        });
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
        message,
    };
    const answers = await inquirer.prompt(question);
    return answers[name];
}
