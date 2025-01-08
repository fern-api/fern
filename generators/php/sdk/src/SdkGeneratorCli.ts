import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractPhpGeneratorCli } from "@fern-api/php-codegen";
import { generateModels, generateTraits } from "@fern-api/php-model";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { HttpService, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { WrappedEndpointRequestGenerator } from "./endpoint/request/WrappedEndpointRequestGenerator";
import { EnvironmentGenerator } from "./environment/EnvironmentGenerator";
import { BaseApiExceptionGenerator } from "./error/BaseApiExceptionGenerator";
import { BaseExceptionGenerator } from "./error/BaseExceptionGenerator";
import { RootClientGenerator } from "./root-client/RootClientGenerator";
import { SubPackageClientGenerator } from "./subpackage-client/SubPackageClientGenerator";

export class SdkGeneratorCLI extends AbstractPhpGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
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

    protected async publishPackage(context: SdkGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async generate(context: SdkGeneratorContext): Promise<void> {
        generateModels(context);
        generateTraits(context);
        this.generateRootClient(context);
        this.generateSubpackages(context);
        this.generateEnvironment(context);
        this.generateErrors(context);
        await context.project.persist();
    }

    private generateRootClient(context: SdkGeneratorContext) {
        const rootClient = new RootClientGenerator(context);
        context.project.addSourceFiles(rootClient.generate());

        const rootServiceId = context.ir.rootPackage.service;
        if (rootServiceId != null) {
            const service = context.getHttpServiceOrThrow(rootServiceId);
            this.generateRequests(context, service, rootServiceId);
        }
    }

    private generateSubpackages(context: SdkGeneratorContext) {
        for (const subpackage of Object.values(context.ir.subpackages)) {
            if (!context.shouldGenerateSubpackageClient(subpackage)) {
                continue;
            }

            const service = subpackage.service != null ? context.getHttpServiceOrThrow(subpackage.service) : undefined;
            const subClient = new SubPackageClientGenerator({
                context,
                subpackage,
                serviceId: subpackage.service,
                service
            });
            context.project.addSourceFiles(subClient.generate());

            if (subpackage.service != null && service != null) {
                this.generateRequests(context, service, subpackage.service);
            }
        }
    }

    private generateRequests(context: SdkGeneratorContext, service: HttpService, serviceId: string) {
        for (const endpoint of service.endpoints) {
            if (endpoint.sdkRequest != null && endpoint.sdkRequest.shape.type === "wrapper") {
                const generator = new WrappedEndpointRequestGenerator({
                    wrapper: endpoint.sdkRequest.shape,
                    context,
                    endpoint,
                    serviceId
                });
                const wrappedEndpointRequest = generator.generate();
                context.project.addSourceFiles(wrappedEndpointRequest);
            }
        }
    }

    private generateEnvironment(context: SdkGeneratorContext) {
        const environmentGenerator = new EnvironmentGenerator(context);
        environmentGenerator.generate();
    }

    private generateErrors(context: SdkGeneratorContext) {
        const baseException = new BaseExceptionGenerator(context);
        context.project.addSourceFiles(baseException.generate());

        const baseApiException = new BaseApiExceptionGenerator(context);
        context.project.addSourceFiles(baseApiException.generate());
    }
}
