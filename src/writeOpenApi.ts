import { ExitStatusUpdate, GeneratorUpdate } from "@fern-fern/generator-logging-api-client/model";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { GeneratorConfig } from "@fern-fern/ir-model/generators";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { convertToOpenApi } from "./convertToOpenApi";
import { GeneratorLoggingWrapper } from "./generatorLoggingWrapper";

const OPENAPI_JSON_FILENAME = "openapi.json";

export async function writeOpenApi(pathToConfig: string): Promise<void> {
    const configStr = await readFile(pathToConfig);
    const config = JSON.parse(configStr.toString()) as GeneratorConfig;

    if (config.output == null) {
        throw new Error("Output directory is not specified.");
    }

    const generatorLoggingClient = new GeneratorLoggingWrapper(config);

    try {
        await generatorLoggingClient.sendUpdate(
            GeneratorUpdate.init({
                packagesToPublish: [],
            })
        );

        const ir = await loadIntermediateRepresentation(config.irFilepath);
        const openApiDefinition = convertToOpenApi(config.workspaceName, config.publish?.version ?? "", ir);
        await writeFile(
            path.join(config.output.path, OPENAPI_JSON_FILENAME),
            JSON.stringify(openApiDefinition, undefined, 4)
        );
        await generatorLoggingClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful()));
    } catch (e) {
        await generatorLoggingClient.sendUpdate(
            GeneratorUpdate.exitStatusUpdate(
                ExitStatusUpdate.error({
                    message: e instanceof Error ? e.message : "Encountered error",
                })
            )
        );
    }
}

async function loadIntermediateRepresentation(pathToFile: string): Promise<IntermediateRepresentation> {
    return JSON.parse((await readFile(pathToFile)).toString());
}
