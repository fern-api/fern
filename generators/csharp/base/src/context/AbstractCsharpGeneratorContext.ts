import { FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import {
    AbstractCsharpGeneratorContext as BaseAbstractCsharpGeneratorContext,
    BaseCsharpCustomConfigSchema,
} from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import {
    IntermediateRepresentation,
} from "@fern-fern/ir-sdk/api";

import { CsharpProject } from "../project";

import { CORE_DIRECTORY_NAME, PUBLIC_CORE_DIRECTORY_NAME } from "../project/CsharpProject";

export abstract class AbstractCsharpGeneratorContext<
    CustomConfig extends BaseCsharpCustomConfigSchema
> extends BaseAbstractCsharpGeneratorContext<CustomConfig> {
    public readonly project: CsharpProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.project = new CsharpProject({
            context: this,
            name: this.namespace
        });
    }
  
    public getCoreDirectory(): RelativeFilePath {
        return RelativeFilePath.of(CORE_DIRECTORY_NAME);
    }

    public getPublicCoreDirectory(): RelativeFilePath {
        return join(this.getCoreDirectory(), RelativeFilePath.of(PUBLIC_CORE_DIRECTORY_NAME));
    }
  
}

