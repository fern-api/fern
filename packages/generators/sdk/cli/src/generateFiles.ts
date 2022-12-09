import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { writeVolumeToDisk } from "@fern-typescript/commons";
import { GeneratorContext } from "@fern-typescript/contexts";
import { PackageJsonScript, SdkGenerator } from "@fern-typescript/sdk-generator";
import { camelCase, upperFirst } from "lodash-es";
import { Volume } from "memfs/lib/volume";
import { SdkCustomConfig } from "./custom-config/SdkCustomConfig";
import { NpmPackage } from "./npm-package/NpmPackage";
import { loadIntermediateRepresentation } from "./utils/loadIntermediateRepresentation";
import { YarnRunner } from "./yarnRunner";

export async function generateFiles({
    config,
    customConfig,
    npmPackage,
    logger,
    runYarnCommand,
}: {
    config: FernGeneratorExec.GeneratorConfig;
    customConfig: SdkCustomConfig;
    npmPackage: NpmPackage;
    logger: Logger;
    runYarnCommand: YarnRunner;
}): Promise<{ writtenTo: AbsoluteFilePath }> {
    const directoyOnDiskToWriteTo = AbsoluteFilePath.of(config.output.path);
    const generatorContext = new GeneratorContextImpl(logger);
    const volume = new Volume();

    const apiName = `${upperFirst(camelCase(config.organization))}${upperFirst(camelCase(config.workspaceName))}`;
    const sdkGenerator = new SdkGenerator({
        apiName,
        intermediateRepresentation: await loadIntermediateRepresentation(config.irFilepath),
        context: generatorContext,
        volume,
        packageName: npmPackage.packageName,
        packageVersion: npmPackage.version,
        repositoryUrl: npmPackage.repoUrl,
        config: {
            shouldUseBrandedStringAliases: customConfig.useBrandedStringAliases,
            isPackagePrivate: customConfig.isPackagePrivate,
        },
    });

    await sdkGenerator.generate();

    if (!generatorContext.didSucceed()) {
        throw new Error("Failed to generate TypeScript project.");
    }

    await writeVolumeToDisk(volume, directoyOnDiskToWriteTo);
    await sdkGenerator.copyCoreUtilities({ pathToPackage: directoyOnDiskToWriteTo });

    await runYarnCommand(["set", "version", "3.2.4"]);
    await runYarnCommand(["config", "set", "nodeLinker", "pnp"]);
    await runYarnCommand(["install"], {
        env: {
            // set enableImmutableInstalls=false so we can modify yarn.lock, even when in CI
            YARN_ENABLE_IMMUTABLE_INSTALLS: "false",
        },
    });
    await runYarnCommand(["run", PackageJsonScript.FORMAT]);
    await runYarnCommand(["dlx", "@yarnpkg/sdks", "vscode"]);

    return { writtenTo: directoyOnDiskToWriteTo };
}

class GeneratorContextImpl implements GeneratorContext {
    private isSuccess = true;

    constructor(public readonly logger: Logger) {}

    public fail(): void {
        this.isSuccess = false;
    }

    public didSucceed(): boolean {
        return this.isSuccess;
    }
}
