import { ExitStatusUpdate, GeneratorConfig, GeneratorUpdate } from "@fern-fern/generator-exec-sdk/api";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import merge from "lodash-es/merge";
import path from "path";
import { convertToOpenApi } from "./convertToOpenApi";
import { getCustomConfig } from "./customConfig";
import { GeneratorLoggingWrapper } from "./generatorLoggingWrapper";

const OPENAPI_JSON_FILENAME = "openapi.json";
const OPENAPI_YML_FILENAME = "openapi.yml";

export type Mode = "stoplight" | "openapi";

export async function writeOpenApi(mode: Mode, pathToConfig: string): Promise<void> {
    try {
        console.log("beginning writeOpenApi");
        const configStr = await readFile(pathToConfig);
        const config = JSON.parse(configStr.toString()) as GeneratorConfig;
        const customConfig = getCustomConfig(config);

        console.log("customConfig", customConfig);
        const generatorLoggingClient = new GeneratorLoggingWrapper(config);

        try {
            console.log("sending update");
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.init({
                    packagesToPublish: []
                })
            );

            console.log("loading ir");
            const ir = await loadIntermediateRepresentation(config.irFilepath);
            console.log("parsed ir", ir);
            const openApiDefinition = convertToOpenApi({
                apiName: config.workspaceName,
                ir,
                mode
            });
            console.log("openApiDefinition", openApiDefinition);

            const openApiDefinitionWithCustomOverrides = merge(customConfig.customOverrides, openApiDefinition);
            console.log("openApiDefinitionWithCustomOverrides", openApiDefinitionWithCustomOverrides);

            if (customConfig.format === "json") {
                console.log("writing json");
                await writeFile(
                    path.join(config.output.path, OPENAPI_JSON_FILENAME),
                    JSON.stringify(openApiDefinitionWithCustomOverrides, undefined, 2)
                );
                console.log("wrote json");
            } else {
                console.log("writing yml");
                await writeFile(
                    path.join(config.output.path, OPENAPI_YML_FILENAME),
                    yaml.dump(openApiDefinitionWithCustomOverrides)
                );
                console.log("wrote yml");
            }
            console.log("sending exit status update");
            await generatorLoggingClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful({})));
            console.log("sent exit status update");
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log("Encountered error", e);
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.exitStatusUpdate(
                    ExitStatusUpdate.error({
                        message: e instanceof Error ? e.message : "Encountered error"
                    })
                )
            );
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log("Encountered error", e);
        throw e;
    }
}

async function loadIntermediateRepresentation(pathToFile: string): Promise<IntermediateRepresentation> {
    const irString = (await readFile(pathToFile)).toString();
    console.log("irString", irString);
    const irJson = JSON.parse(irString);
    console.log("irJson", irJson);
    console.log("parsing ir");
    return IrSerialization.IntermediateRepresentation.parseOrThrow(irJson);
}
