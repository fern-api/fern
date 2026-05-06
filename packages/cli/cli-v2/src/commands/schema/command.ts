import { getFernYmlJsonSchema, getJsonSchemaByName, getJsonSchemaNames } from "@fern-api/config";
import { CliError } from "@fern-api/task-context";

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
 * `fern schema | jq .properties.sdks`).
 */
export class SchemaCommand {
    public async handle(context: Context, args: SchemaCommand.Args): Promise<void> {
        if (args.name == null) {
            this.writeJson(context, getFernYmlJsonSchema(), args.pretty);
            return;
        }

        const schema = getJsonSchemaByName(args.name);
        if (schema == null) {
            const available = getJsonSchemaNames().join(", ");
            throw new CliError({
                message: `Unknown schema '${args.name}'. Available subsections: ${available}.`,
                code: CliError.Code.ConfigError
            });
        }

        this.writeJson(context, schema, args.pretty);
    }

    private writeJson(context: Context, value: unknown, pretty: boolean): void {
        const json = pretty ? JSON.stringify(value, null, 2) : JSON.stringify(value);
        context.stdout.info(json);
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
                .option("pretty", {
                    type: "boolean",
                    default: true,
                    description: "Pretty-print the JSON output"
                })
    );
}
