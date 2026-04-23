import { extractErrorMessage, mergeWithOverrides } from "@fern-api/core-utils";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import { execFile } from "child_process";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { promisify } from "util";
import type { Argv } from "yargs";
import { FERN_YML_FILENAME } from "../../../config/fern-yml/constants.js";
import { FernYmlEditor } from "../../../config/fern-yml/FernYmlEditor.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";
import type { SpecEntry } from "../utils/filterSpecs.js";
import { filterSpecs } from "../utils/filterSpecs.js";
import { isEnoentError } from "../utils/isEnoentError.js";
import { loadSpec, parseSpec, serializeSpec } from "../utils/loadSpec.js";
import {
    ALL_FORMAT_NAMES,
    deriveOutputPath,
    normalizeSplitFormat,
    OVERLAY_NAME,
    OVERRIDES_NAME,
    type SplitFormat,
    type SplitFormatInput
} from "./deriveOutputPath.js";
import { generateOverlay, generateOverrides, hasChanges, type OverlayOutputAction } from "./diffSpecs.js";

const execFileAsync = promisify(execFile);

/** 50 MB – large enough for oversized OpenAPI specs retrieved via `git show`. */
const GIT_MAX_BUFFER_BYTES = 50 * 1024 * 1024;

export declare namespace SplitCommand {
    export interface Args extends GlobalArgs {
        api?: string;
        output?: string;
        format?: SplitFormatInput;
    }
}

export class SplitCommand {
    public async handle(context: Context, args: SplitCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();

        if (Object.keys(workspace.apis).length === 0) {
            throw new CliError({ message: "No APIs found in workspace.", code: CliError.Code.ConfigError });
        }

        const entries = filterSpecs(workspace, { api: args.api });

        if (entries.length === 0) {
            context.stderr.info(chalk.dim("No matching OpenAPI/AsyncAPI specs found."));
            return;
        }

        const format: SplitFormat = normalizeSplitFormat(args.format ?? OVERLAY_NAME);
        const fernYmlPath = workspace.absoluteFilePath;
        if (fernYmlPath == null) {
            throw new CliError({
                message: `No ${FERN_YML_FILENAME} found. Run 'fern init' to initialize a project.`,
                code: CliError.Code.ConfigError
            });
        }
        const editor = await FernYmlEditor.load({ fernYmlPath });
        const repoRoot = await this.getRepoRoot(fernYmlPath);
        let splitCount = 0;

        for (const entry of entries) {
            const [currentContent, originalRaw] = await Promise.all([
                loadSpec(entry.specFilePath),
                this.getFileFromGitHead(repoRoot, entry.specFilePath)
            ]);
            const originalContent = parseSpec(originalRaw, entry.specFilePath);

            if (!hasChanges(originalContent, currentContent)) {
                context.stderr.info(chalk.dim(`${entry.specFilePath}: no changes from git HEAD, skipping.`));
                continue;
            }

            if (format === OVERLAY_NAME) {
                await this.splitAsOverlay(context, editor, entry, originalContent, currentContent, args.output);
            } else {
                await this.splitAsOverrides(context, editor, entry, originalContent, currentContent, args.output);
            }

            // Restore spec to git HEAD after overlay/overrides are safely written
            await writeFile(entry.specFilePath, originalRaw);
            context.stderr.debug(chalk.dim(`Restored ${entry.specFilePath} to git HEAD`));

            splitCount++;
        }

        await editor.save();

        if (splitCount === 0) {
            context.stderr.info(chalk.dim("No specs had changes to split."));
        }
    }

    private async splitAsOverlay(
        context: Context,
        editor: FernYmlEditor,
        entry: SpecEntry,
        // biome-ignore lint/suspicious/noExplicitAny: OpenAPI specs can have any shape
        originalContent: Record<string, any>,
        // biome-ignore lint/suspicious/noExplicitAny: OpenAPI specs can have any shape
        currentContent: Record<string, any>,
        outputArg: string | undefined
    ): Promise<void> {
        const overlay = generateOverlay(originalContent, currentContent);

        // Check if there's an existing overlay configured in fern.yml
        const existingOverlayPath = (await editor.getOverlayPath(entry.specFilePath)) ?? entry.overlays;

        let outputPath: AbsoluteFilePath;
        if (existingOverlayPath != null) {
            if (outputArg != null) {
                context.stderr.info(
                    chalk.yellow(
                        `Warning: --output ignored; merging into existing overlay file ${chalk.cyan(existingOverlayPath)}`
                    )
                );
            }
            outputPath = existingOverlayPath;
        } else {
            outputPath =
                outputArg != null
                    ? resolvePathOrThrow(context, outputArg)
                    : deriveOutputPath(entry.specFilePath, OVERLAY_NAME);
        }

        if (await this.tryMergeOverlayIntoExistingFile(outputPath, overlay.actions)) {
            context.stderr.info(
                `${Icons.success} Merged ${chalk.bold(String(overlay.actions.length))} action(s) into existing ${chalk.cyan(outputPath)}`
            );
        } else {
            await writeFile(outputPath, serializeSpec(overlay, outputPath));
            context.stderr.info(
                `${Icons.success} Overlay written (${chalk.bold(String(overlay.actions.length))} action(s)) ${chalk.dim("→")} ${chalk.cyan(outputPath)}`
            );
        }

        const edit = await editor.addOverlay(entry.specFilePath, outputPath);
        if (edit != null) {
            const relPath = path.relative(context.cwd, await editor.getApiFilePath());
            context.stderr.info(chalk.dim(`${relPath}:${edit.line}: added reference to ${path.basename(outputPath)}`));
        }
    }

    private async splitAsOverrides(
        context: Context,
        editor: FernYmlEditor,
        entry: SpecEntry,
        // biome-ignore lint/suspicious/noExplicitAny: OpenAPI specs can have any shape
        originalContent: Record<string, any>,
        // biome-ignore lint/suspicious/noExplicitAny: OpenAPI specs can have any shape
        currentContent: Record<string, any>,
        outputArg: string | undefined
    ): Promise<void> {
        const overrides = generateOverrides(originalContent, currentContent);
        const outputPath =
            outputArg != null
                ? resolvePathOrThrow(context, outputArg)
                : deriveOutputPath(entry.specFilePath, OVERRIDES_NAME);

        if (await this.tryMergeIntoExistingFile(outputPath, overrides)) {
            context.stderr.info(`${Icons.success} Merged diff into existing ${chalk.cyan(outputPath)}`);
        } else {
            await writeFile(outputPath, serializeSpec(overrides, outputPath));
            context.stderr.info(`${Icons.success} Overrides written ${chalk.dim("→")} ${chalk.cyan(outputPath)}`);
        }

        const edit = await editor.addOverride(entry.specFilePath, outputPath);
        if (edit != null) {
            const relPath = path.relative(context.cwd, await editor.getApiFilePath());
            context.stderr.info(chalk.dim(`${relPath}:${edit.line}: added reference to ${path.basename(outputPath)}`));
        }
    }

    /**
     * Tries to load an existing overlay file and append new actions to it.
     * Returns true if the file existed and was merged, false if the file does not exist.
     */
    private async tryMergeOverlayIntoExistingFile(
        outputPath: AbsoluteFilePath,
        newActions: OverlayOutputAction[]
    ): Promise<boolean> {
        let raw: string;
        try {
            raw = await readFile(outputPath, "utf8");
        } catch (error) {
            if (isEnoentError(error)) {
                return false;
            }
            throw error;
        }
        const existing = parseSpec(raw, outputPath);
        const existingActions = Array.isArray(existing.actions) ? existing.actions : [];
        existing.actions = [...existingActions, ...newActions];
        await writeFile(outputPath, serializeSpec(existing, outputPath));
        return true;
    }

    /**
     * Tries to load an existing file at `outputPath` and merge overrides into it.
     * Returns true if the file existed and was merged, false if the file does not exist.
     */
    private async tryMergeIntoExistingFile(
        outputPath: AbsoluteFilePath,
        // biome-ignore lint/suspicious/noExplicitAny: OpenAPI specs can have any shape
        overrides: Record<string, any>
    ): Promise<boolean> {
        let raw: string;
        try {
            raw = await readFile(outputPath, "utf8");
        } catch (error) {
            if (isEnoentError(error)) {
                return false;
            }
            throw error;
        }
        const existing = parseSpec(raw, outputPath);
        const merged = mergeWithOverrides({ data: existing, overrides });
        await writeFile(outputPath, serializeSpec(merged, outputPath));
        return true;
    }

    private async getFileFromGitHead(repoRoot: string, absolutePath: AbsoluteFilePath): Promise<string> {
        try {
            const relativePath = path.relative(repoRoot, absolutePath);

            const { stdout } = await execFileAsync("git", ["show", `HEAD:${relativePath}`], {
                cwd: repoRoot,
                encoding: "utf8",
                maxBuffer: GIT_MAX_BUFFER_BYTES
            });
            return stdout;
        } catch (error: unknown) {
            const detail = extractErrorMessage(error);
            throw new CliError({
                message: `Failed to get file from git HEAD: ${absolutePath}. Is the file tracked by git and has at least one commit?\n  Cause: ${detail}`,
                code: CliError.Code.ParseError
            });
        }
    }

    private async getRepoRoot(nearPath: AbsoluteFilePath): Promise<string> {
        const { stdout } = await execFileAsync("git", ["rev-parse", "--show-toplevel"], {
            cwd: path.dirname(nearPath),
            encoding: "utf8"
        });
        return stdout.trim();
    }
}

function resolvePathOrThrow(context: Context, outputPath: string): AbsoluteFilePath {
    const resolved = context.resolveOutputFilePath(outputPath);
    if (resolved == null) {
        throw new CliError({
            message: `Could not resolve output path: ${outputPath}`,
            code: CliError.Code.ConfigError
        });
    }
    return resolved;
}

export function addSplitCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new SplitCommand();
    command(
        cli,
        "split",
        "Extract changes from a modified spec into an overlay or override file, restoring the spec to its git HEAD state",
        (context, args) => cmd.handle(context, args as SplitCommand.Args),
        (yargs) =>
            yargs
                .option("api", {
                    type: "string",
                    description: "Filter by API name"
                })
                .option("output", {
                    type: "string",
                    description: "Custom output path for the new overlay/override file"
                })
                .option("format", {
                    type: "string",
                    default: OVERLAY_NAME,
                    description: `Output format: '${OVERLAY_NAME}' (OpenAPI Overlay 1.0.0) or '${OVERRIDES_NAME}' (Fern deep-merge)`
                })
                .coerce("format", (value: string): SplitFormatInput => {
                    if (!(ALL_FORMAT_NAMES as readonly string[]).includes(value)) {
                        throw new CliError({
                            message: `Invalid format '${value}'. Expected one of: ${OVERLAY_NAME}, ${OVERRIDES_NAME}`,
                            code: CliError.Code.ValidationError
                        });
                    }
                    return value as SplitFormatInput;
                })
    );
}
