import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractPythonGeneratorContext, PythonProject } from "@fern-api/python-base";
import { PythonWireTestGenerator } from "./test-generation";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { PythonGeneratorAgent } from "./PythonGeneratorAgent";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";

export class SdkGeneratorContext extends AbstractPythonGeneratorContext<SdkCustomConfigSchema> {
    public readonly generatorAgent: PythonGeneratorAgent;
    public readonly project: PythonProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
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

        // Generate wire tests if enabled
        if (true) {  // TODO: ADD CONFIG FOR THIS
            // Add required dependencies for wire tests
            this.addWireTestDependencies();
            
            const wireTestGenerator = new PythonWireTestGenerator(this);
            const wireTestFiles = wireTestGenerator.generateWireTests();
            
            // Add wire test files to the project
            wireTestFiles.forEach(file => {
                this.project.addRawFiles(file);
            });
        }
    }

    public getRawAsIsFiles(): string[] {
        return [];
    }

    public isSelfHosted(): boolean {
        return this.ir.selfHosted ?? false;
    }

    private addWireTestDependencies(): void {
        // TODO: handle extra deps
    }
}
