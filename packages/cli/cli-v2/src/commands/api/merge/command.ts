import { applyOpenAPIOverlay, mergeWithOverrides } from "@fern-api/core-utils";
import chalk from "chalk";
import { unlink, writeFile } from "fs/promises";
import path from "path";
import type { Argv } from "yargs";
import { FERN_YML_FILENAME } from "../../../config/fern-yml/constants.js";
import { FernYmlEditor } from "../../../config/fern-yml/FernYmlEditor.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { CliError } from "../../../errors/CliError.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";
import { type OverlayDocument, toOverlay } from "../split/diffSpecs.js";
import { filterSpecs } from "../utils/filterSpecs.js";
import { isEnoentError } from "../utils/isEnoentError.js";
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

        let editor: FernYmlEditor | undefined;
        if (args.remove === true) {
            const fernYmlPath = workspace.absoluteFilePath;
            if (fernYmlPath == null) {
                throw new CliError({
                    message: `No ${FERN_YML_FILENAME} found. Run 'fern init' to initialize a project.`
                });
            }
            editor = await FernYmlEditor.load({ fernYmlPath });
        }
        let mergedCount = 0;

        for (const entry of entries) {
            const overlayPath = entry.overlays;
            const overridePaths = entry.overrides != null && entry.overrides.length > 0 ? entry.overrides : undefined;

            if (overlayPath == null && overridePaths == null) {
                context.stderr.info(chalk.dim(`${entry.specFilePath}: no overrides or overlays configured, skipping.`));
                continue;
            }

            // biome-ignore lint/suspicious/noExplicitAny: OpenAPI specs can have any shape
            let merged: Record<string, any> = await loadSpec(entry.specFilePath);

            // Apply overlays first (per user requirement: overlays before overrides)
            if (overlayPath != null) {
                const overlayContent = (await loadSpec(overlayPath)) as OverlayDocument;
                const overlay = toOverlay(overlayContent);
                merged = applyOpenAPIOverlay({ data: merged, overlay });
                context.stderr.info(
                    `${Icons.success} Applied overlay (${chalk.bold(String(overlay.actions.length))} action(s)) ${chalk.dim("→")} ${chalk.cyan(entry.specFilePath)}`
                );
            }

            // Then apply overrides
            if (overridePaths != null) {
                for (const overridePath of overridePaths) {
                    const overrideContent = await loadSpec(overridePath);
                    merged = mergeWithOverrides({ data: merged, overrides: overrideContent });
                }
                context.stderr.info(
                    `${Icons.success} Merged ${chalk.bold(String(overridePaths.length))} override(s) ${chalk.dim("→")} ${chalk.cyan(entry.specFilePath)}`
                );
            }

            await writeFile(entry.specFilePath, serializeSpec(merged, entry.specFilePath));
            mergedCount++;

            if (editor != null) {
                // Remove references from the in-memory YAML (files deleted after save)
                if (overridePaths != null) {
                    const edit = await editor.removeOverrides(entry.specFilePath);
                    if (edit != null) {
                        const relPath = path.relative(context.cwd, await editor.getApiFilePath());
                        const names = overridePaths.map((o) => path.basename(o)).join(", ");
                        context.stderr.info(chalk.dim(`${relPath}:${edit.line}: removed reference to ${names}`));
                    }
                }

                if (overlayPath != null) {
                    const edit = await editor.removeOverlay(entry.specFilePath);
                    if (edit != null) {
                        const relPath = path.relative(context.cwd, await editor.getApiFilePath());
                        context.stderr.info(
                            chalk.dim(`${relPath}:${edit.line}: removed reference to ${path.basename(overlayPath)}`)
                        );
                    }
                }
            }
        }

        if (editor != null) {
            await editor.save();
        }

        // Delete overlay/override files only after the YAML has been saved successfully
        if (args.remove === true) {
            for (const entry of entries) {
                if (entry.overrides != null && entry.overrides.length > 0) {
                    await this.cleanupFiles(context, entry.overrides);
                }
                if (entry.overlays != null) {
                    await this.cleanupFiles(context, [entry.overlays]);
                }
            }
        }

        if (mergedCount === 0) {
            context.stderr.info(chalk.dim("No specs had overrides or overlays to merge."));
        }
    }

    private async cleanupFiles(context: Context, filePaths: string[]): Promise<void> {
        await Promise.all(
            filePaths.map(async (filePath) => {
                try {
                    await unlink(filePath);
                    context.stderr.info(chalk.dim(`Deleted ${filePath}`));
                } catch (error) {
                    if (!isEnoentError(error)) {
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
        "Flatten overlay and override files into the base API spec",
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
                    description: "Remove overlay/override files and their references from fern.yml after merge"
                })
    );
}
