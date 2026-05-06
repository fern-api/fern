import { z } from "zod";
import { AiConfigSchema } from "./schemas/AiConfigSchema.js";
import { ApiDefinitionSchema } from "./schemas/ApiDefinitionSchema.js";
import { ApisSchema } from "./schemas/ApisSchema.js";
import { CliSchema } from "./schemas/CliSchema.js";
import { DocsSchema } from "./schemas/docs/DocsSchema.js";
import { FernYmlSchema } from "./schemas/FernYmlSchema.js";
import { SdksSchema } from "./schemas/SdksSchema.js";
import { SdkTargetSchema } from "./schemas/SdkTargetSchema.js";

/**
 * Name of a named JSON Schema exported by this package.
 *
 * Names mirror the dot-delimited path inside `fern.yml`. The root (the full
 * fern.yml schema) is reachable by passing no name to `fern schema`.
 */
export type JsonSchemaName = "api" | "apis" | "sdks" | "sdks.targets" | "docs" | "ai" | "cli";

type SchemaEntry = {
    name: JsonSchemaName;
    description: string;
    // biome-ignore lint/suspicious/noExplicitAny: zod schemas have heterogeneous shapes; we only convert them to JSON Schema.
    schema: z.ZodType<any>;
};

const SCHEMA_ENTRIES: readonly SchemaEntry[] = [
    {
        name: "api",
        description: "A single API definition (the `api:` block in fern.yml).",
        schema: ApiDefinitionSchema
    },
    {
        name: "apis",
        description: "A map of named API definitions (the `apis:` block in fern.yml).",
        schema: ApisSchema
    },
    {
        name: "sdks",
        description: "The `sdks:` block in fern.yml, including defaultGroup, targets, and readme.",
        schema: SdksSchema
    },
    {
        name: "sdks.targets",
        description: "A single SDK target (a value inside `sdks.targets`).",
        schema: SdkTargetSchema
    },
    {
        name: "docs",
        description: "The `docs:` block in fern.yml (documentation configuration).",
        schema: DocsSchema
    },
    {
        name: "ai",
        description: "The `ai:` block in fern.yml (AI-powered example generation config).",
        schema: AiConfigSchema
    },
    {
        name: "cli",
        description: "The `cli:` block in fern.yml (CLI version pinning).",
        schema: CliSchema
    }
] as const;

/**
 * A short, machine-readable description of every named subsection schema.
 */
export const JSON_SCHEMA_ENTRIES: readonly { name: JsonSchemaName; description: string }[] = SCHEMA_ENTRIES.map(
    ({ name, description }) => ({ name, description })
);

/**
 * Convert a named Fern config subsection schema to a JSON Schema object.
 *
 * Returns `undefined` if `name` is not a recognized subsection.
 */
export function getJsonSchemaByName(name: string): Record<string, unknown> | undefined {
    const entry = SCHEMA_ENTRIES.find((e) => e.name === name);
    if (entry == null) {
        return undefined;
    }
    return z.toJSONSchema(entry.schema) as Record<string, unknown>;
}

/**
 * Returns the list of all recognized subsection names.
 */
export function getJsonSchemaNames(): readonly JsonSchemaName[] {
    return SCHEMA_ENTRIES.map((e) => e.name);
}

/**
 * Returns the full fern.yml JSON Schema (the root config).
 */
export function getFernYmlJsonSchema(): Record<string, unknown> {
    return z.toJSONSchema(FernYmlSchema) as Record<string, unknown>;
}
