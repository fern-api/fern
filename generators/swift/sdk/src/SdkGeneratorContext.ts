import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractSwiftGeneratorContext } from "@fern-api/swift-base";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SwiftGeneratorAgent } from "./SwiftGeneratorAgent";

export class SdkGeneratorContext extends AbstractSwiftGeneratorContext<SdkCustomConfigSchema> {
    public readonly generatorAgent: SwiftGeneratorAgent;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.generatorAgent = new SwiftGeneratorAgent({
            logger: this.logger,
            config,
            ir
        });
    }

    public isSelfHosted(): boolean {
        return this.ir.selfHosted ?? false;
    }
}
