import { FernTypescriptGeneratorConfig } from "@fern-typescript/commons";
import { FernTypescriptClientGenerator } from "../../v2/client/FernTypescriptClientGenerator";
import { Command, CommandKey } from "../Command";
import { constructNpmPackage } from "../constructNpmPackageForCommand";

const COMMAND_V2_KEY = CommandKey.ClientV2;

export function createClientV2Command(generatorConfig: FernTypescriptGeneratorConfig): Command<typeof COMMAND_V2_KEY> {
    const npmPackage = constructNpmPackage({ commandKey: COMMAND_V2_KEY, generatorConfig });
    return {
        key: COMMAND_V2_KEY,
        npmPackage,
        generate: async ({ intermediateRepresentation, volume, context, apiName }) => {
            await new FernTypescriptClientGenerator({
                apiName,
                intermediateRepresentation,
                context,
                volume,
                packageName: npmPackage.packageName,
                packageVersion: npmPackage.publishInfo?.packageCoordinate.version,
            }).generate();
        },
    };
}
