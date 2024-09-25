import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import merge from "lodash-es/merge";
import path from "path";
import { convertToOpenApi } from "./convertToOpenApi";
import { getCustomConfig } from "./customConfig";
import {
    GeneratorNotificationService,
    GeneratorExecParsing,
    GeneratorUpdate,
    ExitStatusUpdate,
    parseGeneratorConfig,
    parseIR
} from "@fern-api/generator-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mergeWithOverrides } from "@fern-api/core-utils";

export type Mode = "stoplight" | "openapi";

export async function writeOpenApi(mode: Mode, pathToConfig: string): Promise<void> {
    try {
        const config = await parseGeneratorConfig(pathToConfig);

        const customConfig = getCustomConfig(config);

        const generatorLoggingClient = new GeneratorNotificationService(config.environment);

        try {
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.init({
                    packagesToPublish: []
                })
            );

            const ir = await loadIntermediateRepresentation(config.irFilepath);

            let openapi = convertToOpenApi({
                apiName: config.workspaceName,
                ir,
                mode
            });

            if (customConfig.customOverrides != null) {
                openapi = await mergeWithOverrides({
                    data: openapi,
                    overrides: customConfig.customOverrides
                });
            }

            if (customConfig.format === "json") {
                await writeFile(
                    path.join(config.output.path, replaceExtension(customConfig.filename, "json")),
                    JSON.stringify(openapi, undefined, 2)
                );
            } else {
                const filename =
                    customConfig.filename.endsWith("yml") || customConfig.filename.endsWith("yaml")
                        ? customConfig.filename
                        : replaceExtension(customConfig.filename, "yml");
                await writeFile(path.join(config.output.path, filename), yaml.dump(openapi));
            }
            await generatorLoggingClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful({})));
        } catch (e) {
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
    return await parseIR<IntermediateRepresentation>({
        absolutePathToIR: AbsoluteFilePath.of(pathToFile),
        parse: IrSerialization.IntermediateRepresentation.parse
    });
}

function replaceExtension(filename: string, newExtension: string): string {
    const baseName = filename.substring(0, filename.lastIndexOf("."));
    return `${baseName}.${newExtension}`;
}
