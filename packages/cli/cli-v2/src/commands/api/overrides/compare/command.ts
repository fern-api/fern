import { mergeWithOverrides } from "@fern-api/core-utils";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { doesPathExist } from "@fern-api/fs-utils";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { Icons } from "../../../../ui/format.js";
import { command } from "../../../_internal/command.js";
import { deriveOutputPath } from "../_shared/deriveOutputPath.js";
import { loadSpec, serializeSpec } from "../_shared/loadSpec.js";
import { generateOverrides } from "./diffSpecs.js";

interface DiffArgs extends GlobalArgs {
    original: string;
    modified: string;
    output?: string;
}

export function addCompareCommand(cli: Argv<GlobalArgs>): void {
    command<DiffArgs>(
        cli,
        "compare <original> <modified>",
        "Compare two OpenAPI specs and generate an overrides file",
        async (context, args) => {
            await handleDiff(context, args);
        },
        (yargs) =>
            yargs
                .positional("original", {
                    type: "string",
                    description: "Path to the original OpenAPI spec",
                    demandOption: true
                })
                .positional("modified", {
                    type: "string",
                    description: "Path to the modified OpenAPI spec",
                    demandOption: true
                })
                .option("output", {
                    type: "string",
                    alias: "o",
                    description: "Output path for the overrides file"
                }) as unknown as Argv<DiffArgs>
    );
}

async function handleDiff(context: Context, args: DiffArgs): Promise<void> {
    // resolveOutputFilePath always returns non-null when given a non-null string
    const originalPath = context.resolveOutputFilePath(args.original) as AbsoluteFilePath;
    const modifiedPath = context.resolveOutputFilePath(args.modified) as AbsoluteFilePath;

    context.stdout.info(chalk.dim(`  Comparing ${originalPath} with ${modifiedPath}`));

    const [original, modified] = await Promise.all([loadSpec(originalPath), loadSpec(modifiedPath)]);

    const overrides = generateOverrides(original, modified);

    if (Object.keys(overrides).length === 0) {
        context.stdout.info(chalk.dim("No differences found between the two specs."));
        return;
    }

    const outputPath =
        args.output != null
            ? (context.resolveOutputFilePath(args.output) as AbsoluteFilePath)
            : deriveOutputPath(originalPath);

    if (await doesPathExist(outputPath)) {
        const existing = await loadSpec(outputPath);
        const merged = mergeWithOverrides({ data: existing, overrides });
        await writeFile(outputPath, serializeSpec(merged, outputPath));
        context.stdout.info(`${Icons.success} Merged diff into existing ${chalk.cyan(outputPath)}`);
    } else {
        await writeFile(outputPath, serializeSpec(overrides, outputPath));
        context.stdout.info(`${Icons.success} Overrides written ${chalk.dim("→")} ${chalk.cyan(outputPath)}`);
    }
}
