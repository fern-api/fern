import { generateModelProject } from "@fern-typescript/model";
import { FernTypescriptGeneratorConfig } from "../../generator/FernGeneratorConfig";
import { Command, CommandKey } from "../Command";
import { constructNpmPackage } from "../constructNpmPackageForCommand";

const COMMAND_KEY = CommandKey.Model;

export function createModelCommand(generatorConfig: FernTypescriptGeneratorConfig): Command<typeof COMMAND_KEY> {
    const npmPackage = constructNpmPackage({ commandKey: COMMAND_KEY, generatorConfig });
    return {
        key: COMMAND_KEY,
        npmPackage,
        generate: async ({ intermediateRepresentation, volume }) => {
            await generateModelProject({
                intermediateRepresentation,
                packageName: npmPackage.packageName,
                packageVersion: npmPackage.publishInfo?.packageCoordinate.version,
                volume,
            });
        },
    };
}
