import { GeneratorNotificationService } from "@fern-api/base-generator";
import { loggingExeca } from "@fern-api/logging-execa";
import { AbstractRubyGeneratorCli } from "@fern-api/ruby-base";
import { generateModels } from "@fern-api/ruby-model";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { HttpService, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SingleUrlEnvironmentGenerator } from "./environment/SingleUrlEnvironmentGenerator";
import { RootClientGenerator } from "./root-client/RootClientGenerator";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { SubPackageClientGenerator } from "./subpackage-client/SubPackageClientGenerator";
import { WrappedRequestGenerator } from "./wrapped-request/WrappedRequestGenerator";

export class SdkGeneratorCLI extends AbstractRubyGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
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
        const models = generateModels({ context });
        for (const file of models) {
            context.project.addRawFiles(file);
        }

        Object.entries(context.ir.subpackages).forEach(([subpackageId, subpackage]) => {
            const service = subpackage.service != null ? context.getHttpServiceOrThrow(subpackage.service) : undefined;
            // skip subpackages that have no endpoints (recursively)
            if (!context.subPackageHasEndpoints(subpackage)) {
                return;
            }

            const rootClient = new RootClientGenerator(context);
            context.project.addRawFiles(rootClient.generate());

            const subClient = new SubPackageClientGenerator({
                subpackageId,
                context,
                subpackage
            });
            context.project.addRawFiles(subClient.generate());

            if (subpackage.service != null && service != null) {
                this.generateRequests(context, service, subpackage.service);
            }
        });

        context.ir.environments?.environments._visit({
            singleBaseUrl: (value) => {
                context.logger.info("Visiting singleBaseUrl environment case.");
                const environments = new SingleUrlEnvironmentGenerator({
                    context,
                    singleUrlEnvironments: value
                });
                context.project.addRawFiles(environments.generate());
            },
            multipleBaseUrls: () => undefined,
            _other: () => undefined
        });

        await context.project.persist();

        try {
            await loggingExeca(context.logger, "rubocop", ["-A"], {
                cwd: context.project.absolutePathToOutputDirectory,
                doNotPipeOutput: true
            });
        } catch (_) {
            // It's okay if rubocop fails to run.
        }
    }

    private generateRequests(context: SdkGeneratorContext, service: HttpService, serviceId: string) {
        service.endpoints.forEach((endpoint) => {
            if (endpoint.sdkRequest != null && endpoint.sdkRequest.shape.type === "wrapper") {
                const wrappedRequestGenerator = new WrappedRequestGenerator({
                    wrapper: endpoint.sdkRequest.shape,
                    context,
                    endpoint,
                    serviceId
                });
                const wrappedRequest = wrappedRequestGenerator.generate();
                context.project.addRawFiles(wrappedRequest);
            }
        });
    }
}
