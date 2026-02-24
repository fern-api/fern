import { schemas } from "@fern-api/config";
import { getLatestGeneratorVersion } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import chalk from "chalk";
import { readFile, writeFile } from "fs/promises";
import inquirer from "inquirer";
import { type Document, parseDocument } from "yaml";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { CliError } from "../../../errors/CliError.js";
import { LANGUAGE_TO_DOCKER_IMAGE } from "../../../sdk/config/converter/constants.js";
import { LANGUAGE_DISPLAY_NAMES, LANGUAGE_ORDER, LANGUAGES, type Language } from "../../../sdk/config/Language.js";
import { Icons } from "../../../ui/format.js";
import { Version } from "../../../version.js";
import { command } from "../../_internal/command.js";
import { isGitUrl, looksLikeRemoteReference } from "../utils/gitUrl.js";

const FERN_YML_FILENAME = "fern.yml";
const REF_KEY = "$ref";

export declare namespace AddCommand {
    export interface Args extends GlobalArgs {
        /** The SDK target language to add */
        target?: string;

        /** Pin the latest stable version from the Fern registry */
        stable: boolean;

        /** Output path or git URL */
        output?: string;

        /** The group to add the target to */
        group?: string;

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
            context,
            fernYmlPath,
            language,
            output,
            version,
            group: args.group
        });

        context.stderr.info(`\n  ${Icons.success} Added '${language}' to ${FERN_YML_FILENAME}`);
    }

    private async resolveLanguage(context: Context, args: AddCommand.Args): Promise<Language> {
        if (args.target != null) {
            return this.parseLanguage(args.target);
        }

        if (args.yes) {
            throw new CliError({
                message:
                    `The --target flag is required. Specify the SDK language to add:\n\n` +
                    `  --target <language>    SDK language (e.g. typescript, python, go)`
            });
        }

        if (!context.isTTY) {
            throw new CliError({
                message:
                    `Please use the \`-y\` flag to accept all default inputs or specify all of the required flags:\n\n` +
                    `  --target <language>    SDK language (e.g. typescript, python, go)\n` +
                    `  --output <path|url>    Output path or git URL (e.g. ./my-sdk)`
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
        if (isGitUrl(value)) {
            return {
                git: {
                    repository: value
                }
            };
        }

        if (looksLikeRemoteReference(value)) {
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

    /**
     * Adds a new SDK target to the fern.yml (or the file that actually
     * contains the `targets` key, if the `sdks` section uses a `$ref`).
     *
     * Uses the `yaml` library's Document API so that in-line comments and
     * formatting in the original file are preserved.
     */
    private async addTargetToFernYml({
        context,
        fernYmlPath,
        language,
        output,
        version,
        group
    }: {
        context: Context;
        fernYmlPath: AbsoluteFilePath;
        language: Language;
        output: schemas.OutputSchema;
        version: string | undefined;
        group: string | undefined;
    }): Promise<void> {
        const { filePath, document } = await this.resolveTargetsFile(fernYmlPath);

        const doc = document.toJS() as Record<string, unknown>;

        // Find the targets map. If we followed a $ref from `sdks`, the resolved
        // file's root IS the sdks object; otherwise it's `doc.sdks.targets`.
        const isRefTarget = filePath !== fernYmlPath;

        // Determine the YAML path to the targets map inside the document.
        const targetsPath = this.resolveTargetsPath(document, isRefTarget);

        // Read the current targets to check for duplicates.
        const existingTargets = document.getIn(targetsPath) as Record<string, unknown> | undefined;
        if (existingTargets != null && typeof existingTargets === "object") {
            const targetsJs = document.getIn(targetsPath, false) as Record<string, unknown> | undefined;
            if (targetsJs != null && language in targetsJs) {
                throw new CliError({
                    message: `Target '${language}' already exists in ${FERN_YML_FILENAME}.`
                });
            }
        }

        // Build the new target node.
        const newTarget: Record<string, unknown> = {};
        if (version != null) {
            newTarget.version = version;
        }
        newTarget.output = this.buildOutputForYaml(output);
        if (group != null) {
            newTarget.group = [group];
        }

        // Ensure the parent path exists in the document.
        this.ensureMapPath(document, targetsPath);

        // Add the new target using the Document API (preserves comments).
        document.setIn([...targetsPath, language], document.createNode(newTarget));

        await writeFile(filePath, document.toString(), "utf-8");

        if (isRefTarget) {
            const relative = filePath.replace(dirname(fernYmlPath), ".");
            context.stderr.info(chalk.dim(`  Updated ${relative}`));
        }
    }

    /**
     * Resolves the file that actually contains the `targets` key.
     *
     * If the `sdks` value in fern.yml is a `$ref`, we follow it and return
     * the referenced file's Document instead.
     */
    private async resolveTargetsFile(
        fernYmlPath: AbsoluteFilePath
    ): Promise<{ filePath: AbsoluteFilePath; document: Document }> {
        const content = await readFile(fernYmlPath, "utf-8");
        const document = parseDocument(content);
        const doc = document.toJS() as Record<string, unknown>;

        if (doc == null || typeof doc !== "object") {
            throw new CliError({ message: `Invalid ${FERN_YML_FILENAME}: expected a YAML object` });
        }

        // Check if sdks uses a $ref.
        const sdksValue = doc.sdks;
        if (sdksValue != null && typeof sdksValue === "object" && REF_KEY in sdksValue) {
            const refPath = (sdksValue as Record<string, unknown>)[REF_KEY];
            if (typeof refPath === "string") {
                const resolvedPath = join(dirname(fernYmlPath), RelativeFilePath.of(refPath));
                if (await doesPathExist(resolvedPath)) {
                    const refContent = await readFile(resolvedPath, "utf-8");
                    const refDocument = parseDocument(refContent);
                    return { filePath: resolvedPath, document: refDocument };
                }
            }
        }

        return { filePath: fernYmlPath, document };
    }

    /**
     * Determines the YAML path to the targets map within a document.
     *
     * If we resolved a `$ref`, the referenced file's root is the sdks config
     * so `targets` is at the root level. Otherwise `targets` is nested under
     * `sdks`.
     */
    private resolveTargetsPath(document: Document, isRefTarget: boolean): (string | number)[] {
        if (isRefTarget) {
            const root = document.toJS();
            if (root != null && typeof root === "object" && "targets" in root) {
                return ["targets"];
            }
            return [];
        }
        return ["sdks", "targets"];
    }

    /**
     * Ensures that the map path exists in the document, creating intermediate
     * maps as needed.
     */
    private ensureMapPath(document: Document, path: (string | number)[]): void {
        for (let i = 1; i <= path.length; i++) {
            const subPath = path.slice(0, i);
            const existing = document.getIn(subPath);
            if (existing == null) {
                document.setIn(subPath, document.createNode({}));
            }
        }
    }

    private buildOutputForYaml(output: schemas.OutputSchema): Record<string, unknown> {
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
                    alias: "y",
                    description: "Accept all defaults (non-interactive mode)",
                    default: false
                })
    );
}
