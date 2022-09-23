import { AbsoluteFilePath } from "@fern-api/core-utils";
import { model as GeneratorLoggingApiModel } from "@fern-fern/generator-exec-client";
import { GeneratorConfig } from "@fern-fern/generator-exec-client/model/config";
import { GeneratorUpdate } from "@fern-fern/generator-exec-client/model/logging";
import { writeVolumeToDisk } from "@fern-typescript/commons";
import { createLogger, Logger, LogLevel } from "@fern-typescript/commons-v2";
import { GeneratorContext } from "@fern-typescript/sdk-declaration-handler";
import { FernTypescriptClientGenerator } from "@fern-typescript/sdk-generator";
import { camelCase, upperFirst } from "lodash-es";
import { Volume } from "memfs/lib/volume";
import { NpmPackage } from "./npm-package/NpmPackage";
import { GeneratorNotificationService } from "./utils/GeneratorNotificationService";
import { loadIntermediateRepresentation } from "./utils/loadIntermediateRepresentation";

const LOG_LEVEL_CONVERSIONS: Record<LogLevel, GeneratorLoggingApiModel.logging.LogLevel> = {
    [LogLevel.Debug]: GeneratorLoggingApiModel.logging.LogLevel.Debug,
    [LogLevel.Info]: GeneratorLoggingApiModel.logging.LogLevel.Info,
    [LogLevel.Warn]: GeneratorLoggingApiModel.logging.LogLevel.Warn,
    [LogLevel.Error]: GeneratorLoggingApiModel.logging.LogLevel.Error,
};

export async function generateFiles({
    config,
    generatorNotificationService,
    npmPackage,
}: {
    config: GeneratorConfig;
    generatorNotificationService: GeneratorNotificationService;
    npmPackage: NpmPackage;
}): Promise<{ writtenTo: AbsoluteFilePath }> {
    const directoyOnDiskToWriteTo = AbsoluteFilePath.of(config.output.path);

    const generatorContext = new GeneratorContextImpl(
        createLogger((message, level) => {
            // kick off log, but don't wait for it
            void generatorNotificationService.sendUpdate(
                GeneratorUpdate.log({
                    message,
                    level: LOG_LEVEL_CONVERSIONS[level],
                })
            );
        })
    );

    const volume = new Volume();

    await new FernTypescriptClientGenerator({
        apiName: upperFirst(camelCase(config.workspaceName)),
        intermediateRepresentation: await loadIntermediateRepresentation(config.irFilepath),
        context: generatorContext,
        volume,
        packageName: npmPackage.packageName,
        packageVersion: npmPackage.publishInfo?.packageCoordinate.version,
    }).generate();

    if (!generatorContext.didSucceed()) {
        throw new Error("Failed to generate TypeScript project.");
    }

    await writeVolumeToDisk(volume, directoyOnDiskToWriteTo);

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
