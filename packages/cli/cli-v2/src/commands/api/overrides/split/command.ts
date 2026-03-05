import { mergeWithOverrides } from "@fern-api/core-utils";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { doesPathExist } from "@fern-api/fs-utils";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { CliError } from "../../../../errors/CliError.js";
import { Icons } from "../../../../ui/format.js";
import { command } from "../../../_internal/command.js";
import { deriveOutputPath } from "../_shared/deriveOutputPath.js";
import { FernYmlApiEditor } from "../_shared/fernYmlApiEditor.js";
import { filterSpecs } from "../_shared/filterSpecs.js";
import { loadSpec, parseSpec, serializeSpec } from "../_shared/loadSpec.js";
import { generateOverrides } from "../compare/diffSpecs.js";
import { getFileFromGitHead } from "./gitUtils.js";

interface SplitArgs extends GlobalArgs {
    api?: string;
    spec?: string;
    "merge-into"?: string;
    output?: string;
}

export function addSplitCommand(cli: Argv<GlobalArgs>): void {
    command<SplitArgs>(
        cli,
        "split",
        "Extract changes from a modified spec into an override file, restoring the spec to its git HEAD state",
        async (context, args) => {
            await handleSplit(context, args);
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
                .option("merge-into", {
                    type: "string",
                    description: "Merge the extracted diff into this existing override file"
                })
                .option("output", {
                    type: "string",
                    alias: "o",
                    description: "Custom output path for the new override file"
                }) as unknown as Argv<SplitArgs>
    );
}

async function handleSplit(context: Context, args: SplitArgs): Promise<void> {
    const workspace = await context.loadWorkspaceOrThrow();

    if (Object.keys(workspace.apis).length === 0) {
        throw new CliError({ message: "No APIs found in workspace." });
    }

    if (args["merge-into"] != null && args.output != null) {
        throw new CliError({ message: "Cannot use both --merge-into and --output at the same time." });
    }

    const entries = filterSpecs(workspace, { api: args.api, spec: args.spec });

    if (entries.length === 0) {
        context.stdout.info(chalk.dim("No matching OpenAPI/AsyncAPI specs found."));
        return;
    }

    const editor = args["merge-into"] == null ? await FernYmlApiEditor.load(context.cwd) : undefined;
    let splitCount = 0;

    for (const entry of entries) {
        const [currentContent, originalRaw] = await Promise.all([
            loadSpec(entry.specFilePath),
            getFileFromGitHead(entry.specFilePath)
        ]);
        const originalContent = parseSpec(originalRaw, entry.specFilePath);

        const overrides = generateOverrides(originalContent, currentContent);

        if (Object.keys(overrides).length === 0) {
            context.stdout.info(chalk.dim(`  ${entry.specFilePath}: no changes from git HEAD, skipping.`));
            continue;
        }

        let outputPath: AbsoluteFilePath;

        if (args["merge-into"] != null) {
            outputPath = context.resolveOutputFilePath(args["merge-into"]) as AbsoluteFilePath;
            const existingOverrides = await loadSpec(outputPath);
            const merged = mergeWithOverrides({ data: existingOverrides, overrides });
            await writeFile(outputPath, serializeSpec(merged, outputPath));
            context.stdout.info(`${Icons.success} Merged diff into ${chalk.cyan(outputPath)}`);
        } else {
            outputPath =
                args.output != null
                    ? (context.resolveOutputFilePath(args.output) as AbsoluteFilePath)
                    : deriveOutputPath(entry.specFilePath);

            if (await doesPathExist(outputPath)) {
                const existingOverrides = await loadSpec(outputPath);
                const merged = mergeWithOverrides({ data: existingOverrides, overrides });
                await writeFile(outputPath, serializeSpec(merged, outputPath));
                context.stdout.info(`${Icons.success} Merged diff into existing ${chalk.cyan(outputPath)}`);
            } else {
                await writeFile(outputPath, serializeSpec(overrides, outputPath));
                context.stdout.info(`${Icons.success} Overrides written ${chalk.dim("→")} ${chalk.cyan(outputPath)}`);
            }

            if (editor != null && editor.addOverride(entry.specFilePath, outputPath)) {
                context.stdout.info(chalk.dim("  Added override reference to fern.yml"));
            }
        }

        // Restore spec to git HEAD after overrides are safely written
        await writeFile(entry.specFilePath, originalRaw);
        context.stdout.info(chalk.dim(`  Restored ${entry.specFilePath} to git HEAD`));

        splitCount++;
    }

    if (editor != null) {
        await editor.save();
    }

    if (splitCount === 0) {
        context.stdout.info(chalk.dim("No specs had changes to split."));
    }
}
