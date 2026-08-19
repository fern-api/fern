import { FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractSwiftGeneratorContext } from "@fern-api/swift-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { ModelCustomConfigSchema } from "./ModelCustomConfig.js";

export class ModelGeneratorContext extends AbstractSwiftGeneratorContext<ModelCustomConfigSchema> {
    // biome-ignore lint/complexity/noUselessConstructor: allow
    public constructor(
        ir: FernIr.IntermediateRepresentation,
        config: FernGeneratorExec.config.GeneratorConfig,
        customConfig: ModelCustomConfigSchema,
        generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
    }
}
