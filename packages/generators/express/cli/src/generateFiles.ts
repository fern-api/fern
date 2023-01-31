import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { writeVolumeToDisk } from "@fern-typescript/commons";
import { GeneratorContext } from "@fern-typescript/contexts";
import { ExpressGenerator, LIB_DIRECTORY, PackageJsonScript, SRC_DIRECTORY } from "@fern-typescript/express-generator";
import { cp } from "fs/promises";
import { camelCase, upperFirst } from "lodash-es";
import { Volume } from "memfs/lib/volume";
import tmp from "tmp-promise";
import { ExpressCustomConfig } from "./custom-config/ExpressCustomConfig";
import { loadIntermediateRepresentation } from "./utils/loadIntermediateRepresentation";
import { createYarnRunner } from "./yarnRunner";

export async function generateFiles({
    config,
    customConfig,
    logger,
}: {
    config: FernGeneratorExec.GeneratorConfig;
    customConfig: ExpressCustomConfig;
    logger: Logger;
}): Promise<{ writtenTo: AbsoluteFilePath }> {
    const directoryOnDiskToWriteTo = AbsoluteFilePath.of((await tmp.dir()).path);
    const generatorContext = new GeneratorContextImpl(logger);
    const volume = new Volume();

    const namespaceExport = `${upperFirst(camelCase(config.organization))}${upperFirst(
        camelCase(config.workspaceName)
    )}`;

    const sdkGenerator = new ExpressGenerator({
        namespaceExport,
        intermediateRepresentation: await loadIntermediateRepresentation(config.irFilepath),
        context: generatorContext,
        volume,
        config: {
            shouldUseBrandedStringAliases: customConfig.useBrandedStringAliases,
        },
    });

    await sdkGenerator.generate();

    if (!generatorContext.didSucceed()) {
        throw new Error("Failed to generate TypeScript project.");
    }

    await writeVolumeToDisk(volume, directoryOnDiskToWriteTo);
    await sdkGenerator.copyCoreUtilities({ pathToSrc: join(directoryOnDiskToWriteTo, SRC_DIRECTORY) });

    const yarnRunner = createYarnRunner(logger, directoryOnDiskToWriteTo);
    await yarnRunner(["install"], {
        env: {
            // set enableImmutableInstalls=false so we can modify yarn.lock, even when in CI
            YARN_ENABLE_IMMUTABLE_INSTALLS: "false",
        },
    });
    await yarnRunner([PackageJsonScript.FORMAT]);
    await yarnRunner([PackageJsonScript.BUILD]);
    await cp(join(directoryOnDiskToWriteTo, LIB_DIRECTORY), config.output.path, { recursive: true });

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
