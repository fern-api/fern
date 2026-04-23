import { SdkAddInputSchema, schemas } from "@fern-api/config";
import { getLatestGeneratorVersion } from "@fern-api/configuration-loader";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import inquirer from "inquirer";
import type { Argv } from "yargs";
import { FERN_YML_FILENAME } from "../../../config/fern-yml/constants.js";
import { FernYmlEditor } from "../../../config/fern-yml/FernYmlEditor.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { SdkChecker } from "../../../sdk/checker/SdkChecker.js";
import { LANGUAGE_TO_DOCKER_IMAGE } from "../../../sdk/config/converter/constants.js";
import { LANGUAGE_DISPLAY_NAMES, LANGUAGE_ORDER, LANGUAGES, type Language } from "../../../sdk/config/Language.js";
import type { Target } from "../../../sdk/config/Target.js";
import { Icons } from "../../../ui/format.js";
import { Version } from "../../../version.js";
import { command } from "../../_internal/command.js";
import { readAndParseJsonInput } from "../../_internal/resolveJsonInput.js";
import { validateJsonInput } from "../../_internal/validateJsonInput.js";
import { isGitUrl } from "../utils/gitUrl.js";
import { isRemoteReference } from "../utils/isRemoteReference.js";

export declare namespace AddCommand {
    export interface Args extends GlobalArgs {
        /** The SDK target to add (e.g. typescript, python, go). */
        target?: string;

        /** Pin the latest stable version instead of "latest" (e.g. 1.0.0). */
        stable: boolean;

        /** Output path or git URL (e.g. ./sdks/typescript). */
        output?: string;

        /** The group to add the target to. */
        group?: string;

        /** Accept all defaults (non-interactive mode). */
        yes: boolean;

        /** Raw JSON payload matching the sdk-add-input schema. Bypasses prompts and flag parsing. */
        input?: string;
    }
}

export class AddCommand {
    public async handle(context: Context, args: AddCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();

        const fernYmlPath = workspace.absoluteFilePath;
        if (fernYmlPath == null) {
            throw new CliError({
                message: `No ${FERN_YML_FILENAME} found. Run 'fern init' to initialize a project.`,
                code: CliError.Code.ConfigError
            });
        }

        const sdkChecker = new SdkChecker({ context });
        const sdkCheckResult = await sdkChecker.check({ workspace });
        if (sdkCheckResult.errorCount > 0) {
            for (const v of sdkCheckResult.violations) {
                const color = v.severity === "warning" ? chalk.yellow : chalk.red;
                process.stderr.write(`${color(`${v.displayRelativeFilepath}:${v.line}:${v.column}: ${v.message}`)}\n`);
            }
            throw new CliError({
                message: "Fix the errors above before adding a new target.",
                code: CliError.Code.ValidationError
            });
        }

        const existingTargets = workspace.sdks?.targets ?? [];

        if (args.input != null) {
            return this.handleFromJsonInput({ context, args, fernYmlPath, existingTargets });
        }

        if (!context.isTTY || args.yes) {
            return this.handleWithFlags({ context, args, fernYmlPath, existingTargets });
        }

        return this.handleInteractive({ context, args, fernYmlPath, existingTargets });
    }

    private async handleFromJsonInput({
        context,
        args,
        fernYmlPath,
        existingTargets
    }: {
        context: Context;
        args: AddCommand.Args;
        fernYmlPath: AbsoluteFilePath;
        existingTargets: Target[];
    }): Promise<void> {
        if (args.target != null || args.output != null || args.group != null || args.stable) {
            throw new CliError({
                message:
                    "--input cannot be combined with --target, --output, --group, or --stable. " +
                    "The JSON payload must fully describe the target.",
                code: CliError.Code.ConfigError
            });
        }

        if (args.input == null) {
            // Defensive: caller already guarded this.
            throw new CliError({ message: "--input is required", code: CliError.Code.ConfigError });
        }

        const parsed = await readAndParseJsonInput({
            value: args.input,
            cwd: context.cwd,
            stdin: process.stdin
        });
        const payload = validateJsonInput({
            value: parsed,
            schema: SdkAddInputSchema,
            schemaName: "sdk-add-input"
        });

        if (existingTargets.some((t) => t.name === payload.name)) {
            throw new CliError({
                message: `Target '${payload.name}' already exists in ${FERN_YML_FILENAME}.`,
                code: CliError.Code.ConfigError
            });
        }

        const editor = await FernYmlEditor.load({ fernYmlPath });
        await editor.addTarget(payload.name, {
            ...payload.target,
            output: this.buildOutputForYaml(payload.target.output)
        });
        await editor.save();

        context.stderr.info(`${Icons.success} Added '${payload.name}' to ${FERN_YML_FILENAME}`);
    }

    private async handleWithFlags({
        context,
        args,
        fernYmlPath,
        existingTargets
    }: {
        context: Context;
        args: AddCommand.Args;
        fernYmlPath: AbsoluteFilePath;
        existingTargets: Target[];
    }): Promise<void> {
        if (args.target == null) {
            throw new CliError({
                message: `Missing required flags:\n\n  --target <language>    SDK language (e.g. typescript, python, go)`,
                code: CliError.Code.ConfigError
            });
        }

        const language = this.parseLanguage(args.target);
        this.checkForDuplicate({ existingTargets, language });

        const output = args.output != null ? this.parseOutput(args.output) : { path: `./sdks/${language}` };
        const version = args.stable ? await this.resolveStableVersion({ context, language }) : undefined;

        await this.addTarget({ fernYmlPath, language, output, version, group: args.group });

        context.stderr.info(`${Icons.success} Added '${language}' to ${FERN_YML_FILENAME}`);
    }

    private async handleInteractive({
        context,
        args,
        fernYmlPath,
        existingTargets
    }: {
        context: Context;
        args: AddCommand.Args;
        fernYmlPath: AbsoluteFilePath;
        existingTargets: Target[];
    }): Promise<void> {
        const language = args.target != null ? this.parseLanguage(args.target) : await this.promptLanguage();

        this.checkForDuplicate({ existingTargets, language });

        const output = args.output != null ? this.parseOutput(args.output) : { path: `./sdks/${language}` };
        const version = args.stable ? await this.resolveStableVersion({ context, language }) : undefined;

        await this.addTarget({ fernYmlPath, language, output, version, group: args.group });

        context.stderr.info(`${Icons.success} Added '${language}' to ${FERN_YML_FILENAME}`);
    }

    private async promptLanguage(): Promise<Language> {
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

    private parseOutput(value: string): schemas.OutputSchema {
        if (isGitUrl(value)) {
            return {
                git: {
                    repository: value
                }
            };
        }

        if (isRemoteReference(value)) {
            throw new CliError({
                message:
                    `"${value}" looks like a remote reference but is not a recognized git URL.\n\n` +
                    `  Please specify a local path (e.g. ./sdks/my-sdk) or a git URL:\n` +
                    `    https://github.com/owner/repo`,
                code: CliError.Code.ConfigError
            });
        }

        return { path: value };
    }

    private async resolveStableVersion({
        context,
        language
    }: {
        context: Context;
        language: Language;
    }): Promise<string | undefined> {
        const image = LANGUAGE_TO_DOCKER_IMAGE[language];
        try {
            const version = await getLatestGeneratorVersion({
                generatorName: image,
                cliVersion: Version,
                channel: undefined
            });
            return version ?? undefined;
        } catch {
            context.stderr.info(
                chalk.dim(`  Failed to resolve latest stable version for ${language}; using "latest".`)
            );
            return "latest";
        }
    }

    private checkForDuplicate({ existingTargets, language }: { existingTargets: Target[]; language: Language }): void {
        if (existingTargets.some((t) => t.name === language)) {
            throw new CliError({
                message: `Target '${language}' already exists in ${FERN_YML_FILENAME}.`,
                code: CliError.Code.ConfigError
            });
        }
    }

    private async addTarget({
        fernYmlPath,
        language,
        output,
        version,
        group
    }: {
        fernYmlPath: AbsoluteFilePath;
        language: Language;
        output: schemas.OutputSchema;
        version: string | undefined;
        group: string | undefined;
    }): Promise<void> {
        const editor = await FernYmlEditor.load({ fernYmlPath });

        const newTarget: FernYmlEditor.TargetSchema = {
            output: this.buildOutputForYaml(output)
        };
        if (version != null) {
            newTarget.version = version;
        }
        if (group != null) {
            newTarget.group = [group];
        }

        await editor.addTarget(language, newTarget);
        await editor.save();
    }

    private buildOutputForYaml(output: schemas.OutputSchema): string | Record<string, unknown> {
        if (typeof output === "string") {
            return output;
        }
        if (output.git != null) {
            const git = output.git;
            if (schemas.isGitOutputGitHubRepository(git)) {
                const gitConfig: Record<string, unknown> = {
                    repository: git.repository
                };
                if (git.mode != null) {
                    gitConfig.mode = git.mode;
                }
                return { git: gitConfig };
            }
            if (schemas.isGitOutputSelfHosted(git)) {
                const gitConfig: Record<string, unknown> = {
                    uri: git.uri,
                    token: git.token
                };
                if (git.mode != null) {
                    gitConfig.mode = git.mode;
                }
                return { git: gitConfig };
            }
        }
        return output.path ?? "";
    }

    private parseLanguage(target: string): Language {
        const lang = target as Language;
        if (LANGUAGES.includes(lang)) {
            return lang;
        }
        throw new CliError({
            message: `"${target}" is not a supported language. Supported: ${LANGUAGES.join(", ")}`,
            code: CliError.Code.ConfigError
        });
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
                .option("group", {
                    type: "string",
                    description: "Add the target to a specific group"
                })
                .option("yes", {
                    type: "boolean",
                    description: "Accept all defaults (non-interactive mode)",
                    default: false
                })
                .option("input", {
                    type: "string",
                    description:
                        "Add a target from a JSON payload (conforms to the `sdk-add-input` schema). " +
                        "Accepts inline JSON, @path/to.json, or - to read from stdin. " +
                        "Run 'fern schema sdk-add-input' to see the schema."
                })
    );
}
