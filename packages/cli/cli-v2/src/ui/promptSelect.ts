import inquirer from "inquirer";

import { CliError } from "../errors/CliError.js";

export interface PromptSelectChoice<T> {
    /** Display name shown in the dropdown */
    name: string;
    /** Value returned when selected */
    value: T;
}

/**
 * Present an interactive dropdown for the user to select from a list of options.
 *
 * In TTY mode, shows an inquirer list prompt.
 * In non-TTY mode (e.g. CI), throws a CliError with the available options listed.
 */
export async function promptSelect<T>({
    isTTY,
    message,
    choices,
    nonInteractiveError
}: {
    isTTY: boolean;
    message: string;
    choices: PromptSelectChoice<T>[];
    /** Error message to show in non-TTY mode. Should list available options and the flag to use. */
    nonInteractiveError: string;
}): Promise<T> {
    if (!isTTY) {
        throw new CliError({ message: nonInteractiveError });
    }

    const { selected } = await inquirer.prompt<{ selected: T }>([
        {
            type: "list",
            name: "selected",
            message,
            choices: choices.map((c) => ({ name: c.name, value: c.value }))
        }
    ]);
    return selected;
}
