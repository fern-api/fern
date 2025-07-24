import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractRustGeneratorContext } from "@fern-api/rust-base";
import { ModelGeneratorContext } from "@fern-api/rust-model";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { RustGeneratorAgent } from "./RustGeneratorAgent";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";

export class SdkGeneratorContext extends AbstractRustGeneratorContext<SdkCustomConfigSchema> {
    public readonly generatorAgent: RustGeneratorAgent;

    constructor(
        ir: IntermediateRepresentation,
        generatorConfig: FernGeneratorExec.GeneratorConfig,
        customConfig: SdkCustomConfigSchema,
        generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, generatorConfig, customConfig, generatorNotificationService);
        this.generatorAgent = new RustGeneratorAgent({
            logger: this.logger,
            config: generatorConfig,
            ir
        });
    }

    public getClientName(): string {
        return this.customConfig.clientName ?? `${this.ir.apiName.pascalCase.safeName}Client`;
    }

    public toModelGeneratorContext(): ModelGeneratorContext {
        return new ModelGeneratorContext(
            this.ir,
            this.config,
            {
                // Convert SDK config to model config - use base properties and add model-specific defaults
                packageName: this.customConfig.packageName,
                packageVersion: this.customConfig.packageVersion,
                extraDependencies: this.customConfig.extraDependencies,
                extraDevDependencies: this.customConfig.extraDevDependencies,
                generateBuilders: false,
                deriveDebug: true,
                deriveClone: true
            },
            this.generatorNotificationService
        );
    }
}
