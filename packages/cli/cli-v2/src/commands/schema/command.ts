import { getFernYmlJsonSchema, getJsonSchemaByName, getJsonSchemaNames } from "@fern-api/config";
import { dirname, doesPathExist, resolve } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import { mkdir, writeFile } from "fs/promises";

import type { Argv } from "yargs";
import type { Context } from "../../context/Context.js";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { command } from "../_internal/command.js";

export declare namespace SchemaCommand {
    export interface Args extends GlobalArgs {
        /**
         * Dot-delimited path inside fern.yml (e.g. `api`, `sdks.targets`).
         * When omitted, the full fern.yml schema is printed.
         */
        name?: string;
        /** Pretty-print JSON output. Defaults to true. */
        pretty: boolean;
        /** Write JSON Schema to this path instead of stdout. */
        output?: string;
    }
}

/**
 * Emits a JSON Schema describing the Fern `fern.yml` config (or a subsection).
 *
 * Intended primarily for AI agents: rather than relying on stale prose
 * documentation, agents can introspect the exact shape of `fern.yml` at
 * runtime. With no name, prints the full schema. With a dot-delimited name
 * (e.g. `api`, `sdks.targets`), prints just that subsection.
 *
 * Output is pure JSON on stdout so it is pipe-safe (e.g.
 * `fern schema | jq .properties.sdks`). Use `--output` to write a file
 * (e.g. for CI: `fern schema --output fern-yml.schema.json`).
 */
export class SchemaCommand {
    public async handle(context: Context, args: SchemaCommand.Args): Promise<void> {
        const schema = this.resolveSchema(args.name);

        if (args.output != null) {
            await this.writeToFile(context, schema, args.pretty, args.output);
            return;
        }

        this.writeToStdout(context, schema, args.pretty);
    }

    private resolveSchema(name: string | undefined): Record<string, unknown> {
        if (name == null) {
            return getFernYmlJsonSchema();
        }

        const schema = getJsonSchemaByName(name);
        if (schema == null) {
            const available = getJsonSchemaNames().join(", ");
            throw new CliError({
                message: `Unknown schema '${name}'. Available subsections: ${available}.`,
                code: CliError.Code.ConfigError
            });
        }

        return schema;
    }

    private formatJson(value: unknown, pretty: boolean): string {
        const json = pretty ? JSON.stringify(value, null, 2) : JSON.stringify(value);
        return `${json}\n`;
    }

    private writeToStdout(context: Context, value: unknown, pretty: boolean): void {
        context.stdout.info(this.formatJson(value, pretty).trimEnd());
    }

    private async writeToFile(context: Context, value: unknown, pretty: boolean, outputPath: string): Promise<void> {
        const absoluteOutputPath = resolve(context.cwd, outputPath);
        const outputDir = dirname(absoluteOutputPath);

        if (!(await doesPathExist(outputDir))) {
            await mkdir(outputDir, { recursive: true });
        }

        await writeFile(absoluteOutputPath, this.formatJson(value, pretty));
        context.stderr.info(chalk.green(`Wrote JSON Schema to ${absoluteOutputPath}`));
    }
}

export function addSchemaCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new SchemaCommand();
    command(
        cli,
        "schema [name]",
        "Print a JSON Schema for fern.yml (or a dot-delimited subsection like `sdks` or `sdks.targets`)",
        (context, args) => cmd.handle(context, args as SchemaCommand.Args),
        (yargs) =>
            yargs
                .positional("name", {
                    type: "string",
                    description:
                        "Dot-delimited subsection of fern.yml. Omit to print the full schema. " +
                        `Available subsections: ${getJsonSchemaNames().join(", ")}.`
                })
                .option("output", {
                    type: "string",
                    description: "Write JSON Schema to this file instead of stdout"
                })
                .option("pretty", {
                    type: "boolean",
                    default: true,
                    description: "Pretty-print the JSON output"
                })
    );
}
