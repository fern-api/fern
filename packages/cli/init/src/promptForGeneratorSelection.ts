import { checkbox, Separator, select } from "@inquirer/prompts";
import chalk from "chalk";

export type OutputType = "sdks" | "docs" | "both";

export type SdkLanguage = "typescript" | "python" | "java" | "go" | "csharp" | "ruby" | "php" | "swift";

export interface GeneratorSelection {
    outputType: OutputType;
    sdkLanguages: SdkLanguage[];
}

/**
 * Check if the current environment is interactive (has a TTY).
 * Returns false in CI environments or when stdin/stdout are not TTYs.
 */
function isInteractiveEnvironment(): boolean {
    // Check if we're in a CI environment
    if (process.env.CI != null) {
        return false;
    }
    // Check if stdin and stdout are TTYs
    return process.stdin.isTTY === true && process.stdout.isTTY === true;
}

const SDK_LANGUAGE_CHOICES: Array<{ name: string; value: SdkLanguage; description?: string }> = [
    { name: "TypeScript", value: "typescript", description: "Generate a TypeScript SDK" },
    { name: "Python", value: "python", description: "Generate a Python SDK" },
    { name: "Java", value: "java", description: "Generate a Java SDK" },
    { name: "Go", value: "go", description: "Generate a Go SDK" },
    { name: "C#", value: "csharp", description: "Generate a C# SDK" },
    { name: "Ruby", value: "ruby", description: "Generate a Ruby SDK" },
    { name: "PHP", value: "php", description: "Generate a PHP SDK" },
    { name: "Swift", value: "swift", description: "Generate a Swift SDK" }
];

export async function promptForOutputType(): Promise<OutputType> {
    const answer = await select<OutputType>({
        message: "What would you like to generate?",
        choices: [
            {
                name: "SDKs",
                value: "sdks",
                description: "Generate client SDKs in one or more languages"
            },
            {
                name: "Docs",
                value: "docs",
                description: "Generate API documentation"
            },
            {
                name: "Both SDKs and Docs",
                value: "both",
                description: "Generate both client SDKs and API documentation"
            }
        ],
        theme: {
            prefix: chalk.green("?"),
            style: {
                message: (text: string) => chalk.bold(text),
                highlight: (text: string) => chalk.cyan(text),
                description: (text: string) => chalk.dim(text)
            }
        }
    });
    return answer;
}

export async function promptForSdkLanguages(): Promise<SdkLanguage[]> {
    const answer = await checkbox<SdkLanguage>({
        message: "Which SDK languages would you like to generate?",
        choices: [
            new Separator(chalk.dim("--- Popular ---")),
            ...SDK_LANGUAGE_CHOICES.slice(0, 4),
            new Separator(chalk.dim("--- Other ---")),
            ...SDK_LANGUAGE_CHOICES.slice(4)
        ],
        instructions: chalk.dim("(Press <space> to select, <a> to toggle all, <enter> to confirm)"),
        required: true,
        validate: (choices) => {
            if (choices.length === 0) {
                return "Please select at least one SDK language";
            }
            return true;
        },
        theme: {
            prefix: chalk.green("?"),
            icon: {
                checked: chalk.green("[x]"),
                unchecked: "[ ]",
                cursor: chalk.cyan(">")
            },
            style: {
                message: (text: string) => chalk.bold(text),
                highlight: (text: string) => chalk.cyan(text),
                description: (text: string) => chalk.dim(text)
            }
        }
    });
    return answer;
}

/**
 * Prompts the user for generator selection (SDKs/Docs and languages).
 * Returns undefined in non-interactive environments (CI, no TTY) to use defaults.
 */
export async function promptForGeneratorSelection(): Promise<GeneratorSelection | undefined> {
    // Skip prompts in non-interactive environments
    if (!isInteractiveEnvironment()) {
        return undefined;
    }

    const outputType = await promptForOutputType();

    let sdkLanguages: SdkLanguage[] = [];
    if (outputType === "sdks" || outputType === "both") {
        sdkLanguages = await promptForSdkLanguages();
    }

    return {
        outputType,
        sdkLanguages
    };
}
