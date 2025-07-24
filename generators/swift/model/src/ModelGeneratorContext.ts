import { FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractSwiftGeneratorContext, AsIsFileDefinition, AsIsFiles } from "@fern-api/swift-base";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

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

    public getCoreAsIsFiles(): AsIsFileDefinition[] {
        return Object.values(AsIsFiles);
    }
}
