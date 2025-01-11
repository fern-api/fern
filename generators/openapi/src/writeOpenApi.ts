import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

import {
    ExitStatusUpdate,
    GeneratorNotificationService,
    GeneratorUpdate,
    parseGeneratorConfig,
    parseIR
} from "@fern-api/base-generator";
import { mergeWithOverrides } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";

import { convertToOpenApi } from "./convertToOpenApi";
import { getCustomConfig } from "./customConfig";

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

            if (openapi == null) {
                throw new Error("Failed to convert IR to OpenAPI");
            }

            // eslint-disable-next-line no-console
            console.log(`openapi before override ${JSON.stringify(openapi)}`);

            if (customConfig.customOverrides != null) {
                openapi = mergeWithOverrides({
                    data: openapi,
                    overrides: customConfig.customOverrides
                });
                // eslint-disable-next-line no-console
                console.log(`openapi after override ${JSON.stringify(openapi)}`);
            }

            let filename: string = customConfig.filename ?? "openapi.yml";
            if (customConfig.format === "json") {
                filename = path.join(config.output.path, replaceExtension(filename, "json"));
                await writeFile(filename, JSON.stringify(openapi, undefined, 2));
            } else {
                filename =
                    filename.endsWith("yml") || filename.endsWith("yaml")
                        ? filename
                        : replaceExtension(filename, "yml");
                await writeFile(path.join(config.output.path, filename), yaml.dump(openapi));
            }
            await generatorLoggingClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful({})));
        } catch (e) {
            if (e instanceof Error) {
                // eslint-disable-next-line no-console
                console.log((e as Error)?.message);
                // eslint-disable-next-line no-console
                console.log((e as Error)?.stack);
            }
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
