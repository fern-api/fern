import { FernToken, getToken, isLoggedIn, login } from "@fern-api/auth";
import chalk from "chalk";
import inquirer, { ConfirmQuestion } from "inquirer";
import { CliContext } from "./cli-context/CliContext";

export async function loginOrThrow(cliContext: CliContext): Promise<FernToken> {
    if (!(await isLoggedIn()) && cliContext.isTTY) {
        await cliContext.takeOverTerminal(async () => {
            if (await askForConfirmation("Login required. Continue?")) {
                await login();
            } else {
                cliContext.logger.info(`You can log in with ${chalk.bold(`${cliContext.environment.cliName} login`)}`);
                cliContext.failAndThrow();
            }
        });
    }
    const token = await getToken();
    if (token == null) {
        cliContext.failAndThrow("Login required.");
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
