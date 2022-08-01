import { DependencyType, FernTypescriptGeneratorConfig } from "@fern-typescript/commons";
import { FernTypescriptClientGenerator } from "../../v2/client/FernTypescriptClientGenerator";
import { generateTypeScriptProject } from "../../v2/generate-ts-project/generateTypeScriptProject";
import { Command, CommandKey } from "../Command";
import { constructNpmPackage } from "../constructNpmPackageForCommand";

const COMMAND_KEY = CommandKey.Client;

export function createClientCommand(generatorConfig: FernTypescriptGeneratorConfig): Command<typeof COMMAND_KEY> {
    const npmPackage = constructNpmPackage({ commandKey: COMMAND_KEY, generatorConfig });
    return {
        key: COMMAND_KEY,
        npmPackage,
        generate: async ({ intermediateRepresentation, volume, logger, apiName }) => {
            const clientGenerator = new FernTypescriptClientGenerator(apiName, intermediateRepresentation, logger);
            const project = await clientGenerator.generate();
            await generateTypeScriptProject({
                volume,
                packageName: npmPackage.packageName,
                packageVersion: npmPackage.publishInfo?.packageCoordinate.version,
                project,
                dependencies: {
                    [DependencyType.PROD]: {},
                    [DependencyType.DEV]: {},
                    [DependencyType.PEER]: {},
                },
            });
        },
    };
}
