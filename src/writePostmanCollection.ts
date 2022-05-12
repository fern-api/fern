import { IntermediateRepresentation } from "@fern-api/api";
import { readFile, writeFile } from "fs/promises";
import { convertToPostmanCollection } from "./convertToPostmanCollection";
import { FernPluginConfigSchema } from "./pluginConfigSchema";
import path from "path";
import { Collection } from "postman-collection";

const COLLECTION_OUTPUT_FILENAME = "collection.json";

export async function writePostmanCollection(pathToConfig: string): Promise<void> {
    const configStr = await readFile(pathToConfig);
    const configParsed = JSON.parse(configStr.toString()) as unknown;
    const config = await FernPluginConfigSchema.parseAsync(configParsed);

    if (config.output == null) {
        throw new Error("Output directory is not specified.");
    }

    const ir = await loadIntermediateRepresentation(config.irFilepath);
    const collectionDefinition = convertToPostmanCollection(ir);
    await writeFile(
        path.join(config.output.path, COLLECTION_OUTPUT_FILENAME),
        JSON.stringify(new Collection(collectionDefinition), undefined, 4)
    );
}

async function loadIntermediateRepresentation(pathToFile: string): Promise<IntermediateRepresentation> {
    return JSON.parse((await readFile(pathToFile)).toString());
}
