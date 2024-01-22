import { GeneratorConfig } from "@fern-fern/generator-exec-client/model/config";
import { ExitStatusUpdate, GeneratorUpdate } from "@fern-fern/generator-exec-client/model/logging";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { readFile, writeFile } from "fs/promises";
import merge from "lodash-es/merge";
import yaml from "js-yaml";
import path from "path";
import { convertToOpenApi } from "./convertToOpenApi";
import { getCustomConfig } from "./customConfig";
import { GeneratorLoggingWrapper } from "./generatorLoggingWrapper";

const OPENAPI_JSON_FILENAME = "openapi.json";
const OPENAPI_YML_FILENAME = "openapi.yml";

export type Mode = "stoplight" | "openapi";

export async function writeOpenApi(mode: Mode, pathToConfig: string): Promise<void> {
    try {
        const configStr = await readFile(pathToConfig);
        const config = JSON.parse(configStr.toString()) as GeneratorConfig;
        const customConfig = getCustomConfig(config);

        const generatorLoggingClient = new GeneratorLoggingWrapper(config);

        try {
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.init({
                    packagesToPublish: [],
                }),
            );

            const ir = await loadIntermediateRepresentation(config.irFilepath);
            const openApiDefinition = convertToOpenApi({
                apiName: config.workspaceName,
                ir,
                mode,
            });

            const openApiDefinitionWithCustomOverrides = merge(customConfig.customOverrides, openApiDefinition);

            if (customConfig.format === "json") {
                await writeFile(
                    path.join(config.output.path, OPENAPI_JSON_FILENAME),
                    JSON.stringify(openApiDefinitionWithCustomOverrides, undefined, 2),
                );
            } else {
                await writeFile(
                    path.join(config.output.path, OPENAPI_YML_FILENAME),
                    yaml.dump(openApiDefinitionWithCustomOverrides),
                );
            }
            await generatorLoggingClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful()));
        } catch (e) {
            console.log("Encountered error", e);
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.exitStatusUpdate(
                    ExitStatusUpdate.error({
                        message: e instanceof Error ? e.message : "Encountered error",
                    }),
                ),
            );
        }
    } catch (e) {
        console.log("Encountered error", e);
        throw e;
    }
}

async function loadIntermediateRepresentation(pathToFile: string): Promise<IntermediateRepresentation> {
    const irString = (await readFile(pathToFile)).toString();
    const irJson = JSON.parse(irString);
    return IrSerialization.IntermediateRepresentation.parseOrThrow(irJson);
}
