import { AbstractRustGeneratorContext } from "@fern-api/rust-base";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { GeneratorNotificationService } from "@fern-api/base-generator";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { RustGeneratorAgent } from "./RustGeneratorAgent";

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
} 