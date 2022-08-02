import { FernTypescriptGeneratorConfig } from "@fern-typescript/commons";
import { FernTypescriptClientGenerator } from "../../v2/client/FernTypescriptClientGenerator";
import { Command, CommandKey } from "../Command";
import { constructNpmPackage } from "../constructNpmPackageForCommand";

const COMMAND_KEY = CommandKey.Client;

export function createClientCommand(generatorConfig: FernTypescriptGeneratorConfig): Command<typeof COMMAND_KEY> {
    const npmPackage = constructNpmPackage({ commandKey: COMMAND_KEY, generatorConfig });
    return {
        key: COMMAND_KEY,
        npmPackage,
        generate: async ({ intermediateRepresentation, volume, logger, apiName }) => {
            await new FernTypescriptClientGenerator({
                apiName,
                intermediateRepresentation,
                logger,
                volume,
                packageName: npmPackage.packageName,
                packageVersion: npmPackage.publishInfo?.packageCoordinate.version,
            }).generate();
        },
    };
}
