import { mergeWithOverrides } from "@fern-api/core-utils";
import chalk from "chalk";
import { unlink, writeFile } from "fs/promises";
import path from "path";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { CliError } from "../../../errors/CliError.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";
import { FernYmlApiEditor } from "../utils/fernYmlApiEditor.js";
import { filterSpecs } from "../utils/filterSpecs.js";
import { loadSpec, serializeSpec } from "../utils/loadSpec.js";

export declare namespace MergeCommand {
    export interface Args extends GlobalArgs {
        api?: string;
        remove?: boolean;
    }
}

export class MergeCommand {
    public async handle(context: Context, args: MergeCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();

        if (Object.keys(workspace.apis).length === 0) {
            throw new CliError({ message: "No APIs found in workspace." });
        }

        const entries = filterSpecs(workspace, { api: args.api });

        if (entries.length === 0) {
            context.stderr.info(chalk.dim("No matching OpenAPI/AsyncAPI specs found."));
            return;
        }

        const editor = args.remove === true ? await FernYmlApiEditor.load(context.cwd) : undefined;
        let mergedCount = 0;

        for (const entry of entries) {
            if (entry.overrides == null || entry.overrides.length === 0) {
                context.stderr.info(chalk.dim(`  ${entry.specFilePath}: no overrides configured, skipping.`));
                continue;
            }

            // biome-ignore lint/suspicious/noExplicitAny: OpenAPI specs can have any shape
            let merged: Record<string, any> = await loadSpec(entry.specFilePath);

            for (const overridePath of entry.overrides) {
                const overrideContent = await loadSpec(overridePath);
                merged = mergeWithOverrides({ data: merged, overrides: overrideContent });
            }

            await writeFile(entry.specFilePath, serializeSpec(merged, entry.specFilePath));
            context.stderr.info(
                `${Icons.success} Merged ${chalk.bold(String(entry.overrides.length))} override(s) ${chalk.dim("→")} ${chalk.cyan(entry.specFilePath)}`
            );
            mergedCount++;

            if (editor != null) {
                const edit = editor.removeOverrides(entry.specFilePath);
                await this.cleanupOverrideFiles(context, entry.overrides);
                if (edit != null) {
                    const relPath = path.relative(context.cwd, editor.filePath);
                    const names = entry.overrides.map((o) => path.basename(o)).join(", ");
                    context.stderr.info(chalk.dim(`  ${relPath}:${edit.line}: removed reference to ${names}`));
                }
            }
        }

        if (editor != null) {
            await editor.save();
        }

        if (mergedCount === 0) {
            context.stderr.info(chalk.dim("No specs had overrides to merge."));
        }
    }

    private async cleanupOverrideFiles(context: Context, overridePaths: string[]): Promise<void> {
        await Promise.all(
            overridePaths.map(async (overridePath) => {
                try {
                    await unlink(overridePath);
                    context.stderr.info(chalk.dim(`  Deleted ${overridePath}`));
                } catch (error: unknown) {
                    if (
                        !(
                            error instanceof Error &&
                            "code" in error &&
                            (error as NodeJS.ErrnoException).code === "ENOENT"
                        )
                    ) {
                        throw error;
                    }
                }
            })
        );
    }
}

export function addMergeCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new MergeCommand();
    command(
        cli,
        "merge",
        "Flatten override files into the base API spec",
        (context, args) => cmd.handle(context, args as MergeCommand.Args),
        (yargs) =>
            yargs
                .option("api", {
                    type: "string",
                    description: "Filter by API name"
                })
                .option("remove", {
                    type: "boolean",
                    default: false,
                    description: "Remove override files and their references from fern.yml after merge"
                })
    );
}
