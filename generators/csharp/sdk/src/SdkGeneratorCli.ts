import { AbstractCsharpGeneratorCli, TestFileGenerator } from "@fern-api/csharp-codegen";
import { generateModels, generateTests } from "@fern-api/fern-csharp-model";
import { GeneratorNotificationService } from "@fern-api/generator-commons";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { HttpService, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { MultiUrlEnvironmentGenerator } from "./environment/MultiUrlEnvironmentGenerator";
import { SingleUrlEnvironmentGenerator } from "./environment/SingleUrlEnvironmentGenerator copy";
import { BaseApiExceptionGenerator } from "./error/BaseApiExceptionGenerator";
import { BaseExceptionGenerator } from "./error/BaseExceptionGenerator";
import { ErrorGenerator } from "./error/ErrorGenerator";
import { BaseOptionsGenerator } from "./options/BaseOptionsGenerator";
import { ClientOptionsGenerator } from "./options/ClientOptionsGenerator";
import { RequestOptionsGenerator } from "./options/RequestOptionsGenerator";
import { RootClientGenerator } from "./root-client/RootClientGenerator";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { SubPackageClientGenerator } from "./subpackage-client/SubPackageClientGenerator";
import { WrappedRequestGenerator } from "./wrapped-request/WrappedRequestGenerator";

export class SdkGeneratorCLI extends AbstractCsharpGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
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
            return this.validateCustomConfig(parsed);
        }
        return {};
    }

    private validateCustomConfig(customConfig: SdkCustomConfigSchema): SdkCustomConfigSchema {
        const baseExceptionClassName = customConfig["base-exception-class-name"];
        const baseApiExceptionClassName = customConfig["base-api-exception-class-name"];

        if (
            baseExceptionClassName &&
            baseApiExceptionClassName &&
            baseExceptionClassName === baseApiExceptionClassName
        ) {
            throw new Error("The 'base-api-exception-class-name' and 'base-exception-class-name' cannot be the same.");
        }

        return customConfig;
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

    private generateRequests(context: SdkGeneratorContext, service: HttpService, serviceId: string) {
        for (const endpoint of service.endpoints) {
            if (endpoint.sdkRequest != null && endpoint.sdkRequest.shape.type === "wrapper") {
                const wrappedRequestGenerator = new WrappedRequestGenerator({
                    wrapper: endpoint.sdkRequest.shape,
                    context,
                    endpoint,
                    serviceId
                });
                const wrappedRequest = wrappedRequestGenerator.generate();
                context.project.addSourceFiles(wrappedRequest);
            }
        }
    }

    protected async generate(context: SdkGeneratorContext): Promise<void> {
        const models = generateModels({ context });
        for (const file of models) {
            context.project.addSourceFiles(file);
        }
        const tests = generateTests({ context });
        for (const file of tests) {
            context.project.addTestFiles(file);
        }
        for (const [_, subpackage] of Object.entries(context.ir.subpackages)) {
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

        const baseOptionsGenerator = new BaseOptionsGenerator(context);

        const clientOptions = new ClientOptionsGenerator(context, baseOptionsGenerator);
        context.project.addSourceFiles(clientOptions.generate());

        const requestOptions = new RequestOptionsGenerator(context, baseOptionsGenerator);
        context.project.addSourceFiles(requestOptions.generate());

        const baseException = new BaseExceptionGenerator(context);
        context.project.addSourceFiles(baseException.generate());

        const baseApiException = new BaseApiExceptionGenerator(context);
        context.project.addSourceFiles(baseApiException.generate());

        for (const [_, _error] of Object.entries(context.ir.errors)) {
            const errorGenerator = new ErrorGenerator(context, _error);
            context.project.addSourceFiles(errorGenerator.generate());
        }

        const rootClient = new RootClientGenerator(context);
        context.project.addSourceFiles(rootClient.generate());

        const rootServiceId = context.ir.rootPackage.service;
        if (rootServiceId != null) {
            const service = context.getHttpServiceOrThrow(rootServiceId);
            this.generateRequests(context, service, rootServiceId);
        }

        context.ir.environments?.environments._visit({
            singleBaseUrl: (value) => {
                const environments = new SingleUrlEnvironmentGenerator({
                    context,
                    singleUrlEnvironments: value
                });
                context.project.addSourceFiles(environments.generate());
            },
            multipleBaseUrls: (value) => {
                const environments = new MultiUrlEnvironmentGenerator({
                    context,
                    multiUrlEnvironments: value
                });
                context.project.addSourceFiles(environments.generate());
            },
            _other: () => undefined
        });

        const testGenerator = new TestFileGenerator(context);
        const test = testGenerator.generate();
        context.project.addTestFiles(test);

        await context.project.persist();
    }
}
