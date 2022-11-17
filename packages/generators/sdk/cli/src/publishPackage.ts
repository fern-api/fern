import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { PackageJsonScript } from "@fern-typescript/sdk-generator";
import path from "path";
import { PublishInfo } from "./npm-package/NpmPackage";
import { GeneratorNotificationService } from "./utils/GeneratorNotificationService";
import { YarnRunner } from "./yarnRunner";

export async function publishPackage({
    generatorNotificationService,
    logger,
    publishInfo,
    pathToPackageOnDisk,
    runYarnCommand,
    dryRun,
}: {
    generatorNotificationService: GeneratorNotificationService;
    logger: Logger;
    publishInfo: PublishInfo;
    pathToPackageOnDisk: AbsoluteFilePath;
    runYarnCommand: YarnRunner;
    dryRun: boolean;
}): Promise<void> {
    const npm = createLoggingExecutable("npm", {
        cwd: pathToPackageOnDisk,
        logger,
    });

    await runYarnCommand(["run", PackageJsonScript.BUILD]);

    await generatorNotificationService.sendUpdate(
        FernGeneratorExec.GeneratorUpdate.publishing(publishInfo.packageCoordinate)
    );

    const { registryUrl, token } = publishInfo.registry;
    await npm(["config", "set", "registry", registryUrl, "--location", "project"]);
    const parsedRegistryUrl = new URL(registryUrl);
    const normalizedRegistryUrl = path.join(parsedRegistryUrl.hostname, parsedRegistryUrl.pathname);
    await npm(
        [
            // intentionally not writing this to the project config with `--location project`,
            // so the token isn't persisted
            "config",
            "set",
            `//${normalizedRegistryUrl}:_authToken`,
            token,
        ],
        {
            secrets: [normalizedRegistryUrl, token],
        }
    );

    const publishCommand = ["publish"];
    if (dryRun) {
        publishCommand.push("--dry-run");
    }
    await npm(publishCommand);

    logger.info(`Published ${publishInfo.packageCoordinate.name}@${publishInfo.packageCoordinate.version}`);

    await generatorNotificationService.sendUpdate(
        FernGeneratorExec.GeneratorUpdate.published(publishInfo.packageCoordinate)
    );
}
