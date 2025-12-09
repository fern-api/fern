import { GeneratorNotificationService, FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { Logger, createLogger, CONSOLE_LOGGER, LogLevel } from "@fern-api/logger";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { KotlinProject } from "./KotlinProject";
import { KotlinCustomConfig } from "./KotlinCustomConfig";

const LOG_LEVEL_CONVERSIONS: Record<LogLevel, FernGeneratorExec.logging.LogLevel> = {
    [LogLevel.Trace]: FernGeneratorExec.logging.LogLevel.Debug,
    [LogLevel.Debug]: FernGeneratorExec.logging.LogLevel.Debug,
    [LogLevel.Info]: FernGeneratorExec.logging.LogLevel.Info,
    [LogLevel.Warn]: FernGeneratorExec.logging.LogLevel.Warn,
    [LogLevel.Error]: FernGeneratorExec.logging.LogLevel.Error
};

export class KotlinGeneratorContext {
    public readonly ir: IntermediateRepresentation;
    public readonly config: FernGeneratorExec.GeneratorConfig;
    public readonly customConfig: KotlinCustomConfig;
    public readonly project: KotlinProject;
    public readonly logger: Logger;
    public readonly generatorNotificationService: GeneratorNotificationService;
    public readonly version: string | undefined;

    constructor(
        ir: IntermediateRepresentation,
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: KotlinCustomConfig,
        project: KotlinProject,
        generatorNotificationService: GeneratorNotificationService
    ) {
        this.ir = ir;
        this.config = config;
        this.customConfig = customConfig;
        this.project = project;
        this.generatorNotificationService = generatorNotificationService;
        this.version = config?.output?.mode?._visit({
            downloadFiles: () => undefined,
            github: (github) => github.version,
            publish: (publish) => publish.version,
            _other: () => undefined
        });
        this.logger = createLogger((level: LogLevel, ...message: string[]) => {
            CONSOLE_LOGGER.log(level, ...message);

            try {
                generatorNotificationService.bufferUpdate(
                    FernGeneratorExec.GeneratorUpdate.log({
                        message: message.join(" "),
                        level: LOG_LEVEL_CONVERSIONS[level]
                    })
                );
            } catch (e) {
                console.warn("Encountered error when sending update", e);
            }
        });
    }

    public getPackageName(): string {
        return this.customConfig.packageName ?? this.ir.apiName.pascalCase.safeName.toLowerCase();
    }

    public getGroupId(): string {
        return this.customConfig.groupId ?? `com.${this.getPackageName()}`;
    }

    public getArtifactId(): string {
        return this.customConfig.artifactId ?? `${this.getPackageName()}-sdk`;
    }

    public getVersion(): string {
        return this.customConfig.version ?? "0.0.1";
    }
}
