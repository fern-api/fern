import { mergeWithOverrides } from "@fern-api/core-utils";
import chalk from "chalk";
import { unlink, writeFile } from "fs/promises";
import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { CliError } from "../../../../errors/CliError.js";
import { Icons } from "../../../../ui/format.js";
import { command } from "../../../_internal/command.js";
import { FernYmlApiEditor } from "../_shared/fernYmlApiEditor.js";
import { filterSpecs } from "../_shared/filterSpecs.js";
import { loadSpec, serializeSpec } from "../_shared/loadSpec.js";

interface MergeArgs extends GlobalArgs {
    api?: string;
    spec?: string;
    cleanup?: boolean;
}

export function addMergeCommand(cli: Argv<GlobalArgs>): void {
    command<MergeArgs>(
        cli,
        "merge",
        "Flatten override files into the base API spec",
        async (context, args) => {
            await handleMerge(context, args);
        },
        (yargs) =>
            yargs
                .option("api", {
                    type: "string",
                    description: "Filter by API name"
                })
                .option("spec", {
                    type: "string",
                    description: "Filter by spec file path"
                })
                .option("cleanup", {
                    type: "boolean",
                    default: false,
                    description: "Delete override files and remove references from fern.yml after merge"
                }) as unknown as Argv<MergeArgs>
    );
}

async function handleMerge(context: Context, args: MergeArgs): Promise<void> {
    const workspace = await context.loadWorkspaceOrThrow();

    if (Object.keys(workspace.apis).length === 0) {
        throw new CliError({ message: "No APIs found in workspace." });
    }

    const entries = filterSpecs(workspace, { api: args.api, spec: args.spec });

    if (entries.length === 0) {
        context.stdout.info(chalk.dim("No matching OpenAPI/AsyncAPI specs found."));
        return;
    }

    const editor = args.cleanup === true ? await FernYmlApiEditor.load(context.cwd) : undefined;
    let mergedCount = 0;

    for (const entry of entries) {
        if (entry.overrides == null || entry.overrides.length === 0) {
            context.stdout.info(chalk.dim(`  ${entry.specFilePath}: no overrides configured, skipping.`));
            continue;
        }

        // biome-ignore lint/suspicious/noExplicitAny: OpenAPI specs can have any shape
        let merged: Record<string, any> = await loadSpec(entry.specFilePath);

        for (const overridePath of entry.overrides) {
            const overrideContent = await loadSpec(overridePath);
            merged = mergeWithOverrides({ data: merged, overrides: overrideContent });
        }

        await writeFile(entry.specFilePath, serializeSpec(merged, entry.specFilePath));
        context.stdout.info(
            `${Icons.success} Merged ${chalk.bold(String(entry.overrides.length))} override(s) ${chalk.dim("→")} ${chalk.cyan(entry.specFilePath)}`
        );
        mergedCount++;

        if (editor != null) {
            await Promise.all(
                entry.overrides.map(async (overridePath) => {
                    try {
                        await unlink(overridePath);
                        context.stdout.info(chalk.dim(`  Deleted ${overridePath}`));
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
            editor.removeOverrides(entry.specFilePath);
            context.stdout.info(chalk.dim("  Removed override references from fern.yml"));
        }
    }

    if (editor != null) {
        await editor.save();
    }

    if (mergedCount === 0) {
        context.stdout.info(chalk.dim("No specs had overrides to merge."));
    }
}
