import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/browser-compatible-base-generator";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { BaseRubyCustomConfigSchema } from "../custom-config/BaseRubyCustomConfigSchema";

export abstract class AbstractRubyGeneratorContext<
    CustomConfig extends BaseRubyCustomConfigSchema
> extends AbstractGeneratorContext {

    public readonly ir: IntermediateRepresentation;
    public readonly customConfig: CustomConfig;

    public constructor(
        ir: IntermediateRepresentation,
        config: FernGeneratorExec.config.GeneratorConfig,
        customConfig: CustomConfig,
        generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.ir = ir;
        this.customConfig = customConfig;
    }

    public abstract getCoreAsIsFiles(): string[];
}
