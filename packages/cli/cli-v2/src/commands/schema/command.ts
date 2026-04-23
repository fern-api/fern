import { getJsonSchemaByName, getJsonSchemaNames, JSON_SCHEMA_ENTRIES } from "@fern-api/config";
import { CliError } from "@fern-api/task-context";

import type { Argv } from "yargs";
import type { Context } from "../../context/Context.js";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { command } from "../_internal/command.js";

export declare namespace SchemaCommand {
    export interface Args extends GlobalArgs {
        /** Name of the schema to print. When omitted, lists all schemas. */
        name?: string;
        /** Pretty-print JSON output. Defaults to true. */
        pretty: boolean;
    }
}

/**
 * Emits JSON Schemas describing Fern configuration surfaces.
 *
 * This exists primarily for AI agents: rather than relying on stale prose
 * documentation, agents can introspect the exact shape of `fern.yml`, `sdks:`,
 * `api:`, and related blocks at runtime.
 *
 * All output goes to stdout as pure JSON so it is pipe-safe (e.g. `fern schema
 * fern-yml | jq .properties.sdks`). Human-readable messages go to stderr only
 * on error.
 */
export class SchemaCommand {
    public async handle(context: Context, args: SchemaCommand.Args): Promise<void> {
        if (args.name == null || args.name === "list") {
            this.writeJson(context, { schemas: [...JSON_SCHEMA_ENTRIES] }, args.pretty);
            return;
        }

        const schema = getJsonSchemaByName(args.name);
        if (schema == null) {
            const available = getJsonSchemaNames().join(", ");
            throw new CliError({
                message: `Unknown schema '${args.name}'. Available schemas: ${available}.`,
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
        "Print a JSON Schema for a Fern config surface (e.g. fern.yml, sdks, api)",
        (context, args) => cmd.handle(context, args as SchemaCommand.Args),
        (yargs) =>
            yargs
                .positional("name", {
                    type: "string",
                    description:
                        "Name of the schema to print. Omit (or use 'list') to list all available schemas. " +
                        `Available: ${getJsonSchemaNames().join(", ")}.`
                })
                .option("pretty", {
                    type: "boolean",
                    default: true,
                    description: "Pretty-print the JSON output"
                })
    );
}
