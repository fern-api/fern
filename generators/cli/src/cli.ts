import {
    ExitStatusUpdate,
    GeneratorNotificationService,
    GeneratorUpdate,
    parseGeneratorConfig,
    parseIR
} from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { CLI_TEMPLATE } from "./templates/cli-template.js";

const pathToConfig = process.argv[process.argv.length - 1];
if (pathToConfig == null) {
    throw new Error("No argument for config filepath.");
}

void generate(pathToConfig);

async function generate(configPath: string): Promise<void> {
    try {
        const config = await parseGeneratorConfig(configPath);
        const generatorLoggingClient = new GeneratorNotificationService(config.environment);

        try {
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.init({
                    packagesToPublish: []
                })
            );

            const ir = await parseIR<FernIr.IntermediateRepresentation>({
                absolutePathToIR: AbsoluteFilePath.of(config.irFilepath),
                parse: IrSerialization.IntermediateRepresentation.parse
            });

            const outputDir = config.output.path;
            await mkdir(outputDir, { recursive: true });

            const apiName = typeof ir.apiName === "string" ? ir.apiName : ir.apiName.originalName;
            const rendered = CLI_TEMPLATE.replaceAll("{{apiName}}", apiName);
            await writeFile(path.join(outputDir, "cli.ts"), rendered);

            await generatorLoggingClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful({})));
        } catch (e) {
            // biome-ignore lint/suspicious/noConsole: generator CLI output
            console.error("Generation failed:", e instanceof Error ? e.message : e);
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.exitStatusUpdate(
                    ExitStatusUpdate.error({
                        message: e instanceof Error ? e.message : "Encountered error"
                    })
                )
            );
        }
    } catch (e) {
        // biome-ignore lint/suspicious/noConsole: generator CLI output
        console.error("Encountered error", e);
        throw e;
    }
}
