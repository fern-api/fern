import { validateSchema } from "@fern-api/config-management-commons";
import { ExitStatusUpdate, GeneratorUpdate, PackageCoordinate } from "@fern-fern/generator-logging-api-client/model";
import {
    FernTypescriptGeneratorConfig,
    FernTypescriptGeneratorCustomConfig,
    FernTypescriptGeneratorCustomConfigSchema,
} from "@fern-typescript/commons";
import { readFile } from "fs/promises";
import { Command } from "../commands/Command";
import { createClientCommand } from "../commands/impls/clientCommand";
import { createClientV2Command } from "../commands/impls/clientCommandV2";
import { createModelCommand } from "../commands/impls/modelCommand";
import { createServerCommand } from "../commands/impls/serverCommand";
import { runCommand } from "../commands/runCommand";
import { GeneratorNotificationService } from "../utils/GeneratorNotificationService";

export async function runGenerator(pathToConfig: string): Promise<void> {
    const configStr = await readFile(pathToConfig);
    const config = JSON.parse(configStr.toString()) as FernTypescriptGeneratorConfig;
    await validateSchema<FernTypescriptGeneratorCustomConfig>(
        FernTypescriptGeneratorCustomConfigSchema,
        config.customConfig
    );

    const commands = getCommands(config);
    const generatorNotificationService = new GeneratorNotificationService(config);

    await generatorNotificationService.sendUpdate(
        GeneratorUpdate.init({
            packagesToPublish: commands.reduce<PackageCoordinate[]>((all, command) => {
                if (command.npmPackage.publishInfo != null) {
                    all.push(command.npmPackage.publishInfo.packageCoordinate);
                }
                return all;
            }, []),
        })
    );

    try {
        await Promise.all(commands.map((command) => runCommand({ command, config, generatorNotificationService })));
        await generatorNotificationService.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful()));
    } catch (e) {
        console.error("Failed to generate", e);
        await generatorNotificationService.sendUpdate(
            GeneratorUpdate.exitStatusUpdate(
                ExitStatusUpdate.error({
                    message: e instanceof Error ? e.message : "Encountered error",
                })
            )
        );
    }
}

function getCommands(generatorConfig: FernTypescriptGeneratorConfig): Command<string>[] {
    switch (generatorConfig.customConfig.mode) {
        case "client":
            return [createClientCommand(generatorConfig)];
        case "client-v2":
            return [createClientV2Command(generatorConfig)];
        case "server":
            return [createServerCommand(generatorConfig)];
        case "model":
            return [createModelCommand(generatorConfig)];
        case "client_and_server":
            return [createClientCommand(generatorConfig), createServerCommand(generatorConfig)];
    }
}
