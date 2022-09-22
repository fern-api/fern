import { GeneratorConfig } from "@fern-fern/generator-exec-client/model/config";
import { ExitStatusUpdate, GeneratorUpdate } from "@fern-fern/generator-exec-client/model/logging";
import { readFile } from "fs/promises";
import { generateFiles } from "./generateFiles";
import { constructNpmPackage } from "./npm-package/constructNpmPackage";
import { publishPackageIfNecessary } from "./publishPackageIfNecessary";
import { GeneratorNotificationService } from "./utils/GeneratorNotificationService";

export async function runGenerator(pathToConfig: string): Promise<void> {
    const configStr = await readFile(pathToConfig);
    const config = JSON.parse(configStr.toString()) as GeneratorConfig;

    const generatorNotificationService = new GeneratorNotificationService(config);
    const npmPackage = constructNpmPackage(config);

    await generatorNotificationService.sendUpdate(
        GeneratorUpdate.init({
            packagesToPublish: npmPackage.publishInfo != null ? [npmPackage.publishInfo.packageCoordinate] : [],
        })
    );

    try {
        const { writtenTo: pathToPackageOnDisk } = await generateFiles({
            config,
            generatorNotificationService,
            npmPackage,
        });
        await publishPackageIfNecessary({
            generatorNotificationService,
            npmPackage,
            pathToPackageOnDisk,
        });
        await generatorNotificationService.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful()));
    } catch (e) {
        await generatorNotificationService.sendUpdate(
            GeneratorUpdate.exitStatusUpdate(
                ExitStatusUpdate.error({
                    message: e instanceof Error ? e.message : "Encountered error",
                })
            )
        );
        throw e;
    }
}
