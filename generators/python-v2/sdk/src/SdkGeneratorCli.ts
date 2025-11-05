import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractPythonGeneratorCli } from "@fern-api/python-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { generateWireTests } from "./wire-tests/generateWireTests";

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
        const parsed =
            customConfig != null ? SdkCustomConfigSchema.parse(customConfig) : SdkCustomConfigSchema.parse({});
        return parsed;
    }

    protected publishPackage(context: SdkGeneratorContext): Promise<void> {
        return this.generate(context);
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
        if (context.isSelfHosted()) {
            await this.generateGitHub({ context });
        }
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        return await this.generate(context);
    }

    protected async generate(context: SdkGeneratorContext): Promise<void> {
        // Generate wire tests if enabled
        if (this.shouldGenerateWireTests(context)) {
            try {
                context.logger.info("Wire test generation enabled, generating tests...");

                const wireTestFiles = generateWireTests({ context });

                // Add generated test files to project
                for (const file of wireTestFiles) {
                    context.project.addSourceFiles(file);
                }

                context.logger.info(`Successfully generated ${wireTestFiles.length} wire test files`);
            } catch (error) {
                context.logger.error(`Failed to generate wire tests: ${error}`);
                // Continue with generation even if wire tests fail
                context.logger.warn("Continuing SDK generation without wire tests");
            }
        }

        await context.project.persist();
    }

    /**
     * Determine whether wire tests should be generated based on configuration and IR availability
     */
    private shouldGenerateWireTests(context: SdkGeneratorContext): boolean {
        // Check if wire tests are explicitly enabled
        if (!context.customConfig.include_wire_tests) {
            return false;
        }

        // Check if dynamic IR is available (required for wire tests)
        if (!context.ir.dynamic) {
            context.logger.warn("Wire tests requested but dynamic IR not available, skipping");
            return false;
        }

        // Check if there are any HTTP services with endpoints
        const hasHttpServices = Object.values(context.ir.services).some(
            (service) => service.endpoints && service.endpoints.length > 0
        );

        if (!hasHttpServices) {
            context.logger.warn("Wire tests requested but no HTTP services found, skipping");
            return false;
        }

        // Check if there are any endpoints with examples
        const hasEndpointsWithExamples = Object.values(context.ir.services).some((service) =>
            service.endpoints.some((endpoint) => {
                const dynamicEndpoint = context.ir.dynamic?.endpoints[endpoint.id];
                return dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0;
            })
        );

        if (!hasEndpointsWithExamples) {
            context.logger.warn("Wire tests requested but no endpoints with examples found, skipping");
            return false;
        }

        return true;
    }

    private async generateGitHub({ context }: { context: SdkGeneratorContext }): Promise<void> {
        await context.generatorAgent.pushToGitHub({ context });
    }
}
