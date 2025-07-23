import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { BaseSwiftCustomConfigSchema } from "@fern-api/swift-codegen";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { AsIsFileDefinition } from "../AsIs";
import { SwiftProject } from "../project";

export abstract class AbstractSwiftGeneratorContext<
    CustomConfig extends BaseSwiftCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly project: SwiftProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.project = new SwiftProject({
            context: this,
            name: this.ir.apiName.pascalCase.unsafeName
        });
    }

    public abstract getCoreAsIsFiles(): AsIsFileDefinition[];
}
