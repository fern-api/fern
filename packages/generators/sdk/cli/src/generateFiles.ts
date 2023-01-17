import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { writeVolumeToDisk } from "@fern-typescript/commons";
import { GeneratorContext } from "@fern-typescript/contexts";
import { SdkGenerator } from "@fern-typescript/sdk-generator";
import { PRETTIER_COMMAND } from "@fern-typescript/sdk-generator/src/generate-ts-project/generatePackageJson";
import { camelCase, upperFirst } from "lodash-es";
import { Volume } from "memfs/lib/volume";
import { SdkCustomConfig } from "./custom-config/SdkCustomConfig";
import { NpmPackage } from "./npm-package/NpmPackage";
import { loadIntermediateRepresentation } from "./utils/loadIntermediateRepresentation";

export async function generateFiles({
    config,
    customConfig,
    npmPackage,
    logger,
}: {
    config: FernGeneratorExec.GeneratorConfig;
    customConfig: SdkCustomConfig;
    npmPackage: NpmPackage;
    logger: Logger;
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
            neverThrowErrors: customConfig.neverThrowErrors,
        },
    });

    await sdkGenerator.generate();

    if (!generatorContext.didSucceed()) {
        throw new Error("Failed to generate TypeScript project.");
    }

    await writeVolumeToDisk(volume, directoyOnDiskToWriteTo);
    await sdkGenerator.copyCoreUtilities({ pathToPackage: directoyOnDiskToWriteTo });

    await loggingExeca(logger, "npx", PRETTIER_COMMAND, { cwd: directoyOnDiskToWriteTo });

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
