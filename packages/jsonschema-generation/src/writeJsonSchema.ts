import { FernConfigurationSchema } from "@fern-api/yaml-schema";
import { lstat, rm, writeFile } from "fs/promises";
import path from "path";
import zodToJsonSchema from "zod-to-json-schema";

export const ABSOLUTE_PATH_TO_WORKSPACE_JSON_SCHEMA = path.join(__dirname, "../../../workspace-schema.json");
export const FERN_JSON_SCHEMA = zodToJsonSchema(FernConfigurationSchema, "FernWorkspaceSchema");

async function writeJsonSchema() {
    const schemaFileExists = await doesPathExist(ABSOLUTE_PATH_TO_WORKSPACE_JSON_SCHEMA);
    if (schemaFileExists) {
        await rm(ABSOLUTE_PATH_TO_WORKSPACE_JSON_SCHEMA);
    }
    await writeFile(ABSOLUTE_PATH_TO_WORKSPACE_JSON_SCHEMA, JSON.stringify(FERN_JSON_SCHEMA, undefined, 4));
}

async function doesPathExist(filepath: string): Promise<boolean> {
    try {
        await lstat(filepath);
        return true;
    } catch {
        return false;
    }
}

void writeJsonSchema();
