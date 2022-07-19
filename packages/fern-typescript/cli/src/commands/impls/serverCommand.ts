import { FernTypescriptGeneratorConfig } from "@fern-typescript/commons";
import { generateServerProject } from "@fern-typescript/server";
import { Command, CommandKey } from "../Command";
import { constructNpmPackage } from "../constructNpmPackageForCommand";

const COMMAND_KEY = CommandKey.Server;

export function createServerCommand(generatorConfig: FernTypescriptGeneratorConfig): Command<typeof COMMAND_KEY> {
    const npmPackage = constructNpmPackage({ commandKey: COMMAND_KEY, generatorConfig });
    return {
        key: COMMAND_KEY,
        npmPackage,
        generate: async ({ intermediateRepresentation, helperManager, volume }) => {
            await generateServerProject({
                intermediateRepresentation,
                helperManager,
                packageName: npmPackage.packageName,
                packageVersion: npmPackage.publishInfo?.packageCoordinate.version,
                volume,
            });
        },
    };
}
