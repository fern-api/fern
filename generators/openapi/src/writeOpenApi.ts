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
        // eslint-disable-next-line no-console
        console.log("beginning writeOpenApi");
        const configStr = await readFile(pathToConfig);
        const config = JSON.parse(configStr.toString()) as GeneratorConfig;
        const customConfig = getCustomConfig(config);

        // eslint-disable-next-line no-console
        console.log("customConfig", JSON.stringify(customConfig));
        const generatorLoggingClient = new GeneratorLoggingWrapper(config);

        try {
            // eslint-disable-next-line no-console
            console.log("sending update");
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.init({
                    packagesToPublish: []
                })
            );

            // eslint-disable-next-line no-console
            console.log("loading ir");
            const ir = await loadIntermediateRepresentation(config.irFilepath);
            // eslint-disable-next-line no-console
            console.log("parsed ir", JSON.stringify(ir));
            const openApiDefinition = convertToOpenApi({
                apiName: config.workspaceName,
                ir,
                mode
            });
            // eslint-disable-next-line no-console
            console.log("openApiDefinition", JSON.stringify(openApiDefinition));

            const openApiDefinitionWithCustomOverrides = merge(customConfig.customOverrides, openApiDefinition);
            // eslint-disable-next-line no-console
            console.log("openApiDefinitionWithCustomOverrides", JSON.stringify(openApiDefinitionWithCustomOverrides));

            if (customConfig.format === "json") {
                // eslint-disable-next-line no-console
                console.log("writing json");
                await writeFile(
                    path.join(config.output.path, OPENAPI_JSON_FILENAME),
                    JSON.stringify(openApiDefinitionWithCustomOverrides, undefined, 2)
                );
                // eslint-disable-next-line no-console
                console.log("wrote json");
            } else {
                // eslint-disable-next-line no-console
                console.log("writing yml");
                await writeFile(
                    path.join(config.output.path, OPENAPI_YML_FILENAME),
                    yaml.dump(openApiDefinitionWithCustomOverrides)
                );
                // eslint-disable-next-line no-console
                console.log("wrote yml");
            }
            // eslint-disable-next-line no-console
            console.log("sending exit status update");
            await generatorLoggingClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful({})));
            // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.log("irString", JSON.stringify(irString));
    const irJson = JSON.parse(irString);
    // eslint-disable-next-line no-console
    console.log("irJson", JSON.stringify(irJson));
    // eslint-disable-next-line no-console
    console.log("parsing ir");
    return IrSerialization.IntermediateRepresentation.parseOrThrow(irJson);
}
