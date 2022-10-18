import { AbsoluteFilePath } from "@fern-api/core-utils";
import { FernGeneratorExec } from "@fern-fern/generator-exec-client";
import { writeVolumeToDisk } from "@fern-typescript/commons";
import { Logger } from "@fern-typescript/commons-v2";
import { DEV_DEPENDENCIES } from "@fern-typescript/sdk-generator";
import { generateGitIgnore } from "@fern-typescript/sdk-generator/src/generate-ts-project/generateGitIgnore";
import { generatePrettierIgnore } from "@fern-typescript/sdk-generator/src/generate-ts-project/generatePrettierIgnore";
import { generateTsConfig } from "@fern-typescript/sdk-generator/src/generate-ts-project/generateTsConfig";
import { getPathToProjectFile } from "@fern-typescript/sdk-generator/src/generate-ts-project/utils";
import endent from "endent";
import { mkdir, writeFile } from "fs/promises";
import { Volume } from "memfs/lib/volume";
import path from "path";
import { NpmPackage } from "./npm-package/NpmPackage";
import { createYarnRunner } from "./yarnRunner";

export async function writeSampleApp({
    config,
    logger,
    npmPackage,
    exportDeclaration,
}: {
    config: FernGeneratorExec.GeneratorConfig;
    logger: Logger;
    npmPackage: NpmPackage;
    exportDeclaration: string;
}): Promise<void> {
    logger.debug("Generating sample app");
    const volume = new Volume();
    await generateSampleApp({
        volume,
        npmPackage,
        exportDeclaration,
    });
    logger.debug("Generated sample app");

    const sampleAppDirPath = path.join(config.output.path, ".sample-app");
    logger.debug("Writing sample app to disk");
    await mkdir(sampleAppDirPath, { recursive: true });
    await writeFile(path.join(sampleAppDirPath, "yarn.lock"), "");
    await writeVolumeToDisk(volume, AbsoluteFilePath.of(sampleAppDirPath));

    const runYarnCommand = createYarnRunner(logger, AbsoluteFilePath.of(sampleAppDirPath));
    await runYarnCommand(["set", "version", "berry"]);
    await runYarnCommand(["config", "set", "nodeLinker", "pnp"]);
    await runYarnCommand(["install"], {
        env: {
            // set enableImmutableInstalls=false so we can modify yarn.lock, even when in CI
            YARN_ENABLE_IMMUTABLE_INSTALLS: "false",
        },
    });
    await runYarnCommand(["add", `${npmPackage.packageName}@portal:../`]);
    await runYarnCommand(["dlx", "@yarnpkg/sdks", "vscode"]);
}

async function generateSampleApp({
    volume,
    npmPackage,
    exportDeclaration,
}: {
    volume: Volume;
    npmPackage: NpmPackage;
    exportDeclaration: string;
}) {
    await generateSampleAppPackageJson({
        volume,
    });
    await generateTsConfig(volume);
    await generatePrettierIgnore(volume);
    await generateGitIgnore(volume);
    await volume.promises.writeFile(
        getPathToProjectFile("app.ts"),
        endent`import { ${exportDeclaration} } from "${npmPackage.packageName}";`
    );
}

async function generateSampleAppPackageJson({ volume }: { volume: Volume }) {
    const packageJson = {
        name: "sample-app",
        scripts: {
            ["start"]: "ts-node app.ts",
        },
        devDependencies: {
            ...DEV_DEPENDENCIES,
        },
    };
    await volume.promises.writeFile(getPathToProjectFile("package.json"), JSON.stringify(packageJson, undefined, 4));
}
