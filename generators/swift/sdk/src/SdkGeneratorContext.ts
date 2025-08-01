import { GeneratorNotificationService } from "@fern-api/base-generator";

import { AbstractSwiftGeneratorContext } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation, Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";

export class SdkGeneratorContext extends AbstractSwiftGeneratorContext<SdkCustomConfigSchema> {
    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
    }

    public get packageName(): string {
        return this.ir.apiName.pascalCase.unsafeName;
    }

    public get libraryName(): string {
        return this.ir.apiName.pascalCase.unsafeName;
    }

    public get targetName(): string {
        return `${this.ir.apiName.pascalCase.unsafeName}Target`;
    }

    public get rootClientName(): string {
        return `${this.ir.apiName.pascalCase.unsafeName}Client`;
    }

    public get environmentEnumName(): string {
        return `${this.ir.apiName.pascalCase.unsafeName}Environment`;
    }

    public getSubClientName(subpackage: Subpackage): string {
        return `${subpackage.name.pascalCase.unsafeName}Client`;
    }

    public getAdditionalQueryParametersType(): swift.Type {
        return swift.Type.dictionary(swift.Type.string(), swift.Type.string());
    }

    public isSelfHosted(): boolean {
        return this.ir.selfHosted ?? false;
    }
}
