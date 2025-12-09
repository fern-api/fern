import { GeneratorNotificationService } from "@fern-api/base-generator";
import { KotlinGeneratorContext, KotlinProject } from "@fern-api/kotlin-base";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-api/ir-sdk/api";
import { SdkCustomConfig } from "./SdkCustomConfig";

export class SdkGeneratorContext extends KotlinGeneratorContext {
    public readonly sdkCustomConfig: SdkCustomConfig;

    constructor(
        ir: IntermediateRepresentation,
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: SdkCustomConfig,
        project: KotlinProject,
        generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, project, generatorNotificationService);
        this.sdkCustomConfig = customConfig;
    }

    public getClientName(): string {
        return this.sdkCustomConfig.clientName ?? `${this.ir.apiName.pascalCase.safeName}Client`;
    }
}
