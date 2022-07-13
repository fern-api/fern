import { GeneratorUpdate, PackageCoordinate } from "@fern-fern/generator-logging-api-client/model";
import { readFile } from "fs/promises";
import { Command } from "../commands/Command";
import { COMMANDS } from "../commands/commands";
import { getCommandPackageCoordinate, isPublishNpmPackage } from "../commands/getCommandPackageCoordinate";
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
    const publishPackageCoordinates = npmPackages
        .filter(isPublishNpmPackage)
        .map((publishNpmPackage) =>
            PackageCoordinate.npm({ name: publishNpmPackage.name, version: publishNpmPackage.publishVersion })
        );
    await generatorLoggingWrapper.sendUpdate(
        GeneratorUpdate.init({
            packagesToPublish: publishPackageCoordinates,
        })
    );
    await Promise.all(commands.map(async (command) => runCommand({ command, config })));
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
