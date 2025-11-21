import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractPythonGeneratorCli } from "@fern-api/python-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { WireTestGenerator } from "./wire-tests/WireTestGenerator";

export class SdkGeneratorCli extends AbstractPythonGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
        customConfig: SdkCustomConfigSchema;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): SdkGeneratorContext {
        return new SdkGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): SdkCustomConfigSchema {
        const parsed = customConfig != null ? SdkCustomConfigSchema.parse(customConfig) : undefined;
        if (parsed != null) {
            return parsed;
        }
        return {};
    }

    protected publishPackage(context: SdkGeneratorContext): Promise<void> {
        return this.generate(context);
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        return await this.generate(context);
    }

    protected async generate(context: SdkGeneratorContext): Promise<void> {
        await this.generateWireTestFiles(context);
        await context.project.persist();
    }

    private async generateWireTestFiles(context: SdkGeneratorContext): Promise<void> {
        if (!context.customConfig.enable_wire_tests) {
            return;
        }

        try {
            context.logger.debug("Generating WireMock integration tests...");
            const wireTestGenerator = new WireTestGenerator(context, context.ir);
            await wireTestGenerator.generate();
            context.logger.debug("WireMock test generation complete");
        } catch (error) {
            context.logger.error("Failed to generate WireMock tests");
            if (error instanceof Error) {
                context.logger.debug(error.message);
                context.logger.debug(error.stack ?? "");
            }
        }
    }

    private async generateGitHub({ context }: { context: SdkGeneratorContext }): Promise<void> {
        await context.generatorAgent.pushToGitHub({ context });
    }
}
