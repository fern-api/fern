import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractPythonGeneratorContext, PythonProject } from "@fern-api/python-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation, TypeId } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";

export class SdkGeneratorContext extends AbstractPythonGeneratorContext<SdkCustomConfigSchema> {
    public readonly project: PythonProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.project = new PythonProject({ context: this });
    }
}
