import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractPythonGeneratorContext, PythonProject } from "@fern-api/python-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
import { PythonGeneratorAgent } from "./PythonGeneratorAgent.js";
import { ReadmeConfigBuilder } from "./readme/ReadmeConfigBuilder.js";
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
            readmeConfigBuilder: new ReadmeConfigBuilder(),
            ir: this.ir
        });
    }

    public getRawAsIsFiles(): string[] {
        return [];
    }

    public isSelfHosted(): boolean {
        return this.ir.selfHosted ?? false;
    }

    /**
     * Gets the full module path, prioritizing package_name from custom config.
     */
    public getModulePath(): string {
        // First priority: Use package_name if set
        if (this.customConfig.package_name != null) {
            return this.customConfig.package_name;
        }

        // Fallback: Use organization + package_path logic
        // Replace hyphens with underscores since hyphens are not valid in Python module names
        const orgName = this.config.organization.replace(/-/g, "_");
        const packagePath = this.customConfig.package_path;
        if (packagePath) {
            const packagePathDotted = packagePath.replace(/\//g, ".");
            return `${orgName}.${packagePathDotted}`;
        }
        return orgName;
    }
}
