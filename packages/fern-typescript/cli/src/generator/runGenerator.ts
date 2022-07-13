import { ExitStatusUpdate, GeneratorUpdate, PackageCoordinate } from "@fern-fern/generator-logging-api-client/model";
import { readFile } from "fs/promises";
import { Command } from "../commands/Command";
import { COMMANDS } from "../commands/commands";
import { getCommandPackageCoordinate } from "../commands/getCommandPackageCoordinate";
import { runCommand } from "../commands/runCommand";
import { GeneratorLoggingWrapper } from "../utils/generatorLoggingWrapper";
import { FernTypescriptGeneratorConfig } from "./FernGeneratorConfig";

export async function runGenerator(pathToConfig: string): Promise<void> {
    const configStr = await readFile(pathToConfig);
    const config = JSON.parse(configStr.toString()) as FernTypescriptGeneratorConfig;
    const commands = getCommands(config);
    const generatorLoggingWrapper = new GeneratorLoggingWrapper(config);

    const npmPackages = commands.map((command) => {
        return getCommandPackageCoordinate({ command, config });
    });
    await generatorLoggingWrapper.sendUpdate(
        GeneratorUpdate.init({
            packagesToPublish: npmPackages
                .map((npmPackage) => npmPackage.packageCoordinate)
                .filter((val): val is PackageCoordinate => {
                    return val !== undefined;
                }),
        })
    );
    await Promise.all(
        commands.map(async (command, idx) => {
            const npmPackage = npmPackages[idx];
            if (npmPackage == null) {
                throw new Error("Failed to find npmPackage for command");
            }
            return runCommand({ command, config, npmPackage, generatorLoggingWrapper });
        })
    )
        .then(async () => {
            await generatorLoggingWrapper.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful()));
        })
        .catch(async (e) => {
            await generatorLoggingWrapper.sendUpdate(
                GeneratorUpdate.exitStatusUpdate(
                    ExitStatusUpdate.error({
                        message: e instanceof Error ? e.message : "Encountered error",
                    })
                )
            );
        });
}

function getCommands(config: FernTypescriptGeneratorConfig): Command<string>[] {
    switch (config.customConfig.mode) {
        case "client":
            return [COMMANDS.client];
        case "server":
            return [COMMANDS.server];
        case "model":
            return [COMMANDS.model];
        case "client_and_server":
            return [COMMANDS.client, COMMANDS.server];
    }
}
