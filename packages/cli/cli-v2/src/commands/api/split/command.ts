import { mergeWithOverrides } from "@fern-api/core-utils";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import chalk from "chalk";
import { execFile } from "child_process";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { promisify } from "util";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { CliError } from "../../../errors/CliError.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";
import { FernYmlApiEditor } from "../utils/fernYmlApiEditor.js";
import { filterSpecs } from "../utils/filterSpecs.js";
import { loadSpec, parseSpec, serializeSpec } from "../utils/loadSpec.js";
import { deriveOutputPath } from "./deriveOutputPath.js";
import { generateOverrides } from "./diffSpecs.js";

const execFileAsync = promisify(execFile);

export declare namespace SplitCommand {
    export interface Args extends GlobalArgs {
        api?: string;
        "merge-into"?: string;
        output?: string;
    }
}

export class SplitCommand {
    private cachedRepoRoot: string | undefined;

    public async handle(context: Context, args: SplitCommand.Args): Promise<void> {
        this.cachedRepoRoot = undefined;

        const workspace = await context.loadWorkspaceOrThrow();

        if (Object.keys(workspace.apis).length === 0) {
            throw new CliError({ message: "No APIs found in workspace." });
        }

        if (args["merge-into"] != null && args.output != null) {
            throw new CliError({ message: "Cannot use both --merge-into and --output at the same time." });
        }

        const entries = filterSpecs(workspace, { api: args.api });

        if (entries.length === 0) {
            context.stderr.info(chalk.dim("No matching OpenAPI/AsyncAPI specs found."));
            return;
        }

        const editor = args["merge-into"] == null ? await FernYmlApiEditor.load(context.cwd) : undefined;
        let splitCount = 0;

        for (const entry of entries) {
            const [currentContent, originalRaw] = await Promise.all([
                loadSpec(entry.specFilePath),
                this.getFileFromGitHead(entry.specFilePath)
            ]);
            const originalContent = parseSpec(originalRaw, entry.specFilePath);

            const overrides = generateOverrides(originalContent, currentContent);

            if (Object.keys(overrides).length === 0) {
                context.stderr.info(chalk.dim(`  ${entry.specFilePath}: no changes from git HEAD, skipping.`));
                continue;
            }

            let outputPath: AbsoluteFilePath;

            if (args["merge-into"] != null) {
                outputPath = resolvePathOrThrow(context, args["merge-into"]);
                await mergeOverridesIntoFile(outputPath, overrides);
                context.stderr.info(`${Icons.success} Merged diff into ${chalk.cyan(outputPath)}`);
            } else {
                outputPath =
                    args.output != null
                        ? resolvePathOrThrow(context, args.output)
                        : deriveOutputPath(entry.specFilePath);

                if (await this.tryMergeIntoExistingFile(outputPath, overrides)) {
                    context.stderr.info(`${Icons.success} Merged diff into existing ${chalk.cyan(outputPath)}`);
                } else {
                    await writeFile(outputPath, serializeSpec(overrides, outputPath));
                    context.stderr.info(
                        `${Icons.success} Overrides written ${chalk.dim("→")} ${chalk.cyan(outputPath)}`
                    );
                }

                if (editor != null && editor.addOverride(entry.specFilePath, outputPath)) {
                    context.stderr.info(chalk.dim("  Added override reference to fern.yml"));
                }
            }

            // Restore spec to git HEAD after overrides are safely written
            await writeFile(entry.specFilePath, originalRaw);
            context.stderr.info(chalk.dim(`  Restored ${entry.specFilePath} to git HEAD`));

            splitCount++;
        }

        if (editor != null) {
            await editor.save();
        }

        if (splitCount === 0) {
            context.stderr.info(chalk.dim("No specs had changes to split."));
        }
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
        } catch {
            return false;
        }
        const existing = parseSpec(raw, outputPath);
        const merged = mergeWithOverrides({ data: existing, overrides });
        await writeFile(outputPath, serializeSpec(merged, outputPath));
        return true;
    }

    private async getFileFromGitHead(absolutePath: AbsoluteFilePath): Promise<string> {
        try {
            const repoRoot = await this.getRepoRoot(absolutePath);
            const relativePath = path.relative(repoRoot, absolutePath);

            const { stdout } = await execFileAsync("git", ["show", `HEAD:${relativePath}`], {
                cwd: repoRoot,
                encoding: "utf8",
                maxBuffer: 50 * 1024 * 1024
            });
            return stdout;
        } catch (error: unknown) {
            const detail = error instanceof Error ? error.message : String(error);
            throw new CliError({
                message: `Failed to get file from git HEAD: ${absolutePath}. Is the file tracked by git and has at least one commit?\n  Cause: ${detail}`
            });
        }
    }

    private async getRepoRoot(nearPath: AbsoluteFilePath): Promise<string> {
        if (this.cachedRepoRoot != null) {
            return this.cachedRepoRoot;
        }
        const { stdout } = await execFileAsync("git", ["rev-parse", "--show-toplevel"], {
            cwd: path.dirname(nearPath),
            encoding: "utf8"
        });
        this.cachedRepoRoot = stdout.trim();
        return this.cachedRepoRoot;
    }
}

function resolvePathOrThrow(context: Context, outputPath: string): AbsoluteFilePath {
    const resolved = context.resolveOutputFilePath(outputPath);
    if (resolved == null) {
        throw new CliError({ message: `Could not resolve output path: ${outputPath}` });
    }
    return resolved;
}

async function mergeOverridesIntoFile(
    filepath: AbsoluteFilePath,
    // biome-ignore lint/suspicious/noExplicitAny: OpenAPI specs can have any shape
    overrides: Record<string, any>
): Promise<void> {
    const existing = await loadSpec(filepath);
    const merged = mergeWithOverrides({ data: existing, overrides });
    await writeFile(filepath, serializeSpec(merged, filepath));
}

export function addSplitCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new SplitCommand();
    command(
        cli,
        "split",
        "Extract changes from a modified spec into an override file, restoring the spec to its git HEAD state",
        (context, args) => cmd.handle(context, args as SplitCommand.Args),
        (yargs) =>
            yargs
                .option("api", {
                    type: "string",
                    description: "Filter by API name"
                })
                .option("merge-into", {
                    type: "string",
                    description: "Merge the extracted diff into this existing override file"
                })
                .option("output", {
                    type: "string",
                    description: "Custom output path for the new override file"
                })
    );
}
