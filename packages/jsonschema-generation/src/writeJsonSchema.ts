import { FernConfigurationSchema } from "@fern-api/yaml-schema";
import { rm, writeFile } from "fs/promises";
import path from "path";
import zodToJsonSchema from "zod-to-json-schema";

export const FERN_JSON_SCHEMA_FILENAME = "fern.schema.json";
export const FERN_JSON_SCHEMA = zodToJsonSchema(FernConfigurationSchema, "Fern API Definition");

export const ABSOLUTE_PATH_TO_WORKSPACE_JSON_SCHEMA = path.join(__dirname, `../../../../${FERN_JSON_SCHEMA_FILENAME}`);

export async function writeJsonSchema(): Promise<void> {
    await rm(ABSOLUTE_PATH_TO_WORKSPACE_JSON_SCHEMA, { force: true });
    await writeFile(ABSOLUTE_PATH_TO_WORKSPACE_JSON_SCHEMA, JSON.stringify(FERN_JSON_SCHEMA, undefined, 2));
}
