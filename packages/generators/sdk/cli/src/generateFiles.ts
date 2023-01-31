import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { writeVolumeToDisk } from "@fern-typescript/commons";
import { NpmPackage } from "@fern-typescript/commons/src/NpmPackage";
import { GeneratorContext } from "@fern-typescript/contexts";
import { SdkGenerator, SRC_DIRECTORY } from "@fern-typescript/sdk-generator";
import { camelCase, upperFirst } from "lodash-es";
import { Volume } from "memfs/lib/volume";
import { SdkCustomConfig } from "./custom-config/SdkCustomConfig";
import { loadIntermediateRepresentation } from "./utils/loadIntermediateRepresentation";

export async function generateFiles({
    config,
    customConfig,
    npmPackage,
    logger,
}: {
    config: FernGeneratorExec.GeneratorConfig;
    customConfig: SdkCustomConfig;
    npmPackage: NpmPackage | undefined;
    logger: Logger;
}): Promise<{ writtenTo: AbsoluteFilePath }> {
    const directoryOnDiskToWriteTo = AbsoluteFilePath.of(config.output.path);
    const generatorContext = new GeneratorContextImpl(logger);
    const volume = new Volume();

    const namespaceExport =
        customConfig.namespaceExport ??
        `${upperFirst(camelCase(config.organization))}${upperFirst(camelCase(config.workspaceName))}`;

    const sdkGenerator = new SdkGenerator({
        namespaceExport,
        intermediateRepresentation: await loadIntermediateRepresentation(config.irFilepath),
        context: generatorContext,
        volume,
        npmPackage,
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

    await writeVolumeToDisk(volume, directoryOnDiskToWriteTo);

    await sdkGenerator.copyCoreUtilities({
        pathToSrc: npmPackage != null ? join(directoryOnDiskToWriteTo, SRC_DIRECTORY) : directoryOnDiskToWriteTo,
    });

    await loggingExeca(
        logger,
        "npx",
        ["prettier", "--write", npmPackage != null ? `${SRC_DIRECTORY}/**/*.ts` : "**/*.ts"],
        {
            cwd: directoryOnDiskToWriteTo,
        }
    );

    return { writtenTo: directoryOnDiskToWriteTo };
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
