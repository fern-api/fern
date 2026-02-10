import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractPythonGeneratorContext, PythonProject } from "@fern-api/python-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import { PythonGeneratorAgent } from "./PythonGeneratorAgent.js";
import { SdkCustomConfigSchema } from "./SdkCustomConfig.js";

export class SdkGeneratorContext extends AbstractPythonGeneratorContext<SdkCustomConfigSchema> {
    public readonly generatorAgent: PythonGeneratorAgent;
    public readonly project: PythonProject;

    public constructor(
        public readonly ir: FernIr.IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: SdkCustomConfigSchema,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(ir, config, customConfig, generatorNotificationService);
        this.project = new PythonProject({ context: this });
        this.generatorAgent = new PythonGeneratorAgent({
            logger: this.logger,
            config: this.config,
            ir: this.ir
        });
    }

    public getRawAsIsFiles(): string[] {
        return [];
    }

    public isSelfHosted(): boolean {
        return this.ir.selfHosted ?? false;
    }
}
