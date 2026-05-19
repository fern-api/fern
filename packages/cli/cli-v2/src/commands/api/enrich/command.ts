import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import { writeFile } from "fs/promises";
import path from "path";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";
import { loadSpec, serializeSpec } from "../utils/loadSpec.js";
import { extractEnrichedExamples, mergeExamplesIntoSpec } from "./mergeExamples.js";

export declare namespace EnrichCommand {
    export interface Args extends GlobalArgs {
        openapi: string;
        file: string;
        output?: string;
        split?: boolean;
    }
}

export class EnrichCommand {
    public async handle(context: Context, args: EnrichCommand.Args): Promise<void> {
        const openapiPath = AbsoluteFilePath.of(path.resolve(context.cwd, args.openapi));
        const overridesPath = AbsoluteFilePath.of(path.resolve(context.cwd, args.file));
        const outputPath =
            args.output != null ? AbsoluteFilePath.of(path.resolve(context.cwd, args.output)) : openapiPath;

        const [spec, overrides] = await Promise.all([loadSpec(openapiPath), loadSpec(overridesPath)]);

        const logger = {
            warn: (msg: string) => context.stderr.warn(msg)
        };

        const enriched = mergeExamplesIntoSpec(spec, overrides, logger);

        if (args.split === true) {
            if (args.output == null) {
                throw new CliError({
                    message: "--split requires --output (-o) to specify where to write the extracted examples.",
                    code: CliError.Code.ConfigError
                });
            }
            const examples = extractEnrichedExamples(spec, enriched);
            await writeFile(outputPath, serializeSpec(examples, outputPath));
            context.stderr.info(
                `${Icons.success} Extracted enriched examples ${chalk.dim("→")} ${chalk.cyan(outputPath)}`
            );
        } else {
            await writeFile(outputPath, serializeSpec(enriched, outputPath));
            if (outputPath === openapiPath) {
                context.stderr.info(`${Icons.success} Enriched ${chalk.cyan(openapiPath)} in-place`);
            } else {
                context.stderr.info(`${Icons.success} Enriched output ${chalk.dim("→")} ${chalk.cyan(outputPath)}`);
            }
        }
    }
}

export function addEnrichCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new EnrichCommand();
    command(
        cli,
        "enrich <openapi>",
        "Enrich an OpenAPI spec with AI-generated examples from an overrides file",
        (context, args) => cmd.handle(context, args as EnrichCommand.Args),
        (yargs) =>
            yargs
                .positional("openapi", {
                    type: "string",
                    description: "Path to the OpenAPI spec",
                    demandOption: true
                })
                .option("file", {
                    type: "string",
                    alias: "f",
                    description: "Path to the overrides file containing x-fern-examples",
                    demandOption: true
                })
                .option("output", {
                    type: "string",
                    alias: "o",
                    description: "Path to write the output file (defaults to in-place update)"
                })
                .option("split", {
                    type: "boolean",
                    default: false,
                    description: "Extract only the enriched examples instead of the full spec"
                })
    );
}
