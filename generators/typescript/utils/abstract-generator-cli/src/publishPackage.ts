import { NpmPackage, PersistedTypescriptProject } from "@fern-typescript/commons";

import { GeneratorNotificationService } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

export async function publishPackage({
    generatorNotificationService,
    logger,
    npmPackage,
    dryRun,
    typescriptProject,
    shouldTolerateRepublish
}: {
    generatorNotificationService: GeneratorNotificationService;
    logger: Logger;
    npmPackage: NpmPackage | undefined;
    dryRun: boolean;
    typescriptProject: PersistedTypescriptProject;
    shouldTolerateRepublish: boolean;
}): Promise<void> {
    if (npmPackage?.publishInfo == null) {
        throw new Error("npmPackage.publishInfo is not defined.");
    }

    const packageCoordinate = FernGeneratorExec.PackageCoordinate.npm({
        name: npmPackage.packageName,
        version: npmPackage.version
    });

    await generatorNotificationService.sendUpdate(FernGeneratorExec.GeneratorUpdate.publishing(packageCoordinate));

    await typescriptProject.publish({
        logger,
        dryRun,
        publishInfo: npmPackage.publishInfo,
        shouldTolerateRepublish
    });

    await generatorNotificationService.sendUpdate(FernGeneratorExec.GeneratorUpdate.published(packageCoordinate));
}
