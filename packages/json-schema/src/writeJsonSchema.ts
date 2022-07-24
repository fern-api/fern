import { FernConfigurationSchema } from "@fern-api/yaml-schema";
import execa from "execa";
import { rm, writeFile } from "fs/promises";
import path from "path";
import zodToJsonSchema from "zod-to-json-schema";

const FERN_JSON_SCHEMA_FILENAME = "fern.schema.json";

export async function writeJsonSchema(): Promise<void> {
    const pathToJsonSchema = await getAbsolutePathToFernJsonSchema();
    await rm(pathToJsonSchema, { force: true });
    await writeFile(pathToJsonSchema, JSON.stringify(getFernJsonSchema(), undefined, 2));
}

export function getFernJsonSchema(): ReturnType<typeof zodToJsonSchema> {
    return zodToJsonSchema(FernConfigurationSchema, "Fern API Definition");
}

export async function getAbsolutePathToFernJsonSchema(): Promise<string> {
    const { stdout: packageDirectory } = await execa("yarn", ["workspace", "@fern-api/json-schema", "exec", "pwd"]);
    return path.join(packageDirectory, "../..", FERN_JSON_SCHEMA_FILENAME);
}
