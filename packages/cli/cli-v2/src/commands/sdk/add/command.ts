import { schemas } from "@fern-api/config";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getLatestGeneratorVersion } from "@fern-api/configuration-loader";
import chalk from "chalk";
import { readFile, writeFile } from "fs/promises";
import inquirer from "inquirer";
import yaml from "js-yaml";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { CliError } from "../../../errors/CliError.js";
import { LANGUAGES, type Language } from "../../../sdk/config/Language.js";
import { LANGUAGE_TO_DOCKER_IMAGE } from "../../../sdk/config/converter/constants.js";
import { Icons } from "../../../ui/format.js";
import { Version } from "../../../version.js";
import { command } from "../../_internal/command.js";

const FERN_YML_FILENAME = "fern.yml";

const LANGUAGE_DISPLAY_NAMES: Record<Language, string> = {
    typescript: "TypeScript",
    python: "Python",
    go: "Go",
    java: "Java",
    csharp: "C#",
    ruby: "Ruby",
    php: "PHP",
    rust: "Rust",
    swift: "Swift"
};

const LANGUAGE_ORDER: Language[] = ["typescript", "python", "go", "java", "csharp", "ruby", "php", "rust", "swift"];

export declare namespace AddCommand {
    export interface Args extends GlobalArgs {
        /** The SDK target language to add */
        target?: string;

        /** Pin the latest stable version from the Fern registry */
        stable: boolean;

        /** Output path or git URL */
        output?: string;

        /** Accept all defaults (non-interactive mode) */
        yes: boolean;
    }
}

export class AddCommand {
    public async handle(context: Context, args: AddCommand.Args): Promise<void> {
        const fernYmlPath = join(context.cwd, RelativeFilePath.of(FERN_YML_FILENAME));

        if (!(await doesPathExist(fernYmlPath))) {
            throw new CliError({
                message: `No ${FERN_YML_FILENAME} found. Run 'fern init' first to create a project.`
            });
        }

        const language = await this.resolveLanguage(context, args);
        const output = await this.resolveOutput(context, args, language);
        const version = args.stable ? await this.resolveStableVersion(context, language) : undefined;

        await this.addTargetToFernYml({
            fernYmlPath,
            language,
            output,
            version
        });

        context.stderr.info(`\n  ${Icons.success} Added '${language}' to ${FERN_YML_FILENAME}`);
    }

    private async resolveLanguage(context: Context, args: AddCommand.Args): Promise<Language> {
        if (args.target != null) {
            return this.parseLanguage(args.target);
        }

        if (!context.isTTY) {
            if (args.yes) {
                throw new CliError({
                    message: `The --target flag is required. Specify the SDK language to add:\n\n` +
                        `  --target <language>    SDK language (e.g. typescript, python, go)`
                });
            }
            throw new CliError({
                message:
                    `Please use the \`-y\` flag to accept all default inputs or specify all of the required flags:\n\n` +
                    `  --target <language>    SDK language (e.g. typescript, python, go)\n` +
                    `  --output <path|url>    Output path or git URL (e.g. ./my-sdk)`
            });
        }

        if (args.yes) {
            throw new CliError({
                message: `The --target flag is required. Specify the SDK language to add:\n\n` +
                    `  --target <language>    SDK language (e.g. typescript, python, go)`
            });
        }

        const { language } = await inquirer.prompt<{ language: Language }>([
            {
                type: "list",
                name: "language",
                message: "Which SDK language would you like to add?",
                loop: false,
                choices: LANGUAGE_ORDER.map((lang) => ({
                    name: LANGUAGE_DISPLAY_NAMES[lang],
                    value: lang
                }))
            }
        ]);

        return language;
    }

    private async resolveOutput(
        context: Context,
        args: AddCommand.Args,
        language: Language
    ): Promise<schemas.OutputSchema> {
        const defaultPath = `./sdks/${language}`;

        if (args.output != null) {
            return this.parseOutput(args.output);
        }

        if (args.yes) {
            return { path: defaultPath };
        }

        if (!context.isTTY) {
            throw new CliError({
                message:
                    `Please use the \`-y\` flag to accept all default inputs or specify all of the required flags:\n\n` +
                    `  --output <path|url>    Output path or git URL (e.g. ./my-sdk)`
            });
        }

        const { outputValue } = await inquirer.prompt<{ outputValue: string }>([
            {
                type: "input",
                name: "outputValue",
                message: `Configure an output for ${language}`,
                default: defaultPath,
                validate: (input: string) => {
                    if (input.trim().length === 0) {
                        return "Output path cannot be empty.";
                    }
                    return true;
                }
            }
        ]);

        return this.parseOutput(outputValue);
    }

    private parseOutput(value: string): schemas.OutputSchema {
        if (this.isGitUrl(value)) {
            return {
                git: {
                    repository: value
                }
            };
        }

        // Check for remote-looking references that aren't recognized git URLs
        if (this.looksLikeRemoteReference(value)) {
            throw new CliError({
                message:
                    `"${value}" looks like a remote reference but is not a recognized git URL.\n\n` +
                    `  Please specify a local path (e.g. ./sdks/my-sdk) or a git URL:\n` +
                    `    https://github.com/owner/repo\n` +
                    `    git@github.com:owner/repo.git`
            });
        }

        return { path: value };
    }

    private async resolveStableVersion(context: Context, language: Language): Promise<string | undefined> {
        const image = LANGUAGE_TO_DOCKER_IMAGE[language];
        try {
            const version = await getLatestGeneratorVersion({
                generatorName: image,
                cliVersion: Version,
                channel: undefined
            });
            if (version != null) {
                context.stderr.info(`  ${Icons.info} Resolved ${language} stable version: ${chalk.bold(version)}`);
            }
            return version ?? undefined;
        } catch {
            context.stderr.info(chalk.dim(`  Could not resolve latest stable version for ${language}.`));
            return undefined;
        }
    }

    private async addTargetToFernYml({
        fernYmlPath,
        language,
        output,
        version
    }: {
        fernYmlPath: AbsoluteFilePath;
        language: Language;
        output: schemas.OutputSchema;
        version: string | undefined;
    }): Promise<void> {
        const content = await readFile(fernYmlPath, "utf-8");
        const doc = yaml.load(content) as Record<string, unknown>;

        if (doc == null || typeof doc !== "object") {
            throw new CliError({ message: `Invalid ${FERN_YML_FILENAME}: expected a YAML object` });
        }

        // Ensure sdks section exists
        if (doc.sdks == null) {
            doc.sdks = { targets: {} };
        }

        const sdks = doc.sdks as Record<string, unknown>;
        if (sdks.targets == null) {
            sdks.targets = {};
        }

        const targets = sdks.targets as Record<string, unknown>;

        // Check for duplicates
        if (targets[language] != null) {
            throw new CliError({
                message: `Target '${language}' already exists in ${FERN_YML_FILENAME}.`
            });
        }

        // Build the new target
        const newTarget: Record<string, unknown> = {};
        if (version != null) {
            newTarget.version = version;
        }
        newTarget.output = this.buildOutputForYaml(output);

        targets[language] = newTarget;

        // Preserve the schema comment if present
        const schemaComment = content.split("\n").find((line) => line.startsWith("#"));
        const yamlContent = yaml.dump(doc, {
            indent: 2,
            lineWidth: 120,
            noRefs: true,
            sortKeys: false,
            quotingType: '"',
            forceQuotes: false
        });

        const finalContent = schemaComment != null ? `${schemaComment}\n${yamlContent}` : yamlContent;
        await writeFile(fernYmlPath, finalContent, "utf-8");
    }

    private buildOutputForYaml(output: schemas.OutputSchema): Record<string, unknown> {
        if (output.git != null) {
            const git = output.git;
            const gitConfig: Record<string, unknown> = {
                repository: git.repository
            };
            if (git.mode != null) {
                gitConfig.mode = git.mode;
            }
            return { git: gitConfig };
        }
        return { path: output.path };
    }

    private parseLanguage(target: string): Language {
        const lang = target as Language;
        if (LANGUAGES.includes(lang)) {
            return lang;
        }
        throw new CliError({
            message: `"${target}" is not a supported language. Supported: ${LANGUAGES.join(", ")}`
        });
    }

    private isGitUrl(value: string): boolean {
        return (
            value.endsWith(".git") ||
            value.startsWith("https://github.com/") ||
            value.startsWith("https://gitlab.com/") ||
            value.startsWith("git@")
        );
    }

    private looksLikeRemoteReference(value: string): boolean {
        return (
            value.startsWith("http://") ||
            value.startsWith("https://") ||
            value.startsWith("ssh://") ||
            value.includes("@") && value.includes(":")
        );
    }
}

export function addAddCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new AddCommand();
    command(
        cli,
        "add",
        "Add a new SDK target to fern.yml",
        (context, args) => cmd.handle(context, args as AddCommand.Args),
        (yargs) =>
            yargs
                .option("target", {
                    type: "string",
                    description: "The SDK language to add (e.g. typescript, python, go)"
                })
                .option("stable", {
                    type: "boolean",
                    default: false,
                    description: "Pin the latest stable version from the Fern registry"
                })
                .option("output", {
                    type: "string",
                    description: "Output path or git URL (e.g. ./sdks/go)"
                })
                .option("yes", {
                    type: "boolean",
                    alias: "y",
                    description: "Accept all defaults (non-interactive mode)",
                    default: false
                })
    );
}
