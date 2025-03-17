import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractJavaGeneratorContext, JavaProject } from "@fern-api/java-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { JavaGeneratorAgent } from "./JavaGeneratorAgent";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder";

export class SdkGeneratorContext extends AbstractJavaGeneratorContext<SdkCustomConfigSchema> {
    public readonly generatorAgent: JavaGeneratorAgent;
    public readonly project: JavaProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.project = new JavaProject({ context: this });
        this.generatorAgent = new JavaGeneratorAgent({
            logger: this.logger,
            config: this.config,
            readmeConfigBuilder: new ReadmeConfigBuilder()
        });
    }
}
