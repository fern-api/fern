import { FernToken, getToken, isLoggedIn } from "@fern-api/auth";
import { CliError, InstructionsTopic, TaskContext } from "@fern-api/task-context";
import inquirer, { ConfirmQuestion } from "inquirer";

import { login } from "./login.js";

export async function askToLogin(
    context: TaskContext,
    { suggestGuest = false }: { suggestGuest?: boolean } = {}
): Promise<FernToken> {
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
        context.failAndThrow(getMissingLoginMessage({ suggestGuest }), undefined, {
            code: CliError.Code.AuthError,
            instructionsTopic: InstructionsTopic.NewSite
        });
    }

    return token;
}

/**
 * The error for a run that needs a Fern account but has neither a login nor FERN_TOKEN. With `suggestGuest`, the
 * `--guest` way out comes first: a non-interactive caller (an agent, CI) cannot log in, so it is the only step it can
 * take on its own.
 */
export function getMissingLoginMessage({ suggestGuest = false }: { suggestGuest?: boolean } = {}): string {
    if (suggestGuest) {
        return (
            "No Fern account found (not logged in and FERN_TOKEN is not set). " +
            "To continue without an account, rerun with --guest: the output goes to a temporary guest organization " +
            "you can claim later with 'fern claim'. Or run 'fern login' / set FERN_TOKEN to use an account. " +
            CODING_AGENT_SKILLS_HINT
        );
    }
    return "Authentication required. Please run 'fern login' or set the FERN_TOKEN environment variable.";
}

/**
 * One line that points a user who drives Fern through a coding agent at the Fern skills (fern-api/skills). The skills
 * teach the agent the whole workflow (docs, SDKs, publishing, the no-account path), so the hint is worth printing wherever
 * a user starts out: after `fern init`, and on the error a run hits without an account.
 */
export const CODING_AGENT_SKILLS_HINT =
    "Using a coding agent? 'npx skills add fern-api/skills --all' teaches it the Fern workflow (docs, SDKs, publishing).";

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
