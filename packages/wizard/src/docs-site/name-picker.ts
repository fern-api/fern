import inquirer from "inquirer";
import { type Availability, isValidName, suggestNames } from "./availability";

const ENTER_ANOTHER = "__enter-another__";

/**
 * Settles on a name that is free (or already the user's). When the name belongs to another team,
 * offers a few free alternatives to pick from, or lets the user type a different one, which is
 * checked the same way.
 */
export async function pickAvailableName({
    name,
    noun,
    check,
    reserve,
    display = (value) => value,
    preferred = []
}: {
    name: string;
    /** What is being named, e.g. "organization name" or "docs URL". */
    noun: string;
    check: (name: string) => Promise<Availability>;
    /**
     * Claims a free name, e.g. by creating the organization. Returns false when the name turns out to
     * belong to another team, so the user picks again.
     */
    reserve?: (name: string) => Promise<boolean>;
    /** How to show a name, e.g. as a full docs URL. */
    display?: (name: string) => string;
    /** Free names to suggest first, such as the organization the user already picked. */
    preferred?: string[];
}): Promise<string> {
    let current = name;
    let free = (await check(current)) !== "taken";
    for (;;) {
        if (free && (reserve === undefined || (await reserve(current)))) {
            return current;
        }
        const suggestions = await suggestNames({ base: current, check, preferred });
        const answer = await inquirer.prompt<{ choice: string }>([
            {
                type: "list",
                name: "choice",
                message: `${display(current)} belongs to another team on Fern. Choose a different ${noun}:`,
                choices: [
                    ...suggestions.map((suggestion) => ({ name: display(suggestion), value: suggestion })),
                    new inquirer.Separator(),
                    { name: "Enter a different name", value: ENTER_ANOTHER }
                ]
            }
        ]);
        if (answer.choice !== ENTER_ANOTHER) {
            // Suggestions were just checked.
            current = answer.choice;
            free = true;
            continue;
        }
        current = await askForName(noun);
        free = (await check(current)) !== "taken";
    }
}

async function askForName(noun: string): Promise<string> {
    const answer = await inquirer.prompt<{ name: string }>([
        {
            type: "input",
            name: "name",
            message: `New ${noun}`,
            validate: (input: string) =>
                isValidName(input.trim()) || "Use lowercase letters, numbers, and hyphens (not at the start or end)."
        }
    ]);
    return answer.name.trim();
}
