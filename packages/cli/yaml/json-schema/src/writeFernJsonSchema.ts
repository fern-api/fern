import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema } from "@fern-api/yaml-schema";
import { writeFile } from "fs/promises";
import prettier from "prettier";
import zodToJsonSchema from "zod-to-json-schema";

export async function writeFernJsonSchema(filepath: AbsoluteFilePath): Promise<void> {
    const jsonSchema = zodToJsonSchema(DefinitionFileSchema, "Fern Definition");
    const jsonSchemaStr = JSON.stringify(jsonSchema);
    const jsonSchemaFormatted = prettier.format(jsonSchemaStr, {
        ...(await prettier.resolveConfig(filepath)),
        filepath
    });
    await writeFile(filepath, jsonSchemaFormatted);
}
