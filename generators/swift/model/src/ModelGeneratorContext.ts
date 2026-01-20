import { FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { AbstractSwiftGeneratorContext } from "@fern-api/swift-base";

import { ModelCustomConfigSchema } from "./ModelCustomConfig";

export class ModelGeneratorContext extends AbstractSwiftGeneratorContext<ModelCustomConfigSchema> {
    // biome-ignore lint/complexity/noUselessConstructor: allow
    public constructor(
        ir: IntermediateRepresentation,
        config: FernGeneratorExec.config.GeneratorConfig,
        customConfig: ModelCustomConfigSchema,
        generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
    }
}
