import { AbsoluteFilePath } from "@fern-api/core-utils";
import { FernGeneratorExec } from "@fern-fern/generator-exec-client";
import { Logger } from "@fern-typescript/commons-v2";
import execa from "execa";
import path from "path";
import { NpmPackage } from "./npm-package/NpmPackage";
import { GeneratorNotificationService } from "./utils/GeneratorNotificationService";

export async function publishPackageIfNecessary({
    generatorNotificationService,
    npmPackage,
    pathToPackageOnDisk,
}: {
    generatorNotificationService: GeneratorNotificationService;
    logger: Logger;
    npmPackage: NpmPackage;
    pathToPackageOnDisk: AbsoluteFilePath;
}): Promise<void> {
    if (npmPackage.publishInfo == null) {
        return;
    }
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

    await generatorNotificationService.sendUpdate(
        FernGeneratorExec.GeneratorUpdate.publishing(npmPackage.publishInfo.packageCoordinate)
    );

    const { registryUrl, token } = npmPackage.publishInfo.registry;
    await runNpmCommandInOutputDirectory(
        "config",
        "set",
        `${npmPackage.scopeWithAtSign}:registry`,
        registryUrl,
        "--location",
        "project"
    );
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
        FernGeneratorExec.GeneratorUpdate.published(npmPackage.publishInfo.packageCoordinate)
    );
}
