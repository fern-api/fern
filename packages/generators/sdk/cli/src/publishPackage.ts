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

    await runYarnCommand(["install"], {
        env: {
            // set enableImmutableInstalls=false so we can modify yarn.lock, even when in CI
            YARN_ENABLE_IMMUTABLE_INSTALLS: "false",
        },
    });
    await runYarnCommand(["run", PackageJsonScript.BUILD]);

    await generatorNotificationService.sendUpdate(
        FernGeneratorExec.GeneratorUpdate.publishing(publishInfo.packageCoordinate)
    );

    const { registryUrl, token } = publishInfo.registry;
    const parsedRegistryUrl = new URL(registryUrl);
    const registryUrlWithoutProtocol = path.join(parsedRegistryUrl.hostname, parsedRegistryUrl.pathname);

    // intentionally not writing these to the project config with `--location project`,
    // so the registry url and token aren't persisted
    await npm(["config", "set", "registry", registryUrl], {
        secrets: [registryUrl],
    });
    await npm(["config", "set", `//${registryUrlWithoutProtocol}:_authToken`, token], {
        secrets: [registryUrlWithoutProtocol, token],
    });

    const publishCommand = ["publish"];
    if (dryRun) {
        publishCommand.push("--dry-run");
    }
    await npm(publishCommand);

    await generatorNotificationService.sendUpdate(
        FernGeneratorExec.GeneratorUpdate.published(publishInfo.packageCoordinate)
    );
}
