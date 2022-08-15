import { generateClientProject } from "@fern-typescript/client";
import { FernTypescriptGeneratorConfig } from "@fern-typescript/commons";
import { Command, CommandKey } from "../Command";
import { constructNpmPackage } from "../constructNpmPackageForCommand";

const COMMAND_KEY = CommandKey.Client;

export function createClientCommand(generatorConfig: FernTypescriptGeneratorConfig): Command<typeof COMMAND_KEY> {
    const npmPackage = constructNpmPackage({ commandKey: COMMAND_KEY, generatorConfig });
    return {
        key: COMMAND_KEY,
        npmPackage,
        generate: async ({ intermediateRepresentation, volume }) => {
            await generateClientProject({
                intermediateRepresentation,
                packageName: npmPackage.packageName,
                packageVersion: npmPackage.publishInfo?.packageCoordinate.version,
                volume,
            });
        },
    };
}
