import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { TypescriptMcpGeneratorAgent } from "../TypescriptMcpGeneratorAgent";
import { TypescriptMcpProject } from "../project/TypescriptMcpProject";
import { ReadmeConfigBuilder } from "../readme/ReadmeConfigBuilder";

export interface FileLocation {
    importPath: string;
    directory: RelativeFilePath;
}

export abstract class AbstractTypescriptMcpGeneratorContext<
    CustomConfig extends TypescriptCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly project: TypescriptMcpProject;
    public readonly generatorAgent: TypescriptMcpGeneratorAgent;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.project = new TypescriptMcpProject({
            context: this
        });
        this.generatorAgent = new TypescriptMcpGeneratorAgent({
            logger: this.logger,
            config: this.config,
            readmeConfigBuilder: new ReadmeConfigBuilder()
        });
    }

    public abstract getRawAsIsFiles(): string[];
}
