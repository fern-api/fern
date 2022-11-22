import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import * as GeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";
import { FernTypescriptGeneratorConfig, FernTypescriptGeneratorCustomConfigSchema } from "@fern-typescript/commons";
import { readFile } from "fs/promises";
import { Command } from "../commands/Command";
import { createClientCommand } from "../commands/impls/clientCommand";
import { createModelCommand } from "../commands/impls/modelCommand";
import { createServerCommand } from "../commands/impls/serverCommand";
import { runCommand } from "../commands/runCommand";
import { GeneratorNotificationService } from "../utils/GeneratorNotificationService";

export async function runGenerator(pathToConfig: string): Promise<void> {
    const configStr = await readFile(pathToConfig);
    const rawConfig = JSON.parse(configStr.toString());
    const config = GeneratorExecParsing.GeneratorConfig.parse(rawConfig) as FernTypescriptGeneratorConfig;

    // validate custom config
    FernTypescriptGeneratorCustomConfigSchema.parse(config.customConfig);

    const commands = getCommands(config);
    const generatorNotificationService = new GeneratorNotificationService(config);

    await generatorNotificationService.sendUpdate(
        FernGeneratorExec.GeneratorUpdate.init({
            packagesToPublish: commands.reduce<FernGeneratorExec.PackageCoordinate[]>((all, command) => {
                if (command.npmPackage.publishInfo != null) {
                    all.push(command.npmPackage.publishInfo.packageCoordinate);
                }
                return all;
            }, []),
        })
    );

    try {
        await Promise.all(commands.map((command) => runCommand({ command, config, generatorNotificationService })));
        await generatorNotificationService.sendUpdate(
            FernGeneratorExec.GeneratorUpdate.exitStatusUpdate(FernGeneratorExec.ExitStatusUpdate.successful())
        );
    } catch (e) {
        await generatorNotificationService.sendUpdate(
            FernGeneratorExec.GeneratorUpdate.exitStatusUpdate(
                FernGeneratorExec.ExitStatusUpdate.error({
                    message: e instanceof Error ? e.message : "Encountered error",
                })
            )
        );
        throw e;
    }
}

function getCommands(generatorConfig: FernTypescriptGeneratorConfig): Command<string>[] {
    switch (generatorConfig.customConfig.mode) {
        case "client":
            return [createClientCommand(generatorConfig)];
        case "server":
            return [createServerCommand(generatorConfig)];
        case "model":
            return [createModelCommand(generatorConfig)];
        case "client_and_server":
            return [createClientCommand(generatorConfig), createServerCommand(generatorConfig)];
    }
}
