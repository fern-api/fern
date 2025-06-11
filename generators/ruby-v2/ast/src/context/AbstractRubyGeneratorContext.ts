import {
    AbstractGeneratorContext,
    FernGeneratorExec,
    GeneratorNotificationService
} from "@fern-api/browser-compatible-base-generator";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { RelativeFilePath } from "../../../../../packages/commons/fs-utils/src";
import { BaseRubyCustomConfigSchema } from "../custom-config/BaseRubyCustomConfigSchema";

export abstract class AbstractRubyGeneratorContext<
    CustomConfig extends BaseRubyCustomConfigSchema
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

export interface FileLocation {
    namespace: string;
    directory: RelativeFilePath;
}
