import { AbsoluteFilePath } from "@fern-api/core-utils";
import { FernGeneratorExec } from "@fern-fern/generator-exec-client";
import { Logger } from "@fern-typescript/commons-v2";
import { PackageJsonScript } from "@fern-typescript/sdk-generator";
import execa from "execa";
import path from "path";
import { PublishInfo } from "./npm-package/NpmPackage";
import { GeneratorNotificationService } from "./utils/GeneratorNotificationService";
import { YarnRunner } from "./yarnRunner";

export async function publishPackage({
    generatorNotificationService,
    publishInfo,
    pathToPackageOnDisk,
    runYarnCommand,
}: {
    generatorNotificationService: GeneratorNotificationService;
    logger: Logger;
    publishInfo: PublishInfo;
    pathToPackageOnDisk: AbsoluteFilePath;
    runYarnCommand: YarnRunner;
}): Promise<void> {
    const runCommandInOutputDirectory = async (executable: string, ...args: string[]): Promise<void> => {
        const command = execa(executable, args, {
            cwd: pathToPackageOnDisk,
        });
        command.stdout?.pipe(process.stdout);
        command.stderr?.pipe(process.stderr);
        await command;
    };

    const runNpmCommandInOutputDirectory = async (...args: string[]): Promise<void> => {
        await runCommandInOutputDirectory("npm", ...args);
    };

    await runYarnCommand(["run", PackageJsonScript.BUILD]);

    await generatorNotificationService.sendUpdate(
        FernGeneratorExec.GeneratorUpdate.publishing(publishInfo.packageCoordinate)
    );

    const { registryUrl, token } = publishInfo.registry;
    await runNpmCommandInOutputDirectory("config", "set", "registry", registryUrl, "--location", "project");
    const parsedRegistryUrl = new URL(registryUrl);
    await runNpmCommandInOutputDirectory(
        "config",
        "set",
        `//${path.join(parsedRegistryUrl.hostname, parsedRegistryUrl.pathname)}:_authToken`,
        token
        // intentionally not writing this to the project config, so the token isn't persisted
    );

    await runNpmCommandInOutputDirectory("publish");

    await generatorNotificationService.sendUpdate(
        FernGeneratorExec.GeneratorUpdate.published(publishInfo.packageCoordinate)
    );
}
