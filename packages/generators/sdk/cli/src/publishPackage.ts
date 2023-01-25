import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { PackageCoordinate } from "@fern-fern/generator-exec-sdk/resources";
import { NpmPackage, PublishInfo } from "@fern-typescript/commons/src/NpmPackage";
import { PackageJsonScript } from "@fern-typescript/sdk-generator";
import path from "path";
import { GeneratorNotificationService } from "./utils/GeneratorNotificationService";
import { YarnRunner } from "./yarnRunner";

export async function publishPackage({
    generatorNotificationService,
    logger,
    npmPackage,
    publishInfo,
    pathToPackageOnDisk,
    runYarnCommand,
    dryRun,
}: {
    generatorNotificationService: GeneratorNotificationService;
    logger: Logger;
    npmPackage: NpmPackage;
    publishInfo: PublishInfo;
    pathToPackageOnDisk: AbsoluteFilePath;
    runYarnCommand: YarnRunner;
    dryRun: boolean;
}): Promise<void> {
    const npm = createLoggingExecutable("npm", {
        cwd: pathToPackageOnDisk,
        logger,
    });

    await runYarnCommand(["install"], {
        env: {
            // set enableImmutableInstalls=false so we can modify yarn.lock, even when in CI
            YARN_ENABLE_IMMUTABLE_INSTALLS: "false",
        },
    });
    await runYarnCommand(["run", PackageJsonScript.BUILD]);

    const packageCoordinate = PackageCoordinate.npm({
        name: npmPackage.packageName,
        version: npmPackage.version,
    });

    await generatorNotificationService.sendUpdate(FernGeneratorExec.GeneratorUpdate.publishing(packageCoordinate));

    const parsedRegistryUrl = new URL(publishInfo.registryUrl);
    const registryUrlWithoutProtocol = path.join(parsedRegistryUrl.hostname, parsedRegistryUrl.pathname);

    // intentionally not writing these to the project config with `--location project`,
    // so the registry url and token aren't persisted
    await npm(["config", "set", "registry", publishInfo.registryUrl], {
        secrets: [publishInfo.registryUrl],
    });
    await npm(["config", "set", `//${registryUrlWithoutProtocol}:_authToken`, publishInfo.token], {
        secrets: [registryUrlWithoutProtocol, publishInfo.token],
    });

    const publishCommand = ["publish"];
    if (dryRun) {
        publishCommand.push("--dry-run");
    }
    await npm(publishCommand);

    await generatorNotificationService.sendUpdate(FernGeneratorExec.GeneratorUpdate.published(packageCoordinate));
}
