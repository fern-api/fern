import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast";
import { FernIr } from "@fern-fern/ir-sdk";

import { TypescriptMcpProject } from "../project/TypescriptMcpProject.js";
import { ZodTypeMapper } from "./ZodTypeMapper.js";

export interface FileLocation {
    importPath: string;
    directory: RelativeFilePath;
}

export abstract class AbstractTypescriptMcpGeneratorContext<
    CustomConfig extends TypescriptCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly project: TypescriptMcpProject;
    public readonly zodTypeMapper: ZodTypeMapper;
    public publishConfig?: FernGeneratorExec.NpmGithubPublishInfo;

    public constructor(
        public readonly ir: FernIr.IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.project = new TypescriptMcpProject({
            context: this
        });
        this.zodTypeMapper = new ZodTypeMapper(this);
        config.output.mode._visit<void>({
            github: (github) => {
                if (github.publishInfo?.type === "npm") {
                    this.publishConfig = github.publishInfo;
                }
            },
            publish: () => undefined,
            downloadFiles: () => undefined,
            _other: () => undefined
        });
    }

    public abstract getRawAsIsFiles(): string[];
}
