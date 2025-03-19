import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { BaseJavaCustomConfigSchema } from "@fern-api/java-ast";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

export interface FileLocation {
    namespace: string;
    directory: RelativeFilePath;
}

export abstract class AbstractJavaGeneratorContext<
    CustomConfig extends BaseJavaCustomConfigSchema
> extends AbstractGeneratorContext {
    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
    }
}
