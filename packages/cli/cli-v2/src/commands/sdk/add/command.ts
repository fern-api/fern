import { schemas } from "@fern-api/config";
import { getLatestGeneratorVersion } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import chalk from "chalk";
import { readFile, writeFile } from "fs/promises";
import inquirer from "inquirer";
import { type Document, parseDocument } from "yaml";
import type { Argv } from "yargs";
import { FERN_YML_FILENAME, REF_KEY } from "../../../config/fern-yml/constants.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { CliError } from "../../../errors/CliError.js";
import { LANGUAGE_TO_DOCKER_IMAGE } from "../../../sdk/config/converter/constants.js";
import { LANGUAGE_DISPLAY_NAMES, LANGUAGE_ORDER, LANGUAGES, type Language } from "../../../sdk/config/Language.js";
import { Icons } from "../../../ui/format.js";
import { Version } from "../../../version.js";
import { command } from "../../_internal/command.js";
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
    }
}

export class AddCommand {
    public async handle(context: Context, args: AddCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();

        const fernYmlPath = workspace.absoluteFilePath;
        if (fernYmlPath == null) {
            throw new CliError({
                message: `No ${FERN_YML_FILENAME} found. Run 'fern init' to initialize a project.`
            });
        }

        if (!context.isTTY || args.yes) {
            return this.handleWithFlags({ context, args, fernYmlPath });
        }

        return this.handleInteractive({ context, args, fernYmlPath });
    }

    private async handleWithFlags({
        context,
        args,
        fernYmlPath
    }: {
        context: Context;
        args: AddCommand.Args;
        fernYmlPath: AbsoluteFilePath;
    }): Promise<void> {
        if (args.target == null) {
            throw new CliError({
                message: `Missing required flags:\n\n  --target <language>    SDK language (e.g. typescript, python, go)`
            });
        }

        const language = this.parseLanguage(args.target);
        const output = args.output != null ? this.parseOutput(args.output) : { path: `./sdks/${language}` };
        const version = args.stable ? await this.resolveStableVersion({ context, language }) : undefined;

        await this.addTargetToFernYml({
            context,
            fernYmlPath,
            language,
            output,
            version,
            group: args.group
        });

        context.stderr.info(`${Icons.success} Added '${language}' to ${FERN_YML_FILENAME}`);
    }

    private async handleInteractive({
        context,
        args,
        fernYmlPath
    }: {
        context: Context;
        args: AddCommand.Args;
        fernYmlPath: AbsoluteFilePath;
    }): Promise<void> {
        const language = args.target != null ? this.parseLanguage(args.target) : await this.promptLanguage();

        await this.checkForDuplicate({ fernYmlPath, language });

        const output = args.output != null ? this.parseOutput(args.output) : { path: `./sdks/${language}` };
        const version = args.stable ? await this.resolveStableVersion({ context, language }) : undefined;

        await this.addTargetToFernYml({
            context,
            fernYmlPath,
            language,
            output,
            version,
            group: args.group
        });

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
                    `    https://github.com/owner/repo`
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

    private async checkForDuplicate({
        fernYmlPath,
        language
    }: {
        fernYmlPath: AbsoluteFilePath;
        language: Language;
    }): Promise<void> {
        const { targetsFilePath, document } = await this.resolveTargetsFile(fernYmlPath);
        const targetsPath = this.resolveTargetsPath({ document, isRefTarget: targetsFilePath !== fernYmlPath });
        if (document.hasIn([...targetsPath, language])) {
            throw new CliError({
                message: `Target '${language}' already exists in ${FERN_YML_FILENAME}.`
            });
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
        const { targetsFilePath, document } = await this.resolveTargetsFile(fernYmlPath);

        // Find the targets map. If we followed a $ref from `sdks`, the resolved
        // file's root IS the sdks object; otherwise it's `.sdks.targets`.
        const isRefTarget = targetsFilePath !== fernYmlPath;

        const targetsPath = this.resolveTargetsPath({ document, isRefTarget });
        if (document.hasIn([...targetsPath, language])) {
            throw new CliError({
                message: `Target '${language}' already exists in ${FERN_YML_FILENAME}.`
            });
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

        // Ensure the parent path exists in the document (i.e. similar to 'mkdir -p').
        this.ensureMapPath(document, targetsPath);

        // Add the new target using the Document API in order to preserve comments.
        document.setIn([...targetsPath, language], document.createNode(newTarget));

        await writeFile(targetsFilePath, document.toString(), "utf-8");
    }

    /**
     * Resolves the file that actually contains the `targets` key.
     *
     * If the `sdks` value in fern.yml is a `$ref`, we follow it and return
     * the referenced file's Document instead.
     */
    private async resolveTargetsFile(
        fernYmlPath: AbsoluteFilePath
    ): Promise<{ targetsFilePath: AbsoluteFilePath; document: Document }> {
        const content = await readFile(fernYmlPath, "utf-8");
        const document = parseDocument(content);
        const doc = document.toJS() as Record<string, unknown>;

        if (doc == null || typeof doc !== "object") {
            throw new CliError({
                message: `Invalid ${FERN_YML_FILENAME}: expected a YAML object; run 'fern init' to initialize a new file.`
            });
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
                    return { targetsFilePath: resolvedPath, document: refDocument };
                }
            }
        }

        return { targetsFilePath: fernYmlPath, document };
    }

    /**
     * Determines the YAML path to the targets map within a document.
     *
     * If we resolved a `$ref`, the referenced file's root is the sdks config
     * so `targets` is at the root level. Otherwise `targets` is nested under
     * `sdks`.
     */
    private resolveTargetsPath({ document, isRefTarget }: { document: Document; isRefTarget: boolean }): string[] {
        if (isRefTarget) {
            // Referenced file should always have targets at root.
            return ["targets"];
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
            message: `"${target}" is not a supported language. Supported: ${LANGUAGES.join(", ")}`
        });
    }
}

export function addAddCommand(cli: Argv<GlobalArgs>, parentPath?: string): void {
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
                }),
        parentPath
    );
}
