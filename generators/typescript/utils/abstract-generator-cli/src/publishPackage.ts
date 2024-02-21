import { Logger } from "@fern-api/logger";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { NpmPackage, PersistedTypescriptProject } from "@fern-typescript/commons";
import { GeneratorNotificationService } from "./GeneratorNotificationService";

export async function publishPackage({
    generatorNotificationService,
    logger,
    npmPackage,
    dryRun,
    typescriptProject
}: {
    generatorNotificationService: GeneratorNotificationService | undefined;
    logger: Logger;
    npmPackage: NpmPackage | undefined;
    dryRun: boolean;
    typescriptProject: PersistedTypescriptProject;
}): Promise<void> {
    if (npmPackage?.publishInfo == null) {
        throw new Error("npmPackage.publishInfo is not defined.");
    }

    const packageCoordinate = FernGeneratorExec.PackageCoordinate.npm({
        name: npmPackage.packageName,
        version: npmPackage.version
    });

    await generatorNotificationService?.sendUpdate(FernGeneratorExec.GeneratorUpdate.publishing(packageCoordinate));

    await typescriptProject.publish({
        logger,
        dryRun,
        publishInfo: npmPackage.publishInfo
    });

    await generatorNotificationService?.sendUpdate(FernGeneratorExec.GeneratorUpdate.published(packageCoordinate));
}
