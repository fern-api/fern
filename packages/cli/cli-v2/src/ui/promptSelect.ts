import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import inquirer from "inquirer";

export interface PromptSelectChoice<T> {
    /** Display name shown in the dropdown */
    name: string;
    /** Value returned when selected */
    value: T;
}

/**
 * Present an interactive dropdown for the user to select from a list of options.
 *
 * In TTY mode, shows an inquirer list prompt. If `flagHint` is provided, each
 * choice is annotated with the equivalent flag inline (e.g. "rest   --api rest"),
 * mirroring the v1 CLI's multi-workspace error format.
 * In non-TTY mode (e.g. CI), throws a CliError with the available options listed.
 */
export async function promptSelect<T>({
    isTTY,
    message,
    choices,
    nonInteractiveError,
    flagHint
}: {
    isTTY: boolean;
    message: string;
    choices: PromptSelectChoice<T>[];
    /** Error message to show in non-TTY mode. Should list available options and the flag to use. */
    nonInteractiveError: string;
    /**
     * When provided, each choice label is annotated with the equivalent CLI flag
     * so the user can see how to skip the prompt next time, e.g. "--api rest".
     */
    flagHint?: (value: T) => string | undefined;
}): Promise<T> {
    if (choices.length === 0) {
        throw new CliError({
            message: "No options available to select from.",
            code: CliError.Code.InternalError
        });
    }

    if (!isTTY) {
        throw new CliError({ message: nonInteractiveError, code: CliError.Code.ConfigError });
    }

    const maxNameLen = Math.max(...choices.map((c) => c.name.length));

    const { selected } = await inquirer.prompt<{ selected: T }>([
        {
            type: "list",
            name: "selected",
            message,
            choices: choices.map((c) => {
                if (flagHint == null) {
                    return { name: c.name, value: c.value };
                }
                const hint = flagHint(c.value);
                const label = hint != null ? `${c.name.padEnd(maxNameLen)}   ${chalk.dim(hint)}` : c.name;
                return { name: label, value: c.value };
            })
        }
    ]);

    return selected;
}
