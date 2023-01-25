import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { writeVolumeToDisk } from "@fern-typescript/commons";
import { GeneratorContext } from "@fern-typescript/contexts";
import { ExpressGenerator } from "@fern-typescript/express-generator";
import { camelCase, upperFirst } from "lodash-es";
import { Volume } from "memfs/lib/volume";
import { ExpressCustomConfig } from "./custom-config/ExpressCustomConfig";
import { loadIntermediateRepresentation } from "./utils/loadIntermediateRepresentation";

export async function generateFiles({
    config,
    customConfig,
    logger,
}: {
    config: FernGeneratorExec.GeneratorConfig;
    customConfig: ExpressCustomConfig;
    logger: Logger;
}): Promise<{ writtenTo: AbsoluteFilePath }> {
    const directoyOnDiskToWriteTo = AbsoluteFilePath.of(config.output.path);
    const generatorContext = new GeneratorContextImpl(logger);
    const volume = new Volume();

    const apiName = `${upperFirst(camelCase(config.organization))}${upperFirst(camelCase(config.workspaceName))}`;
    const sdkGenerator = new ExpressGenerator({
        apiName,
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

    await writeVolumeToDisk(volume, directoyOnDiskToWriteTo);
    await sdkGenerator.copyCoreUtilities({ pathToSrc: directoyOnDiskToWriteTo });

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
